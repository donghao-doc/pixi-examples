# pixi-examples

基于 React、TypeScript 和 Vite 的基础脚手架，已配置 React Router 和首页入口。

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

当前未安装 Sass，页面暂未引入自定义样式。安装后可在页面目录中添加并引入 SCSS 文件。
