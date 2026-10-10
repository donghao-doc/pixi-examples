import ExampleLink from '@/components/example-link'
import './index.scss'

/**
 * 展示 Pixi.js 示例入口
 */
function HomePage() {
  return (
    <main className="home-page">
      <p className="home-eyebrow">PIXI.JS / 互动实验</p>
      <ExampleLink to="/scratch-card">体验刮刮卡</ExampleLink>
    </main>
  )
}

export default HomePage
