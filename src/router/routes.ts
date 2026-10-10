import { lazy } from 'react'
import type { RouteObject } from 'react-router'
import HomePage from '@/pages/home'
import NotFoundPage from '@/pages/not-found'
import RouteLayout from './layout'

/** 应用路由表，首页和兜底页面直接加载，示例页面按访问需求加载 */
export const routes: RouteObject[] = [
  {
    Component: RouteLayout,
    children: [
      {
        path: '/',
        Component: HomePage,
      },
      {
        path: '/scratch-card',
        Component: lazy(() => import('@/pages/scratch-card')),
      },
      {
        path: '/frame-animation',
        Component: lazy(() => import('@/pages/frame-animation')),
      },
      {
        path: '/loader-loading',
        Component: lazy(() => import('@/pages/loader-loading')),
      },
      {
        path: '*',
        Component: NotFoundPage,
      },
    ],
  },
]
