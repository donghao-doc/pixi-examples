import { Link } from 'react-router'
import './index.scss'

/**
 * 展示 Pixi.js 示例入口
 */
function HomePage() {
  return (
    <main className="home-page">
      <p className="home-eyebrow">PIXI.JS / 互动实验</p>
      <Link className="home-example-link" to="/scratch-card">
        <span>体验刮刮卡</span>
        <span aria-hidden="true">↗</span>
      </Link>
    </main>
  )
}

export default HomePage
