import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'
import 'react-medium-image-zoom/dist/styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Toaster position="top-right" toastOptions={{
      duration: 4000,
      style: { fontFamily: 'Outfit, sans-serif', borderRadius: '8px' },
      success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
      error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
    }} />
    <App />
  </React.StrictMode>,
)
