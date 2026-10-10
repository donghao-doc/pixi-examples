import ExampleLink from '@/components/example-link'
import './index.scss'

/**
 * 展示 Pixi.js 示例入口
 */
function HomePage() {
  return (
    <main className="home-page">
      <p className="home-eyebrow">PIXI.JS / 互动实验</p>
      <nav className="home-examples" aria-label="Pixi.js 示例">
        <ExampleLink to="/scratch-card">刮刮卡</ExampleLink>
        <ExampleLink to="/frame-animation">序列帧动画</ExampleLink>
      </nav>
    </main>
  )
}

export default HomePage
