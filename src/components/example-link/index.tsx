import type { ReactNode } from 'react'
import { Link } from 'react-router'
import type { LinkProps } from 'react-router'
import './index.scss'

/** 首页及其他页面中复用的案例入口配置 */
export interface ExampleLinkProps {
  /** 点击后进入的案例路由，支持路径字符串或路由位置对象 */
  to: LinkProps['to']
  /** 案例入口的可见内容，同时作为链接的可访问名称 */
  children: ReactNode
}

/** 统一案例入口的按钮外观、方向标识和路由跳转行为 */
function ExampleLink({ to, children }: ExampleLinkProps) {
  return (
    <Link className="example-link" to={to}>
      <span>{children}</span>
      <span aria-hidden="true">↗</span>
    </Link>
  )
}

export default ExampleLink
