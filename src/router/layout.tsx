import { Suspense, useDeferredValue } from 'react'
import { useOutlet } from 'react-router'
import RouteLoading from '@/components/route-loading'

/** 保留已显示的页面，直到目标页面就绪，并在等待期间叠加加载提示 */
function RouteLayout() {
  const outlet = useOutlet()
  // 延迟提交目标页面，让懒加载挂起时仍能透过遮罩看到上一页
  const deferredOutlet = useDeferredValue(outlet)
  const isPending = outlet !== deferredOutlet

  return (
    <>
      <div inert={isPending} aria-busy={isPending}>
        <Suspense fallback={<RouteLoading />}>{deferredOutlet}</Suspense>
      </div>
      {isPending && <RouteLoading />}
    </>
  )
}

export default RouteLayout
