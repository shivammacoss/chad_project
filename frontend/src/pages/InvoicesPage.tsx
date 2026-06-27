import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/content/formations'
import { apiGet, apiUrl } from '@/lib/api'
import { useTr } from '@/lib/i18n'
import type { Invoice } from '@/types/app'

export default function InvoicesPage() {
  const tr = useTr()
  const [items, setItems] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { apiGet<Invoice[]>('/api/invoices').then(setItems).catch(() => setItems([])).finally(() => setLoading(false)) }, [])

  return (
    <div className="min-h-screen bg-navy pt-16">
      <div className="mx-auto max-w-4xl px-5 py-12">
        <div className="flex items-center justify-between border-b border-frost/10 pb-6">
          <h1 className="text-2xl font-semibold text-frost">{tr({ fr: 'Factures et paiements', en: 'Invoices & payments', ar: 'الفواتير والمدفوعات' })}</h1>
          <Link to="/dashboard"><Button variant="ghost">{tr({ fr: 'Tableau de bord', en: 'Dashboard', ar: 'لوحة التحكم' })}</Button></Link>
        </div>
        {loading ? <p className="mt-8 text-frost/55">{tr({ fr: 'Chargement…', en: 'Loading…', ar: 'جارٍ التحميل…' })}</p>
          : items.length === 0 ? <p className="mt-8 text-frost/55">{tr({ fr: 'Aucune facture pour le moment.', en: 'No invoices yet.', ar: 'لا توجد فواتير بعد.' })}</p>
          : (
            <div className="mt-6 grid gap-2">
              {items.map((inv) => (
                <div key={inv._id} className="flex items-center justify-between rounded-xl border border-frost/10 bg-steel/20 px-5 py-4 text-sm">
                  <div>
                    <p className="font-medium text-frost">{inv.invoiceNo} · {inv.serviceName}</p>
                    <p className="text-frost/55">{formatPrice(inv.amountCents)} · {inv.method} · <span className={inv.status === 'paid' ? 'text-teal-electric' : 'text-indigo-pulse'}>{inv.status}</span></p>
                  </div>
                  <a href={apiUrl(`/api/invoices/${inv._id}/pdf`)} target="_blank" rel="noreferrer" className="text-teal-electric">{tr({ fr: 'Télécharger', en: 'Download', ar: 'تنزيل' })}</a>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  )
}
