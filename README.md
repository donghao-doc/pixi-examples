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
| `*` | 404 页面，提供返回首页的链接 |

新增页面时，在 `src/pages` 下创建页面目录，并在 `src/router/routes.ts` 中注册路径和组件。

路由使用浏览器 History 模式。生产部署时，服务器需将页面路径回退到 `index.html`，以支持直接访问和刷新页面。

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
