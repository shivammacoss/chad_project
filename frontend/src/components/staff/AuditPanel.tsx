import { useEffect, useState } from 'react'
import { apiGet } from '@/lib/api'
import { useTr } from '@/lib/i18n'
import type { AuditEntry } from '@/types/app'

const actorEmail = (e: AuditEntry) => (typeof e.actorId === 'object' && e.actorId ? e.actorId.email ?? e.actorRole : e.actorRole)

export default function AuditPanel() {
  const tr = useTr()
  const [items, setItems] = useState<AuditEntry[]>([])
  useEffect(() => { apiGet<AuditEntry[]>('/api/admin/audit').then(setItems).catch(() => setItems([])) }, [])
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-frost">{tr({ fr: 'Journal d\'audit', en: 'Audit log', ar: 'سجل التدقيق' })}</h2>
      <div className="mt-4 grid gap-1">
        {items.length === 0 && <p className="text-sm text-frost/55">{tr({ fr: 'Aucune entrée d\'audit.', en: 'No audit entries.', ar: 'لا توجد إدخالات تدقيق.' })}</p>}
        {items.map((e) => (
          <div key={e._id} className="flex items-center justify-between rounded-lg border border-frost/10 bg-steel/20 px-4 py-2 text-xs">
            <span className="text-frost">{e.action} <span className="text-frost/50">{e.target}</span></span>
            <span className="text-frost/50">{actorEmail(e)} · {e.ip} · {e.at ? new Date(e.at).toISOString().slice(0, 16).replace('T', ' ') : ''}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
