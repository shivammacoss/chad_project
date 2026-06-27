import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/content/formations'
import { apiGet, apiPost, apiPatch } from '@/lib/api'
import { useTr } from '@/lib/i18n'
import type { AdminService } from '@/types/app'

const inputCls = 'rounded-lg border border-frost/15 bg-navy px-3 py-2 text-sm text-frost outline-none focus:border-teal-electric/50'

export default function ServicesPanel() {
  const tr = useTr()
  const [items, setItems] = useState<AdminService[]>([])
  const [form, setForm] = useState({ key: '', name: '', category: '', priceUsd: '', country: 'TD' })
  const load = useCallback(() => apiGet<AdminService[]>('/api/admin/services').then(setItems).catch(() => setItems([])), [])
  useEffect(() => { load() }, [load])

  async function toggle(s: AdminService) { await apiPatch(`/api/admin/services/${s.key}`, { active: !s.active }); load() }
  async function setPrice(s: AdminService, usd: string) { const c = Math.round(Number(usd) * 100); if (c >= 0) { await apiPatch(`/api/admin/services/${s.key}`, { priceCents: c }); load() } }
  async function add(e: FormEvent) {
    e.preventDefault()
    if (!form.key || !form.name) return
    await apiPost('/api/admin/services', { key: form.key, name: form.name, category: form.category || 'Other', priceCents: Math.round(Number(form.priceUsd || '0') * 100), country: form.country })
    setForm({ key: '', name: '', category: '', priceUsd: '', country: 'TD' }); load()
  }

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-frost">{tr({ fr: 'Catalogue de services', en: 'Service catalog', ar: 'كتالوج الخدمات' })}</h2>
      <div className="mt-4 grid gap-2">
        {items.map((s) => (
          <div key={s._id} className="flex items-center justify-between rounded-lg border border-frost/10 bg-steel/20 px-4 py-2 text-sm">
            <div>
              <p className="font-medium text-frost">{s.name} <span className="text-frost/50">· {s.category} · {s.flow}{s.country && ` · ${s.country}`}</span></p>
              <p className="text-frost/55">{formatPrice(s.priceCents)} {!s.active && <span className="text-indigo-pulse">· {tr({ fr: 'inactif', en: 'inactive', ar: 'غير نشط' })}</span>}</p>
            </div>
            <div className="flex items-center gap-2">
              <input className={`${inputCls} w-24`} type="number" defaultValue={(s.priceCents / 100).toString()} onBlur={(e) => setPrice(s, e.target.value)} />
              <Button size="sm" variant="outline" onClick={() => toggle(s)}>{s.active ? tr({ fr: 'Désactiver', en: 'Disable', ar: 'تعطيل' }) : tr({ fr: 'Activer', en: 'Enable', ar: 'تفعيل' })}</Button>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={add} className="mt-4 flex flex-wrap items-end gap-2 rounded-xl border border-frost/10 bg-steel/20 p-4">
        <input className={inputCls} placeholder={tr({ fr: 'clé', en: 'key', ar: 'مفتاح' })} value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} />
        <input className={inputCls} placeholder={tr({ fr: 'Nom', en: 'Name', ar: 'الاسم' })} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className={inputCls} placeholder={tr({ fr: 'Catégorie', en: 'Category', ar: 'الفئة' })} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <input className={`${inputCls} w-24`} type="number" placeholder={tr({ fr: 'USD', en: 'USD', ar: 'دولار' })} value={form.priceUsd} onChange={(e) => setForm({ ...form, priceUsd: e.target.value })} />
        <input className={`${inputCls} w-24`} placeholder={tr({ fr: 'Pays', en: 'Country', ar: 'البلد' })} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
        <Button type="submit" size="sm">{tr({ fr: 'Ajouter un service', en: 'Add service', ar: 'إضافة خدمة' })}</Button>
      </form>
    </section>
  )
}
