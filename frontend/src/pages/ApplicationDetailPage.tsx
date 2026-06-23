import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { StatusBadge } from '@/components/formations/StatusBadge'
import { STATUS_LABEL, formatPrice } from '@/content/formations'
import { apiGet } from '@/lib/api'
import type { Application, DocItem, ApplicationStatus } from '@/types/app'

export default function ApplicationDetailPage() {
  const { id } = useParams()
  const [a, setA] = useState<Application | null>(null)
  const [docs, setDocs] = useState<DocItem[]>([])
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!id) return
    apiGet<Application>(`/api/applications/${id}`).then(setA).catch(() => setFailed(true))
    apiGet<DocItem[]>(`/api/applications/${id}/documents`).then(setDocs).catch(() => setDocs([]))
  }, [id])

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
            <p className="text-sm text-frost/55">{a.serviceName} · {formatPrice(a.priceCents)}</p>
          </div>
          <StatusBadge status={a.status} />
        </div>

        {a.companyDetails?.proposedName && (
          <>
            <h2 className="mt-8 text-sm uppercase tracking-wider text-frost/50">Company</h2>
            <div className="mt-2 rounded-lg border border-frost/10 bg-steel/20 p-4 text-sm text-frost/80">
              <p>Activity: {a.companyDetails.businessActivity || '—'}</p>
              <p>Capital: {a.companyDetails.shareCapitalFCFA?.toLocaleString() ?? '—'} FCFA</p>
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
                  <span className="text-frost/60">{o.nationality} · {o.ownershipPercent}%{o.isPrimaryContact ? ' · primary' : ''}</span>
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
            <div key={d._id} className="flex justify-between rounded-lg border border-frost/10 bg-steel/20 px-4 py-3 text-sm">
              <span className="text-frost">{d.ownerName ? `${d.ownerName} — ` : ''}{d.type} ({d.fileName})</span>
              <span className="text-frost/60">{d.status}</span>
            </div>
          ))}
        </div>

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
