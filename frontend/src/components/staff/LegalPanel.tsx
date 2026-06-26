import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/formations/StatusBadge'
import { apiGet, apiPatch, apiPost, apiUrl } from '@/lib/api'
import type { Application, DocItem } from '@/types/app'

const STATUSES = ['in_review', 'legal_review', 'waiting_government', 'needs_more_docs', 'rejected']
const email = (a: Application) => (typeof a.userId === 'object' && a.userId ? a.userId.email : '—')

export default function LegalPanel() {
  const [items, setItems] = useState<Application[]>([])
  const [sel, setSel] = useState<Application | null>(null)
  const [docs, setDocs] = useState<DocItem[]>([])
  const [agents, setAgents] = useState<{ _id: string; fullName: string }[]>([])

  const load = useCallback(async () => { setItems(await apiGet<Application[]>('/api/staff/applications')) }, [])
  useEffect(() => { load(); apiGet<{ _id: string; fullName: string }[]>('/api/staff/agents').then(setAgents).catch(() => setAgents([])) }, [load])

  const open = useCallback(async (id: string) => {
    setSel(await apiGet<Application>(`/api/staff/applications/${id}`))
    setDocs(await apiGet<DocItem[]>(`/api/staff/applications/${id}/documents`))
  }, [])

  async function advance(status: string) { if (!sel) return; await apiPatch(`/api/staff/applications/${sel._id}/status`, { status }); await open(sel._id); await load() }
  async function reviewDoc(docId: string, status: 'approved' | 'rejected') {
    let reason = ''
    if (status === 'rejected') reason = window.prompt('Rejection reason:') ?? ''
    await apiPatch(`/api/staff/documents/${docId}`, { status, reason })
    if (sel) setDocs(await apiGet<DocItem[]>(`/api/staff/applications/${sel._id}/documents`))
  }
  async function assign(agentId: string) { if (!sel) return; await apiPatch(`/api/staff/applications/${sel._id}/assign`, { agentId }); await open(sel._id); await load() }
  async function issueCert() { if (!sel) return; await apiPost(`/api/staff/applications/${sel._id}/issue-certificate`); await open(sel._id); await load() }
  async function confirmPayment() { if (!sel) return; await apiPost(`/api/staff/applications/${sel._id}/confirm-payment`); await open(sel._id); await load() }

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-frost">Legal review</h2>
      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="grid gap-2">
          {items.map((a) => (
            <button key={a._id} onClick={() => open(a._id)} className={`rounded-xl border px-4 py-3 text-left ${sel?._id === a._id ? 'border-teal-electric/50 bg-teal-electric/10' : 'border-frost/10 bg-steel/20'}`}>
              <div className="flex items-center justify-between"><span className="font-medium text-frost">{a.companyDetails?.proposedName || a.serviceName}</span><StatusBadge status={a.status} /></div>
              <span className="text-sm text-frost/55">{a.serviceName} · {email(a)}</span>
            </button>
          ))}
        </div>
        <div>
          {!sel ? <p className="text-frost/55">Select an application.</p> : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between"><h3 className="text-lg font-medium text-frost">{sel.companyDetails?.proposedName || sel.serviceName}</h3><StatusBadge status={sel.status} /></div>
              <div>
                <p className="text-sm uppercase tracking-wider text-frost/50">Documents</p>
                {docs.map((d) => (
                  <div key={d._id} className="mt-2 flex items-center justify-between rounded-lg border border-frost/10 bg-steel/20 px-4 py-2 text-sm">
                    <span className="text-frost">{d.ownerName ? `${d.ownerName} — ` : ''}{d.type} <span className="text-frost/50">{d.status}{d.rejectionReason ? ` (${d.rejectionReason})` : ''}</span></span>
                    <span className="flex gap-3">
                      <a href={apiUrl(`/api/applications/${sel._id}/documents/${d._id}/file`)} target="_blank" rel="noreferrer" className="text-teal-electric">View</a>
                      <button className="text-teal-electric" onClick={() => reviewDoc(d._id, 'approved')}>Approve</button>
                      <button className="text-indigo-pulse" onClick={() => reviewDoc(d._id, 'rejected')}>Reject</button>
                    </span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider text-frost/50">Assign government agent</p>
                <select className="mt-2 rounded-lg border border-frost/15 bg-navy px-3 py-2 text-sm text-frost" defaultValue="" onChange={(e) => e.target.value && assign(e.target.value)}>
                  <option value="">Select agent…</option>
                  {agents.map((ag) => <option key={ag._id} value={ag._id}>{ag.fullName}</option>)}
                </select>
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider text-frost/50">Advance status</p>
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
