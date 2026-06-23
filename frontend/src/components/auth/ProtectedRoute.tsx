import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/store/AuthContext'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-navy pt-24 text-center text-frost/60">Loading…</div>
  return user ? <Outlet /> : <Navigate to="/login" replace />
}
