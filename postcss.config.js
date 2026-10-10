import pxtorem from 'postcss-pxtorem'

export default {
  plugins: [
    pxtorem({
      // 375px 设计稿按 10 等分，与 amfe-flexible 的根字号保持一致
      rootValue: 37.5,
      unitPrecision: 5,
      propList: ['*'],
      selectorBlackList: ['.no-rem'],
      replace: true,
      mediaQuery: false,
      minPixelValue: 2,
      exclude: /node_modules/i,
    }),
  ],
}
