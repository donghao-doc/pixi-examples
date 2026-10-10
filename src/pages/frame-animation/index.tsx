import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { createFrameAnimationScene } from './scene'
import type { FrameAnimationScene } from './scene'
import './index.scss'

/** 展示许愿池序列帧动画，管理资源加载、投币交互和场景生命周期 */
function FrameAnimationPage() {
  const hostRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<FrameAnimationScene | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [progress, setProgress] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const percentage = Math.floor(progress * 100)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const controller = new AbortController()

    void createFrameAnimationScene({
      host,
      signal: controller.signal,
      onProgress: setProgress,
      onPlayingChange: setPlaying,
    }).then((scene) => {
      if (controller.signal.aborted) {
        scene?.destroy()
        return
      }
      sceneRef.current = scene ?? null
      setStatus('ready')
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return
      controller.abort()
      console.error('序列帧动画初始化失败', error)
      setStatus('error')
    })

    return () => {
      controller.abort()
      sceneRef.current?.destroy()
      sceneRef.current = null
    }
  }, [attempt])

  /** 清空页面状态并重新加载场景，已加载的纹理会复用缓存 */
  function retry() {
    setStatus('loading')
    setProgress(0)
    setPlaying(false)
    setAttempt((value) => value + 1)
  }

  return (
    <main className="frame-animation-page">
      <header className="frame-animation-header">
        <Link className="frame-animation-back" to="/">← 返回首页</Link>
        <span className="frame-animation-label">PIXI.JS / 02</span>
      </header>

      <section className="frame-animation-content" aria-label="序列帧动画">
        <h1 className="frame-animation-title">许愿池</h1>
        <p className="frame-animation-description">投下一枚硬币，许下一个心愿</p>

        <div className="frame-animation-frame">
          <div
            className="frame-animation-canvas"
            ref={hostRef}
            role="img"
            aria-label="循环流动的许愿池与旋转硬币，投币后播放硬币落下动画"
          />
          {status === 'ready' && (
            <button
              className="frame-animation-wish"
              type="button"
              disabled={playing}
              onClick={() => sceneRef.current?.play()}
            >
              {playing ? '心愿投递中…' : '投币许愿'}
            </button>
          )}
          {status === 'loading' && (
            <div className="frame-animation-overlay" role="status">
              <p>{percentage === 100 ? '正在准备画布…' : `正在加载动画 ${percentage}%`}</p>
              <progress max={100} value={percentage} aria-label="序列帧加载进度" />
            </div>
          )}
          {status === 'error' && (
            <div className="frame-animation-overlay" role="alert">
              <p>动画加载失败，请重试或检查浏览器是否支持 WebGL。</p>
              <button className="frame-animation-retry" type="button" onClick={retry}>
                重新加载
              </button>
            </div>
          )}
        </div>

        <p className="frame-animation-hint" role="status">
          {status === 'ready'
            ? playing ? '硬币正在落下，请稍候' : '点击旋转硬币或「投币许愿」开始动画'
            : '许愿池 · 旋转硬币 · 投币动画'}
        </p>
      </section>
    </main>
  )
}

export default FrameAnimationPage
