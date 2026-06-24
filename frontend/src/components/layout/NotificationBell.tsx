import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiGet, apiPatch } from '@/lib/api'
import type { Notification } from '@/types/app'

export default function NotificationBell() {
  const navigate = useNavigate()
  const [count, setCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Notification[]>([])

  const loadCount = () => apiGet<{ count: number }>('/api/notifications/unread-count').then((r) => setCount(r.count)).catch(() => {})
  useEffect(() => { loadCount() }, [])

  async function toggle() {
    const next = !open
    setOpen(next)
    if (next) setItems(await apiGet<Notification[]>('/api/notifications').catch(() => []))
  }
  async function openItem(n: Notification) {
    if (!n.read) await apiPatch(`/api/notifications/${n._id}/read`, {}).catch(() => {})
    setOpen(false); loadCount()
    navigate(n.link || '/dashboard')
  }
  async function markAll() {
    await apiPatch('/api/notifications/read-all', {}).catch(() => {})
    setItems((xs) => xs.map((x) => ({ ...x, read: true }))); setCount(0)
  }

  return (
    <div className="relative">
      <button type="button" onClick={toggle} className="relative text-frost/70 hover:text-frost" aria-label="Notifications">
        <span className="text-lg">🔔</span>
        {count > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-pulse px-1 text-[10px] font-semibold text-frost">{count}</span>}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-frost/15 bg-steel/95 p-2 shadow-xl backdrop-blur">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-sm font-medium text-frost">Notifications</span>
            <button className="text-xs text-teal-electric" onClick={markAll}>Mark all read</button>
          </div>
          {items.length === 0 && <p className="px-2 py-3 text-sm text-frost/55">No notifications.</p>}
          {items.map((n) => (
            <button key={n._id} onClick={() => openItem(n)}
              className={`block w-full rounded-lg px-2 py-2 text-left text-sm ${n.read ? 'text-frost/55' : 'bg-navy/40 text-frost'}`}>
              <span className="font-medium">{n.title}</span>
              <span className="block text-xs text-frost/55">{n.body}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
