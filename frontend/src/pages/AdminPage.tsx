import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/formations/StatusBadge'
import { ENTITY_TYPES } from '@/content/formations'
import { apiGet, apiPatch } from '@/lib/api'
import type { Application } from '@/types/app'

const ADMIN_STATUSES = ['in_review', 'filing_submitted', 'registered', 'needs_more_docs', 'rejected'] as const

function clientEmail(f: Application): string {
  return typeof f.userId === 'object' && f.userId ? f.userId.email : '—'
}

export default function AdminPage() {
  const [items, setItems] = useState<Application[]>([])
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setItems(await apiGet<Application[]>('/api/admin/applications'))
  }, [])
  useEffect(() => { load() }, [load])

  async function advance(f: Application, status: string) {
    setBusyId(f._id)
    try {
      await apiPatch(`/api/admin/applications/${f._id}/status`, { status })
      await load()
    } finally { setBusyId(null) }
  }

  return (
    <div className="min-h-screen bg-navy pt-16">
      <div className="mx-auto max-w-5xl px-5 py-12">
        <h1 className="text-3xl font-semibold text-frost">Admin — Applications</h1>
        <div className="mt-8 grid gap-3">
          {items.map((f) => (
            <div key={f._id} className="rounded-xl border border-frost/10 bg-steel/20 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-frost">{f.companyDetails.proposedName}</p>
                  <p className="text-sm text-frost/55">
                    {ENTITY_TYPES.find((e) => e.value === f.entityType)?.label} · {clientEmail(f)}
                  </p>
                </div>
                <StatusBadge status={f.status} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {ADMIN_STATUSES.map((s) => (
                  <Button key={s} size="sm" variant="outline" disabled={busyId === f._id} onClick={() => advance(f, s)}>
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
