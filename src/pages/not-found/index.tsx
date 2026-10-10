import { Link } from 'react-router'

/**
 * 未匹配路由时展示提示，并提供返回首页的入口
 */
function NotFoundPage() {
  return (
    <main>
      <h1>404：页面不存在</h1>
      <Link to="/">返回首页</Link>
    </main>
  )
}

export default NotFoundPage
