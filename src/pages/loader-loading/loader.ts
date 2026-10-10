import { Assets } from 'pixi.js'
import type { UnresolvedAsset } from 'pixi.js'
import { FRAME_ANIMATION_ASSETS } from '@/assets/frame-animation'

// 固定 Fontsource 版本；字体使用 OFL 1.1，完整许可保存在 licenses 目录
const resources: UnresolvedAsset[] = [
  {
    src: 'https://cdn.jsdelivr.net/npm/@fontsource/zcool-xiaowei@5.3.0/files/zcool-xiaowei-chinese-simplified-400-normal.woff2',
    data: {
      family: 'ZCOOL XiaoWei',
      weights: ['400'],
      display: 'swap',
    },
  },
  ...[
    ...FRAME_ANIMATION_ASSETS.pool,
    ...FRAME_ANIMATION_ASSETS.icon,
    ...FRAME_ANIMATION_ASSETS.coin,
  ].map((src) => ({ src })),
]
const BATCH_SIZE = 8

/** 加载进度的资源总数，按成功加载的文件数统计完成比例 */
export const LOADING_RESOURCE_COUNT = resources.length

/** 加载页传入的生命周期控制与进度通知 */
interface LoadingOptions {
  /** 页面离开或加载失败后停止后续批次，并忽略正在加载的回调 */
  signal: AbortSignal
  /** Pixi 资源加载完成比例，范围为 0～1，不代表下载字节比例 */
  onProgress: (progress: number) => void
}

/**
 * 使用 Pixi Assets 分批预加载远程字体与动画图片，并汇总每批真实加载进度
 * 复用共享缓存；取消时不卸载纹理，避免影响动画页面和其他加载实例
 */
export async function loadLoadingResources({ signal, onProgress }: LoadingOptions) {
  for (let offset = 0; offset < resources.length; offset += BATCH_SIZE) {
    if (signal.aborted) return
    const batch = resources.slice(offset, offset + BATCH_SIZE)
    await Assets.load(batch, (progress) => {
      if (signal.aborted) return
      onProgress((offset + progress * batch.length) / resources.length)
    })
  }
}
