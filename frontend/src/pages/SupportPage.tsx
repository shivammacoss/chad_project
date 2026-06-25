import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { apiGet, apiPost } from '@/lib/api'
import type { Ticket } from '@/types/app'

const inputCls = 'w-full rounded-lg border border-frost/15 bg-navy px-4 py-3 text-sm text-frost outline-none focus:border-teal-electric/50'
const CATEGORIES = ['legal', 'payment', 'documents', 'technical', 'other']

export default function SupportPage() {
  const [items, setItems] = useState<Ticket[]>([])
  const [sel, setSel] = useState<Ticket | null>(null)
  const [form, setForm] = useState({ category: 'other', subject: '', body: '' })
  const [reply, setReply] = useState('')

  const load = () => apiGet<Ticket[]>('/api/tickets').then(setItems).catch(() => setItems([]))
  useEffect(() => { load() }, [])

  async function create(e: FormEvent) {
    e.preventDefault()
    if (!form.subject || !form.body) return
    const t = await apiPost<Ticket>('/api/tickets', form)
    setForm({ category: 'other', subject: '', body: '' }); setSel(t); load()
  }
  async function sendReply() {
    if (!sel || !reply) return
    const t = await apiPost<Ticket>(`/api/tickets/${sel._id}/messages`, { body: reply })
    setSel(t); setReply(''); load()
  }

  return (
    <div className="min-h-screen bg-navy pt-16">
      <div className="mx-auto grid max-w-5xl gap-6 px-5 py-12 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <h1 className="text-2xl font-semibold text-frost">Support</h1>
          <form onSubmit={create} className="mt-4 flex flex-col gap-2 rounded-xl border border-frost/10 bg-steel/20 p-4">
            <select className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input className={inputCls} placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            <textarea className={inputCls} placeholder="Describe your issue" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
            <Button type="submit">Open ticket</Button>
          </form>
          <div className="mt-4 grid gap-2">
            {items.map((t) => (
              <button key={t._id} onClick={() => setSel(t)} className={`rounded-xl border px-4 py-3 text-left ${sel?._id === t._id ? 'border-teal-electric/50 bg-teal-electric/10' : 'border-frost/10 bg-steel/20'}`}>
                <p className="font-medium text-frost">{t.subject}</p>
                <p className="text-sm text-frost/55">{t.category} · {t.status}</p>
              </button>
            ))}
          </div>
        </div>
        <div>
          {!sel ? <p className="text-frost/55">Select or open a ticket.</p> : (
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-medium text-frost">{sel.subject} <span className="text-sm text-frost/50">({sel.status})</span></h2>
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
                <Button onClick={sendReply}>Send</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
