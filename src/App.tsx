import { RouterProvider } from 'react-router/dom'
import { router } from '@/router'

/**
 * 同步更新路由状态，由路由布局保留上一页并展示加载提示
 */
function App() {
  return <RouterProvider router={router} useTransitions={false} />
}

export default App
