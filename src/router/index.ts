import { createBrowserRouter } from 'react-router'
import { routes } from './routes'

/** 浏览器路由实例，在组件外创建以避免渲染时重复初始化 */
export const router = createBrowserRouter(routes)
