import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/formations/StatusBadge'
import { formatPrice } from '@/content/formations'
import { apiGet, apiDelete } from '@/lib/api'
import { useAuth } from '@/store/AuthContext'
import { useTr } from '@/lib/i18n'
import type { Application } from '@/types/app'

export default function DashboardPage() {
  const tr = useTr()
  const { user, logout } = useAuth()
  const [items, setItems] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  function load() {
    return apiGet<Application[]>('/api/applications').then(setItems).catch(() => setItems([]))
  }
  useEffect(() => { load().finally(() => setLoading(false)) }, [])

  async function remove(id: string) {
    if (!window.confirm(tr({ fr: 'Supprimer ce brouillon de demande ?', en: 'Delete this draft application?', ar: 'حذف مسودة الطلب هذه؟' }))) return
    await apiDelete(`/api/applications/${id}`).catch(() => {})
    load()
  }

  return (
    <div className="min-h-screen bg-navy pt-16">
      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-4 border-b border-frost/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-frost">{tr({ fr: 'Bonjour', en: 'Hi', ar: 'مرحبًا' })} {user?.fullName}</h1>
            <p className="mt-1 text-sm text-frost/55">{tr({ fr: 'Vos demandes de création de société au Tchad.', en: 'Your company applications in Chad.', ar: 'طلبات تأسيس شركتك في تشاد.' })}</p>
          </div>
          <div className="flex gap-3">
            <Link to="/services/new"><Button>{tr({ fr: 'Démarrer une demande', en: 'Start application', ar: 'بدء طلب' })}</Button></Link>
            <Link to="/invoices"><Button variant="ghost">{tr({ fr: 'Factures', en: 'Invoices', ar: 'الفواتير' })}</Button></Link>
            <Link to="/support"><Button variant="ghost">{tr({ fr: 'Assistance', en: 'Support', ar: 'الدعم' })}</Button></Link>
            <Button variant="ghost" onClick={() => logout()}>{tr({ fr: 'Déconnexion', en: 'Log out', ar: 'تسجيل الخروج' })}</Button>
          </div>
        </div>
        {loading ? <p className="mt-10 text-frost/55">{tr({ fr: 'Chargement…', en: 'Loading…', ar: 'جارٍ التحميل…' })}</p>
          : items.length === 0 ? (
            <div className="mt-10 rounded-xl border border-frost/10 bg-steel/20 p-10 text-center">
              <p className="text-frost/70">{tr({ fr: 'Aucune demande pour le moment.', en: 'No applications yet.', ar: 'لا توجد طلبات بعد.' })}</p>
              <Link to="/services/new" className="mt-4 inline-block"><Button>{tr({ fr: 'Démarrer votre première demande', en: 'Start your first application', ar: 'ابدأ طلبك الأول' })}</Button></Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-4">
              {items.map((a) => (
                <div key={a._id}
                  className="flex items-center justify-between rounded-xl border border-frost/10 bg-steel/20 px-6 py-5 transition-colors hover:border-teal-electric/30">
                  <Link to={`/applications/${a._id}`} className="min-w-0 flex-1">
                    <p className="font-medium text-frost">{a.companyDetails?.proposedName || a.serviceName || tr({ fr: 'Sans titre', en: 'Untitled', ar: 'بدون عنوان' })}</p>
                    <p className="text-sm text-frost/55">{a.serviceName ?? tr({ fr: 'Service', en: 'Service', ar: 'الخدمة' })} · {formatPrice(a.priceCents)}{a.status === 'registered' && a.expiresAt ? ` · ${tr({ fr: 'expire le', en: 'expires', ar: 'تنتهي في' })} ${new Date(a.expiresAt).toISOString().slice(0, 10)}` : ''}</p>
                  </Link>
                  <div className="ml-4 flex items-center gap-3">
                    <StatusBadge status={a.status} />
                    {a.status === 'draft' && (
                      <button type="button" onClick={() => remove(a._id)} className="text-sm text-indigo-pulse hover:underline">{tr({ fr: 'Supprimer', en: 'Delete', ar: 'حذف' })}</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  )
}
