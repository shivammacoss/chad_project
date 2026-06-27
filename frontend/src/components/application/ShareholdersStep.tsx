import { Button } from '@/components/ui/Button'
import { useTr } from '@/lib/i18n'
import type { Owner } from '@/types/app'

const inputCls = 'rounded-lg border border-frost/15 bg-navy px-3 py-2 text-sm text-frost outline-none focus:border-teal-electric/50'
const blank: Owner = { fullName: '', role: 'shareholder', nationality: '', ownershipPercent: 0, isCorporate: false, isPrimaryContact: false }

export default function ShareholdersStep({ value, onChange }: { value: Owner[]; onChange: (n: Owner[]) => void }) {
  const tr = useTr()
  const upd = (i: number, p: Partial<Owner>) => onChange(value.map((o, idx) => (idx === i ? { ...o, ...p } : o)))
  const add = () => onChange([...value, { ...blank, isPrimaryContact: value.length === 0 }])
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i))
  const total = value.reduce((s, o) => s + (Number(o.ownershipPercent) || 0), 0)
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-frost">{tr({ fr: 'Actionnaires', en: 'Shareholders', ar: 'المساهمون' })}</h2>
      {value.length === 0 && <p className="text-sm text-frost/55">{tr({ fr: 'Ajoutez au moins un actionnaire.', en: 'Add at least one shareholder.', ar: 'أضف مساهمًا واحدًا على الأقل.' })}</p>}
      {value.map((o, i) => (
        <div key={i} className="rounded-xl border border-frost/10 bg-steel/20 p-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <input className={inputCls} placeholder={tr({ fr: 'Nom complet / société', en: 'Full name / company', ar: 'الاسم الكامل / الشركة' })} value={o.fullName} onChange={(e) => upd(i, { fullName: e.target.value })} />
            <input className={inputCls} placeholder={tr({ fr: 'Nationalité', en: 'Nationality', ar: 'الجنسية' })} value={o.nationality} onChange={(e) => upd(i, { nationality: e.target.value })} />
            <input className={inputCls} type="number" placeholder={tr({ fr: 'Pourcentage de participation', en: 'Ownership %', ar: 'نسبة الملكية' })} value={o.ownershipPercent ?? 0} onChange={(e) => upd(i, { ownershipPercent: Number(e.target.value) })} />
            <input className={inputCls} placeholder={tr({ fr: 'Passeport / numéro d\'immatriculation', en: 'Passport / Reg no', ar: 'جواز السفر / رقم التسجيل' })} value={o.passportNo ?? ''} onChange={(e) => upd(i, { passportNo: e.target.value })} />
            <input className={inputCls} placeholder={tr({ fr: 'E-mail', en: 'Email', ar: 'البريد الإلكتروني' })} value={o.email ?? ''} onChange={(e) => upd(i, { email: e.target.value })} />
            <input className={inputCls} placeholder={tr({ fr: 'Téléphone', en: 'Phone', ar: 'الهاتف' })} value={o.phone ?? ''} onChange={(e) => upd(i, { phone: e.target.value })} />
            <input className={`${inputCls} sm:col-span-2`} placeholder={tr({ fr: 'Adresse', en: 'Address', ar: 'العنوان' })} value={o.address ?? ''} onChange={(e) => upd(i, { address: e.target.value })} />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-frost/70">
              <input type="checkbox" checked={o.isCorporate ?? false} onChange={(e) => upd(i, { isCorporate: e.target.checked })} /> {tr({ fr: 'L\'actionnaire est une société', en: 'Shareholder is a company', ar: 'المساهم شركة' })}
            </label>
            <button type="button" className="text-sm text-indigo-pulse" onClick={() => remove(i)}>{tr({ fr: 'Supprimer', en: 'Remove', ar: 'إزالة' })}</button>
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={add}>{tr({ fr: '+ Ajouter un actionnaire', en: '+ Add shareholder', ar: '+ إضافة مساهم' })}</Button>
        <span className={total === 100 ? 'text-sm text-teal-electric' : 'text-sm text-indigo-pulse'}>{tr({ fr: 'Total de l\'actionnariat', en: 'Shareholding total', ar: 'إجمالي حصص المساهمة' })}: {total}%</span>
      </div>
    </div>
  )
}
