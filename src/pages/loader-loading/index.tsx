import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { loadLoadingResources, LOADING_RESOURCE_COUNT } from './loader'
import './index.scss'

/** 展示 Pixi 资源加载进度，并管理完成、失败重试和页面卸载 */
function LoaderLoadingPage() {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)
  const percentage = Math.floor(progress * 100)
  const loadedCount = Math.round(progress * LOADING_RESOURCE_COUNT)

  useEffect(() => {
    const controller = new AbortController()

    void loadLoadingResources({
      signal: controller.signal,
      onProgress: setProgress,
    }).then(() => {
      if (controller.signal.aborted) return
      setProgress(1)
      setStatus('ready')
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return
      // 失败后忽略同一批剩余资源的回调，保留出错时的进度
      controller.abort()
      console.error('资源加载失败', error)
      setStatus('error')
    })

    return () => controller.abort()
  }, [attempt])

  /** 重新加载失败资源，已成功加载的文件由 Pixi 缓存复用 */
  function retry() {
    setProgress(0)
    setStatus('loading')
    setAttempt((value) => value + 1)
  }

  return (
    <main className="loader-loading-page">
      <header className="loader-loading-header">
        <Link className="loader-loading-back" to="/">← 返回首页</Link>
        <span className="loader-loading-label">PIXI.JS / 03</span>
      </header>

      <section className="loader-loading-content" aria-labelledby="loader-loading-title">
        <p className="loader-loading-eyebrow">许愿池 · 旋转硬币 · 投币动画</p>
        <h1 className="loader-loading-title" id="loader-loading-title">资源加载</h1>
        <p className="loader-loading-percentage" aria-hidden="true">
          {percentage}<span>%</span>
        </p>
        <progress
          className="loader-loading-progress"
          max={1}
          value={progress}
          aria-label="资源加载进度"
          aria-valuetext={`已加载 ${loadedCount} / ${LOADING_RESOURCE_COUNT} 个资源`}
        />
        <div className="loader-loading-details">
          <p className="loader-loading-status" role="status">
            {status === 'ready' ? '加载完成' : status === 'error' ? '加载失败' : '加载中…'}
          </p>
          <span>{loadedCount} / {LOADING_RESOURCE_COUNT}</span>
        </div>

        {status === 'error' && (
          <div className="loader-loading-result" role="alert">
            <p>部分资源加载失败，请检查网络后重试。</p>
            <button className="loader-loading-action" type="button" onClick={retry}>
              重新加载
            </button>
          </div>
        )}
        {status === 'ready' && (
          <div className="loader-loading-result">
            <p>资源已就绪，去许愿池看看吧。</p>
            <Link className="loader-loading-action" to="/frame-animation">
              查看序列帧动画 ↗
            </Link>
          </div>
        )}
      </section>
    </main>
  )
}

export default LoaderLoadingPage
