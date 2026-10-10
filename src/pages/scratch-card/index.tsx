import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { createScratchCardScene, SCRATCH_CARD_TEXT } from './scene'
import type { ScratchCardScene } from './scene'
import './index.scss'

/** 展示刮刮卡示例，管理 Pixi.js 场景的初始化与卸载 */
function ScratchCardPage() {
  const hostRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<ScratchCardScene | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [progress, setProgress] = useState(0)
  const [attempt, setAttempt] = useState(0)
  const completed = progress === 1
  const percentage = Math.floor(progress * 100)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const controller = new AbortController()

    void createScratchCardScene({
      host,
      signal: controller.signal,
      onReady: () => setStatus('ready'),
      onProgress: setProgress,
    }).then((scene) => {
      if (controller.signal.aborted) {
        scene?.destroy()
        return
      }
      sceneRef.current = scene ?? null
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return
      console.error('刮刮卡初始化失败', error)
      setStatus('error')
    })

    return () => {
      controller.abort()
      sceneRef.current?.destroy()
      sceneRef.current = null
    }
  }, [attempt])

  /** 初始化失败后重新创建场景 */
  function retry() {
    setStatus('loading')
    setProgress(0)
    setAttempt((value) => value + 1)
  }

  return (
    <main className="scratch-card-page no-rem">
      <header className="scratch-card-header">
        <Link className="scratch-card-back" to="/">← 返回首页</Link>
        <span className="scratch-card-label">PIXI.JS / 01</span>
      </header>

      <section className="scratch-card-content" aria-labelledby="scratch-card-title">
        <p className="scratch-card-eyebrow">一张卡片，一点惊喜</p>
        <h1 id="scratch-card-title">刮开，遇见一句诗。</h1>
        <p className="scratch-card-description" id="scratch-card-instructions">
          按住鼠标或用手指涂抹卡片，刮开 65% 后将自动揭晓。
        </p>

        <div className="scratch-card-frame">
          <div
            className="scratch-card-canvas"
            ref={hostRef}
            role="img"
            aria-label={completed ? '已揭晓的诗句卡片' : '等待刮开的圆形卡片'}
            aria-describedby="scratch-card-instructions"
          />
          {status === 'loading' && (
            <p className="scratch-card-overlay" role="status">正在准备卡片…</p>
          )}
          {status === 'error' && (
            <div className="scratch-card-overlay" role="alert">
              <p>卡片加载失败，请重试或检查浏览器是否支持 WebGL。</p>
              <button className="scratch-card-button" type="button" onClick={retry}>
                重新加载
              </button>
            </div>
          )}
        </div>

        <div className="scratch-card-progress">
          <span>{completed ? '惊喜已揭晓' : '已刮开'}</span>
          <progress max={100} value={percentage} aria-label="卡片刮开进度" />
          <span>{percentage}%</span>
        </div>

        <p className="scratch-card-result" role="status">
          {completed
            ? SCRATCH_CARD_TEXT
            : '慢慢刮，藏着的诗句就会浮现。'}
        </p>

        <div className="scratch-card-actions">
          <button
            className="scratch-card-button"
            type="button"
            disabled={status !== 'ready'}
            onClick={() => sceneRef.current?.reset()}
          >
            再刮一次
          </button>
          <button
            className="scratch-card-reveal"
            type="button"
            disabled={status !== 'ready' || completed}
            onClick={() => sceneRef.current?.reveal()}
          >
            直接揭晓
          </button>
        </div>
      </section>
    </main>
  )
}

export default ScratchCardPage
