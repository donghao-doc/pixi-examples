import { RouterProvider } from 'react-router/dom'
import { router } from '@/router'

/**
 * 应用根组件，通过路由实例渲染当前页面
 */
function App() {
  return <RouterProvider router={router} />
}

export default App
