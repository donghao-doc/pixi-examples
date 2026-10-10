# pixi-examples

基于 React、TypeScript 和 Vite 的移动端 H5 项目，已配置 React Router、SCSS 和 rem 适配。

## 本地开发

```sh
pnpm install
pnpm dev
```

## 项目检查与构建

```sh
# 执行 ESLint 检查
pnpm lint

# 执行 TypeScript 检查并构建生产版本
pnpm build

# 本地预览构建结果
pnpm preview
```

## 主要文件

- `src/main.tsx`：React 应用挂载入口
- `src/App.tsx`：应用根组件，挂载路由页面
- `src/router/index.ts`：浏览器路由实例
- `src/router/routes.ts`：集中维护应用路由表
- `src/pages/home/index.tsx`：首页入口
- `src/pages/not-found/index.tsx`：404 页面
- `index.html`：HTML 入口
- `vite.config.ts`：Vite 配置
- `postcss.config.js`：px 转 rem 配置
- `src/styles/global.scss`：全局基础样式

## 路径别名

`@` 指向 `src` 目录，跨模块导入优先使用别名，同一模块内部可使用相对路径。

```ts
import App from '@/App'
```

别名同时配置在 `vite.config.ts` 和 `tsconfig.app.json` 中，修改映射时需保持两处一致。

## 路由与页面

| 路径 | 页面 |
| --- | --- |
| `/` | 首页 |
| `/scratch-card` | 刮刮卡互动示例 |
| `/frame-animation` | 许愿池序列帧动画示例 |
| `/loader-loading` | Pixi 资源加载进度示例 |
| `*` | 404 页面，提供返回首页的链接 |

新增页面时，在 `src/pages` 下创建页面目录，并在 `src/router/routes.ts` 中注册路径和组件。

路由使用浏览器 History 模式。生产部署时，服务器需将页面路径回退到 `index.html`，以支持直接访问和刷新页面。

### 序列帧动画

`src/pages/frame-animation/scene.ts` 使用 Pixi.js 8 的 `Assets` 预加载图片，通过 `AnimatedSprite` 播放动画：许愿池 20 帧循环播放，旋转硬币 80 帧循环播放，投币 38 帧播放一次。点击旋转硬币或「投币许愿」按钮触发投币，播放期间忽略重复操作，完成后可再次播放。

画布按 750 × 1334 的参考稿比例适配容器。页面提供加载进度及失败重试，离开页面时清理场景，后台标签页暂停动画。

图片保存在 `public/images/frame-animation`，来源为参考 `FrameAnimation.vue` 使用的 `https://morefun-active.oss-cn-beijing.aliyuncs.com/farfetch/animation/` 下的 `pool`、`icon` 和 `coin` 序列帧，运行时从本地静态目录读取。

### 资源加载

`src/pages/loader-loading` 参考 `LoaderLoading.vue`，使用 Pixi.js 8 的 `Assets.load` 回调展示真实加载进度、百分比和已加载资源数量。图片清单由 `src/assets/frame-animation.ts` 统一维护，与序列帧动画共用现有的 138 张本地图片，另加载 1 个远程中文字体，共 139 个资源。

加载页采用开源字体「站酷小薇体（ZCOOL XiaoWei）」，通过 Pixi 的 `data.family` 注册为 `ZCOOL XiaoWei`，字体就绪后应用于整页，包括页头、标题、进度数字、状态文字、链接与按钮，无需额外声明 `@font-face` 或安装字体依赖。字体使用 Fontsource 5.3.0 提供的 WOFF2 简体中文子集，约 2.1 MiB；未加载或未覆盖的字符使用系统衬线字体。字体与图片均计入加载进度，远程字体失败时会显示加载失败并允许重试，因此首次加载时间受 CDN 和网络状况影响。

- [远程字体文件（固定版本）](https://cdn.jsdelivr.net/npm/@fontsource/zcool-xiaowei@5.3.0/files/zcool-xiaowei-chinese-simplified-400-normal.woff2)
- [Google Fonts 官方字体目录](https://github.com/google/fonts/tree/main/ofl/zcoolxiaowei)
- [官方 SIL Open Font License 1.1](https://github.com/google/fonts/blob/main/ofl/zcoolxiaowei/OFL.txt)
- 完整版权声明和许可副本保存在 `licenses/ZCOOL-XiaoWei-OFL.txt`

每批加载 8 个资源，进度按加载完成的文件数统计，不代表下载字节比例。全部完成后可进入序列帧动画页；失败时保留当前进度并提供重试。离开页面后忽略进行中的回调并停止后续批次，已加载资源保留在 Pixi 共享缓存中，重试或再次进入时可能很快完成。

## 移动端适配与样式

使用 `amfe-flexible` 设置根字号，使用 `postcss-pxtorem` 将 SCSS 编译后的 px 自动转换为 rem。Vite 在开发和生产构建中均会读取 `postcss.config.js`。

- 默认设计稿宽度为 **375px**，样式直接按设计稿中的 px 编写
- 根字号等于视口宽度 ÷ 10，375px 视口下 `1rem = 37.5px`
- PostCSS 的 `rootValue` 为 `37.5`，例如 `75px` 转换为 `2rem`
- 视口宽度变化及从浏览器页面缓存恢复时，`amfe-flexible` 自动重新计算根字号
- 所有 CSS 属性中的 px 均参与转换，小于 `2px` 的值保持原样，便于保留细边框
- 媒体查询断点保持 px，`node_modules` 中的第三方样式不参与转换
- 选择器中包含 `.no-rem` 的规则不参与转换；单个声明需要保留 px 时，可使用 `Px` 或 `PX`

```scss
.example {
  width: 75px; // 编译为 2rem
  padding: 16px;
  border: 1px solid #ddd; // 保留 1px
  border-radius: 4Px; // 明确保留 4px
}
```

全局正文使用 rem 字号，并覆盖 `amfe-flexible` 根据 DPR 设置的行内字号，避免正文大小随设备像素比变化。样式文件使用 `.scss` 或 `.module.scss`，与对应组件放在相近目录。

如果采用 750px 设计稿，并直接按该设计稿的尺寸编写样式，应将 `rootValue` 改为 `75`，同时调整全局正文等原有样式的 px 值。适配按整个视口宽度缩放，当前未设置平板或桌面视口的最大宽度。

PostCSS 仅处理样式文件，不转换 JSX 行内样式或 JavaScript 中的数值。
