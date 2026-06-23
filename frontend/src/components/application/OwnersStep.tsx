import { OWNER_ROLES } from '@/content/formations'
import { Button } from '@/components/ui/Button'
import type { Owner } from '@/types/app'

const inputCls = 'rounded-lg border border-frost/15 bg-navy px-3 py-2 text-sm text-frost outline-none focus:border-teal-electric/50'
const blank: Owner = { fullName: '', role: 'both', nationality: '', ownershipPercent: 0, isPrimaryContact: false }

export default function OwnersStep({ owners, onChange }: { owners: Owner[]; onChange: (next: Owner[]) => void }) {
  const update = (i: number, patch: Partial<Owner>) => onChange(owners.map((o, idx) => (idx === i ? { ...o, ...patch } : (patch.isPrimaryContact ? { ...o, isPrimaryContact: false } : o))))
  const add = () => onChange([...owners, { ...blank, isPrimaryContact: owners.length === 0 }])
  const remove = (i: number) => onChange(owners.filter((_, idx) => idx !== i))
  const total = owners.reduce((s, o) => s + (Number(o.ownershipPercent) || 0), 0)

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-frost">Owners & directors</h2>
      {owners.length === 0 && <p className="text-sm text-frost/55">Add at least one owner.</p>}
      {owners.map((o, i) => (
        <div key={i} className="rounded-xl border border-frost/10 bg-steel/20 p-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <input className={inputCls} placeholder="Full name" value={o.fullName} onChange={(e) => update(i, { fullName: e.target.value })} />
            <select className={inputCls} value={o.role} onChange={(e) => update(i, { role: e.target.value as Owner['role'] })}>
              {OWNER_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <input className={inputCls} placeholder="Nationality" value={o.nationality} onChange={(e) => update(i, { nationality: e.target.value })} />
            <input className={inputCls} type="number" placeholder="Ownership %" value={o.ownershipPercent} onChange={(e) => update(i, { ownershipPercent: Number(e.target.value) })} />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-frost/70">
              <input type="radio" name="primary" checked={o.isPrimaryContact} onChange={() => update(i, { isPrimaryContact: true })} /> Primary contact
            </label>
            <button type="button" className="text-sm text-indigo-pulse" onClick={() => remove(i)}>Remove</button>
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={add}>+ Add owner</Button>
        <span className={total === 100 ? 'text-sm text-teal-electric' : 'text-sm text-indigo-pulse'}>Shareholding total: {total}%</span>
      </div>
    </div>
  )
}
