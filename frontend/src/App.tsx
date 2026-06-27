import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from '@/routes/AppRoutes'
import { AuthProvider } from '@/store/AuthContext'
import { LanguageProvider } from '@/store/LanguageContext'

/** Root component — wires the router around the route table. */
export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  )
}
