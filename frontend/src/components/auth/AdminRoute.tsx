import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/store/AuthContext'

export default function AdminRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-navy pt-24 text-center text-frost/60">Loading…</div>
  return user?.role === 'admin' ? <Outlet /> : <Navigate to="/dashboard" replace />
}
