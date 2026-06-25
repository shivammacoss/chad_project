import { useAuth } from '@/store/AuthContext'
import LegalPanel from '@/components/staff/LegalPanel'
import AgentPanel from '@/components/staff/AgentPanel'
import TicketsPanel from '@/components/staff/TicketsPanel'
import AuditPanel from '@/components/staff/AuditPanel'
import ServicesPanel from '@/components/staff/ServicesPanel'
import StatsPanel from '@/components/staff/StatsPanel'
import UsersPanel from '@/components/staff/UsersPanel'
import PaymentSettingsPanel from '@/components/staff/PaymentSettingsPanel'

export default function StaffPage() {
  const { user, logout } = useAuth()
  const role = user?.role ?? ''
  const showLegal = ['legal', 'compliance', 'admin'].includes(role)
  const showAgent = ['government_agent', 'admin'].includes(role)
  const showTickets = ['support', 'legal', 'compliance', 'admin'].includes(role)
  return (
    <div className="min-h-screen bg-navy pt-16">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex items-center justify-between border-b border-frost/10 pb-5">
          <h1 className="text-2xl font-semibold text-frost">{role === 'admin' ? 'Admin console' : 'Staff console'} <span className="text-sm text-frost/50">({role})</span></h1>
          <button onClick={() => logout()} className="text-sm text-frost/70 hover:text-frost">Log out</button>
        </div>
        {role === 'admin' && <div className="mt-6"><StatsPanel /></div>}
        {showLegal && <LegalPanel />}
        {showAgent && <AgentPanel />}
        {showTickets && <TicketsPanel />}
        {role === 'admin' && <UsersPanel />}
        {role === 'admin' && <ServicesPanel />}
        {role === 'admin' && <PaymentSettingsPanel />}
        {role === 'admin' && <AuditPanel />}
        {!showLegal && !showAgent && !showTickets && <p className="mt-8 text-frost/55">No panels for your role yet.</p>}
      </div>
    </div>
  )
}
