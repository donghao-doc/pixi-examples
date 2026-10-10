# pixi-examples

基于 React、TypeScript 和 Vite 的空白脚手架，尚未实现业务功能。

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
- `src/App.tsx`：应用根组件，当前不渲染页面内容
- `index.html`：HTML 入口
- `vite.config.ts`：Vite 配置

## 路径别名

`@` 指向 `src` 目录，跨模块导入优先使用别名，同一模块内部可使用相对路径。

```ts
import App from '@/App'
```

别名同时配置在 `vite.config.ts` 和 `tsconfig.app.json` 中，修改映射时需保持两处一致。
