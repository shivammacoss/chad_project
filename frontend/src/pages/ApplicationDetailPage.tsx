import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { StatusBadge } from '@/components/formations/StatusBadge'
import { STATUS_LABEL, formatPrice } from '@/content/formations'
import { apiGet, apiUpload, apiPost, apiUrl } from '@/lib/api'
import type { Application, DocItem, ApplicationStatus } from '@/types/app'

export default function ApplicationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [a, setA] = useState<Application | null>(null)
  const [docs, setDocs] = useState<DocItem[]>([])
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!id) return
    apiGet<Application>(`/api/applications/${id}`).then(setA).catch(() => setFailed(true))
    apiGet<DocItem[]>(`/api/applications/${id}/documents`).then(setDocs).catch(() => setDocs([]))
  }, [id])

  async function reupload(type: string, file: File) {
    if (!id) return
    const form = new FormData()
    form.append('type', type)
    form.append('ownerName', '')
    form.append('file', file)
    await apiUpload(`/api/applications/${id}/documents`, form)
    const fresh = await apiGet<DocItem[]>(`/api/applications/${id}/documents`)
    setDocs(fresh)
  }

  async function renew() {
    if (!a) return
    const order = await apiPost<Application>('/api/applications', { serviceKey: 'annual-renewal', renewsApplicationId: a._id })
    navigate(`/services/${order._id}`)
  }

  if (failed) return (
    <div className="min-h-screen bg-navy pt-24 text-center text-frost/60">
      Couldn't load this application. <Link to="/dashboard" className="text-teal-electric">Back to dashboard</Link>
    </div>
  )
  if (!a) return <div className="min-h-screen bg-navy pt-24 text-center text-frost/60">Loading…</div>

  return (
    <div className="min-h-screen bg-navy pt-16">
      <div className="mx-auto max-w-2xl px-5 py-12">
        <Link to="/dashboard" className="text-sm text-teal-electric">← Back to dashboard</Link>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-frost">{a.companyDetails?.proposedName || a.serviceName}</h1>
            <p className="text-sm text-frost/55">{a.serviceName} · {formatPrice(a.priceCents)}{a.country && ` · ${a.country}`}</p>
            {a.companyRegNo && <p className="text-sm text-teal-electric">Reg no: {a.companyRegNo}</p>}
            {a.status === 'registered' && a.expiresAt && (
              <div className="mt-2 flex items-center gap-3">
                <span className="text-sm text-frost/60">Expires: {new Date(a.expiresAt).toISOString().slice(0, 10)}</span>
                <button onClick={renew} className="text-sm text-teal-electric">Renew</button>
              </div>
            )}
          </div>
          <StatusBadge status={a.status} />
        </div>

        {a.companyDetails?.proposedName && (
          <>
            <h2 className="mt-8 text-sm uppercase tracking-wider text-frost/50">Company</h2>
            <div className="mt-2 rounded-lg border border-frost/10 bg-steel/20 p-4 text-sm text-frost/80">
              <p>Activity: {a.companyDetails.businessActivity || '—'}</p>
              <p>Capital: {a.companyDetails?.shareCapitalFCFA?.toLocaleString() ?? '—'} {a.companyDetails?.currency ?? 'FCFA'} (paid-up {a.companyDetails?.paidUpCapitalFCFA?.toLocaleString() ?? '—'})</p>
              <p>City: {a.companyDetails.city}</p>
              <p>Virtual office: {a.virtualOffice.wanted ? a.virtualOffice.plan : 'none'}</p>
            </div>
          </>
        )}

        {a.owners && a.owners.length > 0 && (
          <>
            <h2 className="mt-8 text-sm uppercase tracking-wider text-frost/50">Owners</h2>
            <div className="mt-2 grid gap-2">
              {a.owners.map((o, i) => (
                <div key={i} className="flex justify-between rounded-lg border border-frost/10 bg-steel/20 px-4 py-3 text-sm">
                  <span className="text-frost">{o.fullName} <span className="text-frost/50">({o.role})</span></span>
                  <span className="text-frost/60">{o.nationality} · {o.role === 'director' ? (o.dob ? `DOB ${o.dob}` : 'director') : `${o.ownershipPercent ?? 0}%`}{o.isCorporate ? ' · company' : ''}{o.isPrimaryContact ? ' · primary' : ''}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {a.intake && Object.keys(a.intake).length > 0 && (
          <>
            <h2 className="mt-8 text-sm uppercase tracking-wider text-frost/50">Details</h2>
            <div className="mt-2 rounded-lg border border-frost/10 bg-steel/20 p-4 text-sm text-frost/80">
              {Object.entries(a.intake).map(([k, v]) => <p key={k}>{k}: {String(v)}</p>)}
            </div>
          </>
        )}

        <h2 className="mt-8 text-sm uppercase tracking-wider text-frost/50">Documents</h2>
        <div className="mt-2 grid gap-2">
          {docs.length === 0 && <p className="text-sm text-frost/55">No documents uploaded.</p>}
          {docs.map((d) => (
            <div key={d._id}>
              <div className="flex justify-between rounded-lg border border-frost/10 bg-steel/20 px-4 py-3 text-sm">
                <span className="text-frost">{d.ownerName ? `${d.ownerName} — ` : ''}{d.type} ({d.fileName})</span>
                <span className="text-frost/60">{d.status}</span>
              </div>
              {d.status === 'rejected' && (
                <div className="mt-1 text-xs">
                  <span className="text-indigo-pulse">Rejected: {d.rejectionReason || 'please re-upload'}</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="ml-2 text-frost/60"
                    onChange={(e) => e.target.files?.[0] && reupload(d.type, e.target.files[0])}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {a.companyRegNo && (
          <>
            <h2 className="mt-8 text-sm uppercase tracking-wider text-frost/50">Certificate</h2>
            <div className="mt-2 flex items-center justify-between rounded-lg border border-frost/10 bg-steel/20 px-4 py-3 text-sm">
              <span className="text-frost">Certificate of Incorporation — {a.companyRegNo}</span>
              <a href={apiUrl(`/api/applications/${id}/certificate.pdf`)} target="_blank" rel="noreferrer" className="text-teal-electric">Download / Print</a>
            </div>
          </>
        )}

        {docs.some((d) => ['certificate', 'government_receipt', 'license'].includes(d.type)) && (
          <>
            <h2 className="mt-8 text-sm uppercase tracking-wider text-frost/50">Certificates & official documents</h2>
            <div className="mt-2 grid gap-2">
              {docs.filter((d) => ['certificate', 'government_receipt', 'license'].includes(d.type)).map((d) => (
                <div key={d._id} className="flex justify-between rounded-lg border border-frost/10 bg-steel/20 px-4 py-3 text-sm">
                  <span className="text-frost">{d.type.replace(/_/g, ' ')} — {d.fileName}</span>
                  <a href={apiUrl(`/api/applications/${id}/documents/${d._id}/file`)} target="_blank" rel="noreferrer" className="text-teal-electric">View</a>
                </div>
              ))}
            </div>
          </>
        )}

        <h2 className="mt-8 text-sm uppercase tracking-wider text-frost/50">Timeline</h2>
        <ol className="mt-2 border-l border-frost/15 pl-5">
          {a.statusHistory.map((h, i) => (
            <li key={i} className="relative pb-5">
              <span className="absolute -left-[23px] top-1 h-2.5 w-2.5 rounded-full bg-teal-electric" />
              <p className="text-frost">{STATUS_LABEL[h.status as ApplicationStatus] ?? h.status}</p>
              {h.note && <p className="text-sm text-frost/55">{h.note}</p>}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
