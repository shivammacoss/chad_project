import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/formations/StatusBadge'
import { apiGet, apiPatch, apiPost, apiUpload, apiUrl } from '@/lib/api'
import { useTr, type Localized } from '@/lib/i18n'
import type { Application, DocItem } from '@/types/app'

const STATUSES = ['filing_submitted', 'registered', 'completed']
const GOV_DOCS: { value: string; label: Localized }[] = [
  { value: 'certificate', label: { fr: 'certificat', en: 'certificate', ar: 'شهادة' } },
  { value: 'government_receipt', label: { fr: 'reçu gouvernemental', en: 'government receipt', ar: 'إيصال حكومي' } },
  { value: 'license', label: { fr: 'licence', en: 'license', ar: 'ترخيص' } },
]

export default function AgentPanel() {
  const tr = useTr()
  const [items, setItems] = useState<Application[]>([])
  const [sel, setSel] = useState<Application | null>(null)
  const [docs, setDocs] = useState<DocItem[]>([])

  const load = useCallback(async () => { setItems(await apiGet<Application[]>('/api/staff/applications?assigned=me')) }, [])
  useEffect(() => { load() }, [load])
  const open = useCallback(async (id: string) => {
    setSel(await apiGet<Application>(`/api/staff/applications/${id}`))
    setDocs(await apiGet<DocItem[]>(`/api/staff/applications/${id}/documents`))
  }, [])

  async function advance(status: string) { if (!sel) return; await apiPatch(`/api/staff/applications/${sel._id}/status`, { status }); await open(sel._id); await load() }
  async function upload(type: string, file: File) {
    if (!sel) return
    const form = new FormData(); form.append('type', type); form.append('ownerName', ''); form.append('file', file)
    await apiUpload(`/api/applications/${sel._id}/documents`, form)
    setDocs(await apiGet<DocItem[]>(`/api/staff/applications/${sel._id}/documents`))
  }
  async function issueCert() { if (!sel) return; await apiPost(`/api/staff/applications/${sel._id}/issue-certificate`); await open(sel._id); await load() }
  async function confirmPayment() { if (!sel) return; await apiPost(`/api/staff/applications/${sel._id}/confirm-payment`); await open(sel._id); await load() }

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-frost">{tr({ fr: 'Mes dossiers attribués', en: 'My assigned cases', ar: 'الحالات المسندة إليّ' })}</h2>
      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="grid gap-2">
          {items.length === 0 && <p className="text-sm text-frost/55">{tr({ fr: 'Aucun dossier attribué.', en: 'No cases assigned.', ar: 'لا توجد حالات مسندة.' })}</p>}
          {items.map((a) => (
            <button key={a._id} onClick={() => open(a._id)} className={`rounded-xl border px-4 py-3 text-left ${sel?._id === a._id ? 'border-teal-electric/50 bg-teal-electric/10' : 'border-frost/10 bg-steel/20'}`}>
              <div className="flex items-center justify-between"><span className="font-medium text-frost">{a.companyDetails?.proposedName || a.serviceName}</span><StatusBadge status={a.status} /></div>
            </button>
          ))}
        </div>
        <div>
          {!sel ? <p className="text-frost/55">{tr({ fr: 'Sélectionnez un dossier.', en: 'Select a case.', ar: 'حدد حالة.' })}</p> : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between"><h3 className="text-lg font-medium text-frost">{sel.companyDetails?.proposedName || sel.serviceName}</h3><StatusBadge status={sel.status} /></div>
              <div>
                <p className="text-sm uppercase tracking-wider text-frost/50">{tr({ fr: 'Téléverser les documents officiels', en: 'Upload official documents', ar: 'رفع المستندات الرسمية' })}</p>
                {GOV_DOCS.map((d) => (
                  <label key={d.value} className="mt-2 flex flex-col gap-1">
                    <span className="text-sm text-frost/70">{tr(d.label)}</span>
                    <input type="file" accept="image/*,application/pdf" className="text-sm text-frost/70" onChange={(e) => e.target.files?.[0] && upload(d.value, e.target.files[0])} />
                  </label>
                ))}
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider text-frost/50">{tr({ fr: 'Téléversés', en: 'Uploaded', ar: 'تم رفعها' })}</p>
                {docs.filter((d) => GOV_DOCS.some((g) => g.value === d.type)).map((d) => (
                  <div key={d._id} className="mt-1 flex justify-between rounded-lg border border-frost/10 bg-steel/20 px-3 py-2 text-sm">
                    <span className="text-frost">{d.type} — {d.fileName}</span>
                    <a href={apiUrl(`/api/applications/${sel._id}/documents/${d._id}/file`)} target="_blank" rel="noreferrer" className="text-teal-electric">{tr({ fr: 'Voir', en: 'View', ar: 'عرض' })}</a>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider text-frost/50">{tr({ fr: 'Faire avancer', en: 'Advance', ar: 'تقديم' })}</p>
                <div className="mt-2 flex flex-wrap gap-2">{STATUSES.map((s) => <Button key={s} size="sm" variant="outline" onClick={() => advance(s)}>{s}</Button>)}</div>
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider text-frost/50">{tr({ fr: 'Certificat', en: 'Certificate', ar: 'الشهادة' })}</p>
                {sel.companyRegNo
                  ? <p className="mt-1 text-sm text-teal-electric">{tr({ fr: 'Délivré', en: 'Issued', ar: 'صادر' })} · {sel.companyRegNo}</p>
                  : <Button size="sm" className="mt-2" onClick={issueCert}>{tr({ fr: 'Délivrer le certificat', en: 'Issue certificate', ar: 'إصدار الشهادة' })}</Button>}
              </div>
              {sel.paymentStatus !== 'paid' && <Button size="sm" variant="outline" className="mt-2" onClick={confirmPayment}>{tr({ fr: 'Confirmer le virement bancaire', en: 'Confirm bank payment', ar: 'تأكيد الدفع البنكي' })}</Button>}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
