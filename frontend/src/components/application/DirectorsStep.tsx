import { Button } from '@/components/ui/Button'
import type { Owner } from '@/types/app'

const inputCls = 'rounded-lg border border-frost/15 bg-navy px-3 py-2 text-sm text-frost outline-none focus:border-teal-electric/50'
const blank: Owner = { fullName: '', role: 'director', nationality: '', isPrimaryContact: false }

export default function DirectorsStep({ value, onChange }: { value: Owner[]; onChange: (n: Owner[]) => void }) {
  const upd = (i: number, p: Partial<Owner>) => onChange(value.map((o, idx) => (idx === i ? { ...o, ...p } : o)))
  const add = () => onChange([...value, { ...blank }])
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i))
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-frost">Directors</h2>
      {value.length === 0 && <p className="text-sm text-frost/55">Add at least one director.</p>}
      {value.map((o, i) => (
        <div key={i} className="rounded-xl border border-frost/10 bg-steel/20 p-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <input className={inputCls} placeholder="Full name" value={o.fullName} onChange={(e) => upd(i, { fullName: e.target.value })} />
            <input className={inputCls} placeholder="Nationality" value={o.nationality} onChange={(e) => upd(i, { nationality: e.target.value })} />
            <label className="flex flex-col gap-1 text-xs text-frost/55">Date of birth
              <input className={inputCls} type="date" value={o.dob ?? ''} onChange={(e) => upd(i, { dob: e.target.value })} />
            </label>
            <input className={inputCls} placeholder="Passport no" value={o.passportNo ?? ''} onChange={(e) => upd(i, { passportNo: e.target.value })} />
            <input className={inputCls} placeholder="Email" value={o.email ?? ''} onChange={(e) => upd(i, { email: e.target.value })} />
            <input className={inputCls} placeholder="Phone" value={o.phone ?? ''} onChange={(e) => upd(i, { phone: e.target.value })} />
            <input className={`${inputCls} sm:col-span-2`} placeholder="Address" value={o.address ?? ''} onChange={(e) => upd(i, { address: e.target.value })} />
          </div>
          <div className="mt-2 flex justify-end"><button type="button" className="text-sm text-indigo-pulse" onClick={() => remove(i)}>Remove</button></div>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add}>+ Add director</Button>
    </div>
  )
}
