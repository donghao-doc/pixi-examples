import {
  Application,
  Assets,
  Container,
  Graphics,
  Sprite,
  Text,
} from 'pixi.js'
import type { Texture } from 'pixi.js'
import backgroundUrl from '@/assets/images/scratch-card/background.png'
import textLineUrl from '@/assets/images/scratch-card/text-line.png'
import coverUrl from '@/assets/images/scratch-card/cover.png'

const STAGE_WIDTH = 375
const STAGE_HEIGHT = 250
const BRUSH_RADIUS = 20
const SAMPLE_STEP = 5
const REVEAL_THRESHOLD = 0.65

/** 刮开后展示的诗句，同时用于画布内容与辅助技术播报 */
export const SCRATCH_CARD_TEXT = '人有悲欢离合，月有阴晴圆缺，此事古难全'

/** 页面与 Pixi.js 场景之间的生命周期及状态通知约定 */
interface SceneOptions {
  /** 容纳画布的元素，画布按其实际宽度适配 */
  host: HTMLDivElement
  /** 页面卸载后忽略异步初始化结果 */
  signal: AbortSignal
  /** 场景初始化完成后通知页面开放操作 */
  onReady: () => void
  /** 通知已刮开比例，范围为 0～1，完成时为 1 */
  onProgress: (progress: number) => void
}

/** 页面可调用的刮刮卡场景操作 */
export interface ScratchCardScene {
  /** 恢复覆盖层并清空刮擦记录 */
  reset: () => void
  /** 直接揭示内容，供键盘和辅助技术使用 */
  reveal: () => void
  /** 移除监听器并释放画布、GPU 纹理与绘图资源 */
  destroy: () => void
}

/** 刮擦轨迹在设计稿坐标系中的位置 */
interface ScratchPoint {
  /** 相对画布左边缘的水平距离 */
  x: number
  /** 相对画布上边缘的垂直距离 */
  y: number
}

/** 按参考设计的高度缩放图片，并水平居中 */
function createCardSprite(texture: Texture) {
  const sprite = new Sprite(texture)
  sprite.scale.set(STAGE_HEIGHT / texture.height)
  sprite.x = (STAGE_WIDTH - sprite.width) / 2
  return sprite
}

/** 创建参考页面的背景、文本线与诗句内容 */
function createContent(background: Texture, textLine: Texture) {
  const content = new Container()
  const backgroundSprite = createCardSprite(background)
  const lineSprite = new Sprite(textLine)
  lineSprite.width = backgroundSprite.width * 0.7
  lineSprite.scale.y = lineSprite.scale.x
  lineSprite.x = (STAGE_WIDTH - lineSprite.width) / 2
  lineSprite.y = STAGE_HEIGHT * 0.5

  const text = new Text({
    text: SCRATCH_CARD_TEXT,
    style: {
      fontFamily: 'serif',
      fontSize: 16,
      fill: '#173e32',
      align: 'center',
      wordWrap: true,
      wordWrapWidth: lineSprite.width,
      breakWords: true,
      lineHeight: 35,
    },
  })
  text.anchor.set(0.5, 0)
  text.position.set(STAGE_WIDTH / 2, lineSprite.y - lineSprite.height / 1.1)
  content.addChild(backgroundSprite, lineSprite, text)
  return content
}

/**
 * 初始化 Pixi.js 刮刮卡，使用 Graphics 遮罩保存揭示区域
 * 异步期间支持取消，销毁函数可重复调用
 */
