import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/formations/StatusBadge'
import { ENTITY_TYPES, formatPrice } from '@/content/formations'
import { apiGet, apiPatch, apiPost, apiUrl } from '@/lib/api'
import { useTr, type Translatable } from '@/lib/i18n'
import type { Application, DocItem } from '@/types/app'

const ADMIN_STATUSES = ['in_review', 'filing_submitted', 'registered', 'needs_more_docs', 'rejected'] as const
const entityLabel = (v: string): Translatable => ENTITY_TYPES.find((e) => e.value === v)?.label ?? v
function clientEmail(a: Application): string {
  return typeof a.userId === 'object' && a.userId ? a.userId.email : '—'
}

export default function AdminPage() {
  const tr = useTr()
  const [items, setItems] = useState<Application[]>([])
  const [selected, setSelected] = useState<Application | null>(null)
  const [docs, setDocs] = useState<DocItem[]>([])
  const [busy, setBusy] = useState(false)
  const [renewalMsg, setRenewalMsg] = useState('')

  const loadList = useCallback(async () => { setItems(await apiGet<Application[]>('/api/admin/applications')) }, [])
  useEffect(() => { loadList() }, [loadList])

  const open = useCallback(async (id: string) => {
    setSelected(await apiGet<Application>(`/api/admin/applications/${id}`))
    setDocs(await apiGet<DocItem[]>(`/api/admin/applications/${id}/documents`))
  }, [])

  async function advance(status: string) {
    if (!selected) return
    setBusy(true)
    try { await apiPatch(`/api/admin/applications/${selected._id}/status`, { status }); await open(selected._id); await loadList() }
    finally { setBusy(false) }
  }
  async function reviewDoc(docId: string, status: 'approved' | 'rejected') {
    if (!selected) return
    await apiPatch(`/api/admin/documents/${docId}`, { status })
    await open(selected._id)
    await loadList()
  }

  async function runRenewalCheck() {
    const r = await apiPost<{ sent: number }>('/api/admin/run-renewal-check')
    setRenewalMsg(tr({
      fr: `${r.sent} rappel(s) de renouvellement envoyé(s)`,
      en: `${r.sent} renewal reminder(s) sent`,
      ar: `تم إرسال ${r.sent} تذكير(تذكيرات) بالتجديد`,
    }))
  }

  return (
    <div className="min-h-screen bg-navy pt-16">
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-12 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <h1 className="text-2xl font-semibold text-frost">{tr({ fr: 'Demandes', en: 'Applications', ar: 'الطلبات' })}</h1>
          <div className="mt-3">
            <Button size="sm" variant="outline" onClick={runRenewalCheck}>{tr({ fr: 'Lancer la vérification des renouvellements', en: 'Run renewal check', ar: 'تشغيل فحص التجديد' })}</Button>
            {renewalMsg && <span className="ml-2 text-xs text-teal-electric">{renewalMsg}</span>}
          </div>
          <div className="mt-6 grid gap-2">
            {items.map((a) => (
              <button key={a._id} type="button" onClick={() => open(a._id)}
                className={`rounded-xl border px-4 py-3 text-left ${selected?._id === a._id ? 'border-teal-electric/50 bg-teal-electric/10' : 'border-frost/10 bg-steel/20'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-frost">{a.companyDetails?.proposedName || a.serviceName || tr({ fr: 'Sans titre', en: 'Untitled', ar: 'بدون عنوان' })}</span>
                  <StatusBadge status={a.status} />
                </div>
                <span className="text-sm text-frost/55">{a.serviceName ?? tr(entityLabel(a.entityType ?? ''))} · {clientEmail(a)}{a.country && ` · ${a.country}`}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          {!selected ? <p className="text-frost/55">{tr({ fr: 'Sélectionnez une demande à examiner.', en: 'Select an application to review.', ar: 'حدد طلبًا للمراجعة.' })}</p> : (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-frost">{selected.companyDetails?.proposedName || selected.serviceName}</h2>
                  <p className="text-sm text-frost/55">{selected.serviceName ?? tr(entityLabel(selected.entityType ?? ''))} · {formatPrice(selected.priceCents)} · {clientEmail(selected)}{selected.country && ` · ${selected.country}`}</p>
                </div>
                <StatusBadge status={selected.status} />
              </div>

              {selected.companyDetails?.proposedName && (
                <div className="rounded-lg border border-frost/10 bg-steel/20 p-4 text-sm text-frost/80">
                  <p>{tr({ fr: 'Activité', en: 'Activity', ar: 'النشاط' })}: {selected.companyDetails.businessActivity || '—'}</p>
                  <p>{tr({ fr: 'Capital', en: 'Capital', ar: 'رأس المال' })}: {selected.companyDetails?.shareCapitalFCFA?.toLocaleString() ?? '—'} {selected.companyDetails?.currency ?? 'FCFA'} ({tr({ fr: 'libéré', en: 'paid-up', ar: 'المدفوع' })} {selected.companyDetails?.paidUpCapitalFCFA?.toLocaleString() ?? '—'}) · {tr({ fr: 'Ville', en: 'City', ar: 'المدينة' })}: {selected.companyDetails.city}</p>
                  <p>{tr({ fr: 'Bureau virtuel', en: 'Virtual office', ar: 'مكتب افتراضي' })}: {selected.virtualOffice.wanted ? selected.virtualOffice.plan : tr({ fr: 'aucun', en: 'none', ar: 'لا يوجد' })}</p>
                </div>
              )}

              {selected.owners && selected.owners.length > 0 && (
                <div>
                  <h3 className="text-sm uppercase tracking-wider text-frost/50">{tr({ fr: 'Propriétaires', en: 'Owners', ar: 'المالكون' })}</h3>
                  <div className="mt-2 grid gap-2">
                    {selected.owners.map((o, i) => (
                      <div key={i} className="flex justify-between rounded-lg border border-frost/10 bg-steel/20 px-4 py-2 text-sm">
                        <span className="text-frost">{o.fullName} <span className="text-frost/50">({o.role})</span></span>
                        <span className="text-frost/60">{o.nationality} · {o.role === 'director' ? (o.dob ? `${tr({ fr: 'Né(e) le', en: 'DOB', ar: 'تاريخ الميلاد' })} ${o.dob}` : tr({ fr: 'administrateur', en: 'director', ar: 'مدير' })) : `${o.ownershipPercent ?? 0}%`}{o.isCorporate ? ` · ${tr({ fr: 'société', en: 'company', ar: 'شركة' })}` : ''}{o.isPrimaryContact ? ` · ${tr({ fr: 'principal', en: 'primary', ar: 'رئيسي' })}` : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selected.intake && Object.keys(selected.intake).length > 0 && (
                <div>
                  <h3 className="text-sm uppercase tracking-wider text-frost/50">{tr({ fr: 'Détails', en: 'Details', ar: 'التفاصيل' })}</h3>
                  <div className="mt-2 rounded-lg border border-frost/10 bg-steel/20 p-4 text-sm text-frost/80">
                    {Object.entries(selected.intake).map(([k, v]) => <p key={k}>{k}: {String(v)}</p>)}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm uppercase tracking-wider text-frost/50">{tr({ fr: 'Documents', en: 'Documents', ar: 'المستندات' })}</h3>
                <div className="mt-2 grid gap-2">
                  {docs.length === 0 && <p className="text-sm text-frost/55">{tr({ fr: 'Aucun document.', en: 'No documents.', ar: 'لا توجد مستندات.' })}</p>}
                  {docs.map((d) => (
                    <div key={d._id} className="flex items-center justify-between rounded-lg border border-frost/10 bg-steel/20 px-4 py-2 text-sm">
                      <span className="text-frost">{d.ownerName ? `${d.ownerName} — ` : ''}{d.type}</span>
                      <span className="flex items-center gap-3">
                        <a href={apiUrl(`/api/applications/${selected._id}/documents/${d._id}/file`)} target="_blank" rel="noreferrer" className="text-teal-electric">{tr({ fr: 'Voir', en: 'View', ar: 'عرض' })}</a>
                        <span className="text-frost/50">{d.status}</span>
                        <button type="button" className="text-teal-electric" onClick={() => reviewDoc(d._id, 'approved')}>{tr({ fr: 'Approuver', en: 'Approve', ar: 'موافقة' })}</button>
                        <button type="button" className="text-indigo-pulse" onClick={() => reviewDoc(d._id, 'rejected')}>{tr({ fr: 'Rejeter', en: 'Reject', ar: 'رفض' })}</button>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm uppercase tracking-wider text-frost/50">{tr({ fr: 'Faire avancer le statut', en: 'Advance status', ar: 'تقديم الحالة' })}</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ADMIN_STATUSES.map((s) => (
                    <Button key={s} size="sm" variant="outline" disabled={busy} onClick={() => advance(s)}>{s}</Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
