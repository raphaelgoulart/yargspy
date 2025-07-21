import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './main.css'
import App from './app/App.tsx'
import './app/config/i18n.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
