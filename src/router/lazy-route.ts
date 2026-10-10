import type { ComponentType } from 'react'
import type { LazyRouteFunction, RouteObject } from 'react-router'

/** 默认导出页面组件的路由模块 */
interface RoutePageModule {
  /** 路由匹配后渲染的页面组件 */
  default: ComponentType
}

/**
 * 将页面模块的默认导出转换为 React Router 的懒加载配置
 * @param importPage 页面导入函数，应使用明确的 import() 路径以支持构建拆包
 * @returns 路由匹配时才执行的页面加载函数
 */
export function createLazyRoute(
  importPage: () => Promise<RoutePageModule>,
): LazyRouteFunction<RouteObject> {
  return async () => {
    const { default: Component } = await importPage()
    return { Component }
  }
}
