import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'amfe-flexible'
import 'normalize.css'
import '@/styles/global.scss'
import App from '@/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
