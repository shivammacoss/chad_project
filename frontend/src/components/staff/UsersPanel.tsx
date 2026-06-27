import { useCallback, useEffect, useState } from 'react'
import { apiGet, apiPatch } from '@/lib/api'
import { useTr, type Localized } from '@/lib/i18n'
import type { AdminUser } from '@/types/app'

const ROLES: { value: string; label: Localized }[] = [
  { value: 'customer', label: { fr: 'Client', en: 'customer', ar: 'عميل' } },
  { value: 'sales', label: { fr: 'Commercial', en: 'sales', ar: 'مبيعات' } },
  { value: 'legal', label: { fr: 'Juridique', en: 'legal', ar: 'قانوني' } },
  { value: 'compliance', label: { fr: 'Conformité', en: 'compliance', ar: 'الامتثال' } },
  { value: 'government_agent', label: { fr: 'Agent gouvernemental', en: 'government_agent', ar: 'وكيل حكومي' } },
  { value: 'finance', label: { fr: 'Finance', en: 'finance', ar: 'المالية' } },
  { value: 'support', label: { fr: 'Support', en: 'support', ar: 'الدعم' } },
  { value: 'admin', label: { fr: 'Administrateur', en: 'admin', ar: 'مسؤول' } },
]

export default function UsersPanel() {
  const tr = useTr()
  const [items, setItems] = useState<AdminUser[]>([])
  const load = useCallback(() => apiGet<AdminUser[]>('/api/admin/users').then(setItems).catch(() => setItems([])), [])
  useEffect(() => { load() }, [load])
  async function setRole(id: string, role: string) { await apiPatch(`/api/admin/users/${id}/role`, { role }).catch(() => {}); load() }
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-frost">{tr({ fr: 'Utilisateurs', en: 'Users', ar: 'المستخدمون' })}</h2>
      <div className="mt-4 grid gap-2">
        {items.map((u) => (
          <div key={u._id} className="flex items-center justify-between rounded-lg border border-frost/10 bg-steel/20 px-4 py-2 text-sm">
            <div>
              <p className="font-medium text-frost">{u.fullName} <span className="text-frost/50">· {u.email}</span></p>
              <p className="text-frost/55">{u.country ?? '—'}{u.emailVerified ? '' : ` · ${tr({ fr: 'non vérifié', en: 'unverified', ar: 'غير مُتحقق' })}`}</p>
            </div>
            <select className="rounded-lg border border-frost/15 bg-navy px-3 py-2 text-sm text-frost" value={u.role} onChange={(e) => setRole(u._id, e.target.value)}>
              {ROLES.map((r) => <option key={r.value} value={r.value}>{tr(r.label)}</option>)}
            </select>
          </div>
        ))}
      </div>
    </section>
  )
}
