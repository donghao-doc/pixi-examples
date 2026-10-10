import type { RouteObject } from 'react-router'
import HomePage from '@/pages/home'
import NotFoundPage from '@/pages/not-found'

/** 应用路由表，集中维护页面路径及对应组件 */
export const routes: RouteObject[] = [
  {
    path: '/',
    Component: HomePage,
  },
  {
    path: '*',
    Component: NotFoundPage,
  },
]
