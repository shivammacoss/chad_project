import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { StatusBadge } from '@/components/formations/StatusBadge'
import { ENTITY_TYPES, STATUS_LABEL, formatPrice } from '@/content/formations'
import { apiGet } from '@/lib/api'
import type { Formation, DocItem, FormationStatus } from '@/types/app'

export default function FormationDetailPage() {
  const { id } = useParams()
  const [f, setF] = useState<Formation | null>(null)
  const [docs, setDocs] = useState<DocItem[]>([])

  useEffect(() => {
    if (!id) return
    apiGet<Formation>(`/api/formations/${id}`).then(setF).catch(() => setF(null))
    apiGet<DocItem[]>(`/api/formations/${id}/documents`).then(setDocs).catch(() => setDocs([]))
  }, [id])

  if (!f) return <div className="min-h-screen bg-navy pt-24 text-center text-frost/60">Loading…</div>

  return (
    <div className="min-h-screen bg-navy pt-16">
      <div className="mx-auto max-w-2xl px-5 py-12">
        <Link to="/dashboard" className="text-sm text-teal-electric">← Back to dashboard</Link>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-frost">{f.companyName}</h1>
            <p className="text-sm text-frost/55">
              {ENTITY_TYPES.find((e) => e.value === f.entityType)?.label} · {formatPrice(f.priceCents)}
            </p>
          </div>
          <StatusBadge status={f.status} />
        </div>

        <h2 className="mt-10 text-sm uppercase tracking-wider text-frost/50">Documents</h2>
        <div className="mt-3 grid gap-2">
          {docs.length === 0 && <p className="text-sm text-frost/55">No documents uploaded.</p>}
          {docs.map((d) => (
            <div key={d._id} className="flex justify-between rounded-lg border border-frost/10 bg-steel/20 px-4 py-3 text-sm">
              <span className="text-frost">{d.type} — {d.fileName}</span>
              <span className="text-frost/60">{d.status}</span>
            </div>
          ))}
        </div>

        <h2 className="mt-10 text-sm uppercase tracking-wider text-frost/50">Timeline</h2>
        <ol className="mt-3 border-l border-frost/15 pl-5">
          {f.statusHistory.map((h, i) => (
            <li key={i} className="relative pb-5">
              <span className="absolute -left-[23px] top-1 h-2.5 w-2.5 rounded-full bg-teal-electric" />
              <p className="text-frost">{STATUS_LABEL[h.status as FormationStatus] ?? h.status}</p>
              {h.note && <p className="text-sm text-frost/55">{h.note}</p>}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
