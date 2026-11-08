import { BrowserRouter } from 'react-router-dom'

import { AuthProvider } from './auth/AuthProvider'
import { AppRoutes } from './routes/AppRoutes'
import { ToastProvider } from './components/Toast'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
