import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Background from './Background.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Background />
  </StrictMode>,
)
