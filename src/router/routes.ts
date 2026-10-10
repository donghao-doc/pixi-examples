import type { RouteObject } from 'react-router'
import HomePage from '@/pages/home'
import NotFoundPage from '@/pages/not-found'
import { createLazyRoute } from './lazy-route'

/** 应用路由表，首页和兜底页面直接加载，示例页面按访问需求加载 */
export const routes: RouteObject[] = [
  {
    path: '/',
    Component: HomePage,
  },
  {
    path: '/scratch-card',
    lazy: createLazyRoute(() => import('@/pages/scratch-card')),
  },
  {
    path: '/frame-animation',
    lazy: createLazyRoute(() => import('@/pages/frame-animation')),
  },
  {
    path: '/loader-loading',
    lazy: createLazyRoute(() => import('@/pages/loader-loading')),
  },
  {
    path: '*',
    Component: NotFoundPage,
  },
]
