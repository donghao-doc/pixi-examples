import { AnimatedSprite, Application, Assets } from 'pixi.js'
import type { Texture } from 'pixi.js'

const STAGE_WIDTH = 750
const STAGE_HEIGHT = 1334
const POOL_FRAMES = 20
const ICON_FRAMES = 80
const COIN_FRAMES = 38
const TOTAL_FRAMES = POOL_FRAMES + ICON_FRAMES + COIN_FRAMES

/** 序列帧场景的挂载位置、取消信号及页面状态通知 */
interface SceneOptions {
  /** 画布容器，按其实际宽度等比例适配 */
  host: HTMLDivElement
  /** 页面卸载或重试后停止初始化 */
  signal: AbortSignal
  /** 图片加载完成比例，范围为 0～1 */
  onProgress: (progress: number) => void
  /** 投币开始和结束时同步页面按钮状态 */
  onPlayingChange: (playing: boolean) => void
}

/** 页面可调用的序列帧动画操作 */
export interface FrameAnimationScene {
  /** 从第一帧播放一次投币动画，播放期间忽略重复操作 */
  play: () => void
  /** 停止动画并释放画布、观察器及场景资源 */
  destroy: () => void
}

/** 按数字顺序生成本地序列帧地址，兼容 Vite 的部署基础路径 */
function createFrameUrls(folder: string, count: number, extension: string) {
  return Array.from({ length: count }, (_, index) => (
    `${import.meta.env.BASE_URL}images/frame-animation/${folder}/${folder}${index + 1}.${extension}`
  ))
}

/** 使用独立的应用时钟驱动动画，避免页面卸载后共享时钟继续运行 */
function createAnimation(textures: Texture[], speed: number, loop = true) {
  return new AnimatedSprite({
    textures,
    animationSpeed: speed,
    loop,
    autoUpdate: false,
  })
}

/**
 * 预加载参考页的三组序列帧并创建 Pixi.js 8 场景
 * 支持异步取消、单次投币播放及重复销毁，共享纹理由 Assets 保留以便再次进入
 */
export async function createFrameAnimationScene({
  host,
  signal,
  onProgress,
  onPlayingChange,
}: SceneOptions): Promise<FrameAnimationScene | undefined> {
  const urls = [
    ...createFrameUrls('pool', POOL_FRAMES, 'jpg'),
    ...createFrameUrls('icon', ICON_FRAMES, 'png'),
    ...createFrameUrls('coin', COIN_FRAMES, 'png'),
  ]
  const textures: Texture[] = []
  let loaded = 0

  // 分批加载，限制同时解码的图片数；取消后不再发起下一批请求
  for (let offset = 0; offset < urls.length; offset += 8) {
    if (signal.aborted) return
    const batch = await Promise.all(urls.slice(offset, offset + 8).map(async (url) => {
      const texture = await Assets.load<Texture>(url)
      loaded += 1
      if (!signal.aborted) onProgress(loaded / TOTAL_FRAMES)
      return texture
    }))
    textures.push(...batch)
  }
  if (signal.aborted) return

  const app = new Application()
  await app.init({
    width: STAGE_WIDTH,
    height: STAGE_HEIGHT,
    background: '#d4d1cb',
    antialias: true,
    autoDensity: true,
    autoStart: false,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    preference: 'webgl',
  })

  // React StrictMode 重挂载和快速离开时，释放刚初始化完成的实例
  if (signal.aborted) {
    app.destroy(true, { children: true })
    return
  }

  const pool = createAnimation(textures.slice(0, POOL_FRAMES), 0.16)
  pool.width = STAGE_WIDTH
  pool.height = STAGE_HEIGHT

  const icon = createAnimation(
    textures.slice(POOL_FRAMES, POOL_FRAMES + ICON_FRAMES),
    0.2,
  )
  icon.position.set(STAGE_WIDTH - icon.width, STAGE_HEIGHT * 0.2)
  icon.eventMode = 'static'
  icon.cursor = 'pointer'

  const coin = createAnimation(textures.slice(POOL_FRAMES + ICON_FRAMES), 0.2, false)
  // 参考页在 375px 画布中使用半尺寸，这里按 750px 坐标系保留原尺寸
  coin.x = (STAGE_WIDTH - coin.width) / 2
  coin.visible = false
  app.stage.addChild(pool, icon, coin)

  let destroyed = false
  let playing = false
  let resizeFrame = 0

  /** 防止连续点击重启动画，完成后恢复下一次投币 */
  function play() {
    if (destroyed || playing) return
    playing = true
    coin.visible = true
    coin.gotoAndPlay(0)
    onPlayingChange(true)
  }

  coin.onComplete = () => {
    coin.visible = false
    coin.gotoAndStop(0)
    playing = false
    onPlayingChange(false)
  }
  icon.on('pointertap', play)

  /** 保持参考稿比例，画布尺寸和交互坐标随容器一起缩放 */
  function resize() {
    if (destroyed || !host.clientWidth) return
    const scale = host.clientWidth / STAGE_WIDTH
    app.renderer.resize(host.clientWidth, STAGE_HEIGHT * scale)
    app.stage.scale.set(scale)
  }

  /** 将尺寸更新延后到下一帧，避免在观察器通知中再次触发布局 */
  function requestResize() {
    if (destroyed || resizeFrame) return
    resizeFrame = window.requestAnimationFrame(() => {
      resizeFrame = 0
      resize()
    })
  }

  /** 后台标签页暂停时钟，返回后继续尚未结束的动画 */
  function syncVisibility() {
    if (destroyed) return
    if (document.hidden) app.stop()
    else app.start()
  }

  app.canvas.setAttribute('aria-hidden', 'true')
  host.appendChild(app.canvas)
  const resizeObserver = new ResizeObserver(requestResize)
  resizeObserver.observe(host)
  document.addEventListener('visibilitychange', syncVisibility)
  app.ticker.add((ticker) => {
    pool.update(ticker)
    icon.update(ticker)
    if (playing) coin.update(ticker)
  })
  pool.play()
  icon.play()
  resize()
  syncVisibility()

  /** 销毁应用时钟及精灵，保留 Assets 共享纹理供后续页面实例复用 */
  function destroy() {
    if (destroyed) return
    destroyed = true
    window.cancelAnimationFrame(resizeFrame)
    resizeObserver.disconnect()
    document.removeEventListener('visibilitychange', syncVisibility)
    app.destroy(true, { children: true })
  }

  return { play, destroy }
}
