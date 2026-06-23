import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/store/AuthContext'

const CUSTOMER = new Set(['customer', 'user'])
export default function StaffRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-navy pt-24 text-center text-frost/60">Loading…</div>
  return user && !CUSTOMER.has(user.role) ? <Outlet /> : <Navigate to="/admin/login" replace />
}
