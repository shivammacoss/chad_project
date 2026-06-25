import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/formations/StatusBadge'
import { apiGet, apiPatch, apiPost, apiUpload } from '@/lib/api'
import type { Application, DocItem } from '@/types/app'

const STATUSES = ['filing_submitted', 'registered', 'completed']
const GOV_DOCS = ['certificate', 'government_receipt', 'license']

export default function AgentPanel() {
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
      <h2 className="text-lg font-semibold text-frost">My assigned cases</h2>
      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="grid gap-2">
          {items.length === 0 && <p className="text-sm text-frost/55">No cases assigned.</p>}
          {items.map((a) => (
            <button key={a._id} onClick={() => open(a._id)} className={`rounded-xl border px-4 py-3 text-left ${sel?._id === a._id ? 'border-teal-electric/50 bg-teal-electric/10' : 'border-frost/10 bg-steel/20'}`}>
              <div className="flex items-center justify-between"><span className="font-medium text-frost">{a.companyDetails?.proposedName || a.serviceName}</span><StatusBadge status={a.status} /></div>
            </button>
          ))}
        </div>
        <div>
          {!sel ? <p className="text-frost/55">Select a case.</p> : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between"><h3 className="text-lg font-medium text-frost">{sel.companyDetails?.proposedName || sel.serviceName}</h3><StatusBadge status={sel.status} /></div>
              <div>
                <p className="text-sm uppercase tracking-wider text-frost/50">Upload official documents</p>
                {GOV_DOCS.map((d) => (
                  <label key={d} className="mt-2 flex flex-col gap-1">
                    <span className="text-sm text-frost/70">{d.replace(/_/g, ' ')}</span>
                    <input type="file" accept="image/*,application/pdf" className="text-sm text-frost/70" onChange={(e) => e.target.files?.[0] && upload(d, e.target.files[0])} />
                  </label>
                ))}
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider text-frost/50">Uploaded</p>
                {docs.filter((d) => GOV_DOCS.includes(d.type)).map((d) => (
                  <div key={d._id} className="mt-1 flex justify-between rounded-lg border border-frost/10 bg-steel/20 px-3 py-2 text-sm">
                    <span className="text-frost">{d.type} — {d.fileName}</span>
                    <a href={`/api/applications/${sel._id}/documents/${d._id}/file`} target="_blank" rel="noreferrer" className="text-teal-electric">View</a>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider text-frost/50">Advance</p>
                <div className="mt-2 flex flex-wrap gap-2">{STATUSES.map((s) => <Button key={s} size="sm" variant="outline" onClick={() => advance(s)}>{s}</Button>)}</div>
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider text-frost/50">Certificate</p>
                {sel.companyRegNo
                  ? <p className="mt-1 text-sm text-teal-electric">Issued · {sel.companyRegNo}</p>
                  : <Button size="sm" className="mt-2" onClick={issueCert}>Issue certificate</Button>}
              </div>
              {sel.paymentStatus !== 'paid' && <Button size="sm" variant="outline" className="mt-2" onClick={confirmPayment}>Confirm bank payment</Button>}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
