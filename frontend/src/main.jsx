import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { SimpleModeProvider } from './context/SimpleModeContext'
import ErrorBoundary from './components/ErrorBoundary'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <SimpleModeProvider>
          <App />
        </SimpleModeProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