export async function createScratchCardScene({
  host,
  signal,
  onReady,
  onProgress,
}: SceneOptions): Promise<ScratchCardScene | undefined> {
  const [background, textLine, cover] = await Promise.all([
    Assets.load<Texture>(backgroundUrl),
    Assets.load<Texture>(textLineUrl),
    Assets.load<Texture>(coverUrl),
  ])
  if (signal.aborted) return

  const app = new Application()
  await app.init({
    width: STAGE_WIDTH,
    height: STAGE_HEIGHT,
    backgroundAlpha: 0,
    antialias: true,
    autoDensity: true,
    autoStart: false,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    preference: 'webgl',
  })

  // StrictMode 重挂载或快速离开页面时，销毁刚完成初始化的实例
  if (signal.aborted) {
    app.destroy(true, { children: true })
    return
  }

  const coverSprite = createCardSprite(cover)
  const content = createContent(background, textLine)
  const scratchMask = new Graphics()
  app.stage.addChild(coverSprite, content, scratchMask)
  content.mask = scratchMask

  const canvas = app.canvas
  canvas.setAttribute('aria-hidden', 'true')
  host.appendChild(canvas)

  // 仅统计圆形卡片内部采样点，重复刮同一位置不增加完成度
  const samples: ScratchPoint[] = []
  for (let y = SAMPLE_STEP / 2; y < STAGE_HEIGHT; y += SAMPLE_STEP) {
    for (let x = SAMPLE_STEP / 2; x < STAGE_WIDTH; x += SAMPLE_STEP) {
      if (Math.hypot(x - STAGE_WIDTH / 2, y - STAGE_HEIGHT / 2) <= 120) {
        samples.push({ x, y })
      }
    }
  }
  const scratched = new Uint8Array(samples.length)
  let scratchedCount = 0
  let lastPercentage = 0
  let activePointer: number | null = null
  let lastPoint: ScratchPoint | null = null
  let completed = false
  let destroyed = false
  let renderFrame = 0

  /** 按容器尺寸适配画布，并将同一帧中的多次更新合并渲染 */
  function requestRender() {
    if (renderFrame || destroyed) return
    renderFrame = window.requestAnimationFrame(() => {
      renderFrame = 0
      if (destroyed || !host.clientWidth) return
      const width = host.clientWidth
      const scale = width / STAGE_WIDTH
      if (app.screen.width !== width) {
        app.renderer.resize(width, STAGE_HEIGHT * scale)
      }
      app.stage.scale.set(scale)
      app.render()
    })
  }

  /** 释放当前指针捕获，取消后续轨迹连接 */
  function stopScratching() {
    if (activePointer !== null && canvas.hasPointerCapture(activePointer)) {
      canvas.releasePointerCapture(activePointer)
    }
    activePointer = null
    lastPoint = null
  }

  /** 移除遮罩，一次性显示完整内容 */
  function reveal() {
    if (destroyed || completed) return
    completed = true
    stopScratching()
    coverSprite.visible = false
    content.mask = null
    scratchMask.visible = false
    onProgress(1)
    requestRender()
  }

  /** 将浏览器指针坐标映射回设计稿尺寸，兼容响应式缩放 */
  function getPoint(event: PointerEvent): ScratchPoint {
    const bounds = canvas.getBoundingClientRect()
    return {
      x: ((event.clientX - bounds.left) / bounds.width) * STAGE_WIDTH,
      y: ((event.clientY - bounds.top) / bounds.height) * STAGE_HEIGHT,
    }
  }

  /** 绘制连续笔刷线段，并估算线段覆盖的卡片面积 */
  function scratch(point: ScratchPoint) {
    const start = lastPoint ?? point
    const dx = point.x - start.x
    const dy = point.y - start.y
    const lengthSquared = dx * dx + dy * dy

    const previousCount = scratchedCount
    for (let index = 0; index < samples.length; index += 1) {
      if (scratched[index]) continue
      const sample = samples[index]
      const projection = lengthSquared === 0
        ? 0
        : Math.max(
          0,
          Math.min(
            1,
            ((sample.x - start.x) * dx + (sample.y - start.y) * dy) / lengthSquared,
          ),
        )
      const distance = Math.hypot(
        sample.x - start.x - projection * dx,
        sample.y - start.y - projection * dy,
      )
      if (distance <= BRUSH_RADIUS) {
        scratched[index] = 1
        scratchedCount += 1
      }
    }

    const progress = scratchedCount / samples.length
    if (progress >= REVEAL_THRESHOLD) {
      reveal()
      return
    }

    // 仅追加覆盖新采样点的笔画，避免重复涂抹无限增长遮罩几何数据
    if (scratchedCount !== previousCount) {
      if (lengthSquared > 0) {
        scratchMask.moveTo(start.x, start.y).lineTo(point.x, point.y).stroke({
          color: 0xffffff,
          width: BRUSH_RADIUS * 2,
          cap: 'round',
        })
      }
      scratchMask.circle(point.x, point.y, BRUSH_RADIUS).fill(0xffffff)
    }
    const percentage = Math.floor(progress * 100)
    if (percentage !== lastPercentage) {
      lastPercentage = percentage
      onProgress(progress)
    }
    lastPoint = point
    requestRender()
  }

  /** 只接受主键和单个指针，按下即开始揭示 */
  function handlePointerDown(event: PointerEvent) {
    if (completed || activePointer !== null || event.button !== 0) return
    activePointer = event.pointerId
    canvas.setPointerCapture(event.pointerId)
    scratch(getPoint(event))
  }

  /** 仅在按住指针时刮擦，悬停不产生轨迹 */
  function handlePointerMove(event: PointerEvent) {
    if (event.pointerId !== activePointer || completed) return
    scratch(getPoint(event))
  }

  /** 松开或取消当前指针后结束本次刮擦 */
  function handlePointerEnd(event: PointerEvent) {
    if (event.pointerId === activePointer) stopScratching()
  }

  /** 清空遮罩和采样记录，恢复最初的覆盖状态 */
  function reset() {
    if (destroyed) return
    stopScratching()
    completed = false
    scratched.fill(0)
    scratchedCount = 0
    lastPercentage = 0
    coverSprite.visible = true
    scratchMask.clear()
    scratchMask.visible = true
    content.mask = scratchMask
    onProgress(0)
    requestRender()
  }

  const resizeObserver = new ResizeObserver(requestRender)
  resizeObserver.observe(host)
  canvas.addEventListener('pointerdown', handlePointerDown)
  canvas.addEventListener('pointermove', handlePointerMove)
  canvas.addEventListener('pointerup', handlePointerEnd)
  canvas.addEventListener('pointercancel', handlePointerEnd)
  canvas.addEventListener('lostpointercapture', handlePointerEnd)
  window.addEventListener('blur', stopScratching)
  requestRender()
  onReady()

  /** 移除事件并释放场景，保留 Assets 管理的共享图片缓存 */
  function destroy() {
    if (destroyed) return
    destroyed = true
    window.cancelAnimationFrame(renderFrame)
    stopScratching()
    resizeObserver.disconnect()
    canvas.removeEventListener('pointerdown', handlePointerDown)
    canvas.removeEventListener('pointermove', handlePointerMove)
    canvas.removeEventListener('pointerup', handlePointerEnd)
    canvas.removeEventListener('pointercancel', handlePointerEnd)
    canvas.removeEventListener('lostpointercapture', handlePointerEnd)
    window.removeEventListener('blur', stopScratching)
    app.destroy(true, { children: true, context: true })
  }

  return { reset, reveal, destroy }
}
