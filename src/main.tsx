// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from "./App" 
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Temporarily remove ThemeProvider to isolate the error */}
    <App />
  </React.StrictMode>,
)