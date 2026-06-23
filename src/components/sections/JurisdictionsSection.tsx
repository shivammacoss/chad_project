import { Link } from 'react-router-dom'
import { SectionLabel } from '@/components/common/SectionLabel'

interface Jurisdiction {
  code: string
  name: string
  role: string
  blurb: string
  to: string
}

const JURISDICTIONS: Jurisdiction[] = [
  {
    code: 'GB',
    name: 'United Kingdom',
    role: 'Same-Day Ltd Formation',
    blurb: 'Registered office & director service address.',
    to: '/incorporation/uk-limited-company',
  },
  {
    code: 'US',
    name: 'United States',
    role: 'LLC & Corporation',
    blurb: 'All states, with registered agent and EIN.',
    to: '/incorporation/usa-llc',
  },
  {
    code: 'CA',
    name: 'Canada',
    role: 'Federal & Provincial',
    blurb: 'Incorporation with registered-agent support.',
    to: '/incorporation/canada',
  },
  {
    code: 'TD',
    name: 'Chad Free Zone',
    role: '100% Foreign Ownership',
    blurb: 'Tax-efficient structure, fully remote setup.',
    to: '/chad-free-zone',
  },
]

export function JurisdictionsSection() {
  return (
    <section id="jurisdictions" className="py-16 sm:py-20">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-5 sm:px-8">
        <div className="flex flex-col gap-5">
          <SectionLabel>Where you can incorporate</SectionLabel>
          <h2 className="max-w-2xl font-display text-display-lg font-bold text-frost">
            Four jurisdictions of trusted professionals
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {JURISDICTIONS.map((j) => (
            <Link
              key={j.code}
              to={j.to}
              className="group flex items-center gap-4 rounded-3xl border border-frost/10 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-xl hover:shadow-frost/10"
            >
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-steel font-mono text-lg font-semibold text-indigo-pulse">
                {j.code}
              </span>
              <div className="flex min-w-0 flex-col gap-1.5">
                <div>
                  <h3 className="font-display text-base font-semibold text-frost">{j.name}</h3>
                  <p className="font-body text-xs font-medium text-frost/55">{j.role}</p>
                </div>
                <p className="truncate font-body text-xs text-frost/50">{j.blurb}</p>
                <span className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-teal-electric opacity-0 transition-opacity group-hover:opacity-100">
                  Incorporate →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
