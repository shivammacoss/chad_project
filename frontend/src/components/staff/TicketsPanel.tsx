import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { apiGet, apiPost, apiPatch } from '@/lib/api'
import type { Ticket } from '@/types/app'

const inputCls = 'w-full rounded-lg border border-frost/15 bg-navy px-3 py-2 text-sm text-frost outline-none focus:border-teal-electric/50'

export default function TicketsPanel() {
  const [items, setItems] = useState<Ticket[]>([])
  const [sel, setSel] = useState<Ticket | null>(null)
  const [reply, setReply] = useState('')
  const load = useCallback(() => apiGet<Ticket[]>('/api/staff/tickets').then(setItems).catch(() => setItems([])), [])
  useEffect(() => { load() }, [load])
  const open = async (id: string) => setSel(await apiGet<Ticket>(`/api/staff/tickets/${id}`))
  async function send() { if (!sel || !reply) return; const t = await apiPost<Ticket>(`/api/staff/tickets/${sel._id}/messages`, { body: reply }); setSel(t); setReply(''); load() }
  async function setStatus(status: string) { if (!sel) return; const t = await apiPatch<Ticket>(`/api/staff/tickets/${sel._id}`, { status }); setSel(t); load() }

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-frost">Support tickets</h2>
      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="grid gap-2">
          {items.length === 0 && <p className="text-sm text-frost/55">No tickets.</p>}
          {items.map((t) => (
            <button key={t._id} onClick={() => open(t._id)} className={`rounded-xl border px-4 py-3 text-left ${sel?._id === t._id ? 'border-teal-electric/50 bg-teal-electric/10' : 'border-frost/10 bg-steel/20'}`}>
              <p className="font-medium text-frost">{t.subject}</p>
              <p className="text-sm text-frost/55">{t.category} · {t.status}</p>
            </button>
          ))}
        </div>
        <div>
          {!sel ? <p className="text-frost/55">Select a ticket.</p> : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-frost">{sel.subject}</h3>
                <Button size="sm" variant="outline" onClick={() => setStatus(sel.status === 'open' ? 'closed' : 'open')}>{sel.status === 'open' ? 'Close' : 'Reopen'}</Button>
              </div>
              <div className="grid gap-2">
                {sel.messages.map((m, i) => (
                  <div key={i} className="rounded-lg border border-frost/10 bg-steel/20 px-4 py-2 text-sm">
                    <p className="text-xs uppercase tracking-wider text-frost/40">{m.authorRole}</p>
                    <p className="text-frost">{m.body}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input className={inputCls} placeholder="Reply…" value={reply} onChange={(e) => setReply(e.target.value)} />
                <Button onClick={send}>Send</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
