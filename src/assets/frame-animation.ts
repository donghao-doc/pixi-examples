/** 按数字顺序生成本地序列帧地址，兼容 Vite 的部署基础路径 */
function createFrameUrls(folder: string, count: number, extension: string) {
  return Array.from({ length: count }, (_, index) => (
    `${import.meta.env.BASE_URL}images/frame-animation/${folder}/${folder}${index + 1}.${extension}`
  ))
}

/** 许愿池动画资源清单，供动画场景与加载进度示例共用 */
export const FRAME_ANIMATION_ASSETS = {
  /** 按播放顺序排列的许愿池背景，共 20 帧 */
  pool: createFrameUrls('pool', 20, 'jpg'),
  /** 按播放顺序排列的旋转硬币，共 80 帧 */
  icon: createFrameUrls('icon', 80, 'png'),
  /** 按播放顺序排列的投币动画，共 38 帧 */
  coin: createFrameUrls('coin', 38, 'png'),
}
