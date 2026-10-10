import './index.scss'

/** 在透明全屏遮罩中央展示页面加载提示 */
function RouteLoading() {
  return (
    <div className="route-loading" role="status" aria-live="polite">
      <div className="route-loading-toast">
        <span className="route-loading-spinner" aria-hidden="true" />
        <span>页面加载中…</span>
      </div>
    </div>
  )
}

export default RouteLoading
