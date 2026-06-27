import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/store/AuthContext'
import { useTr } from '@/lib/i18n'

export default function ProtectedRoute() {
  const tr = useTr()
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-navy pt-24 text-center text-frost/60">{tr({ fr: 'Chargement…', en: 'Loading…', ar: 'جارٍ التحميل…' })}</div>
  return user ? <Outlet /> : <Navigate to="/login" replace />
}
