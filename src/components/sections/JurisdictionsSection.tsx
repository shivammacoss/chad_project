import { Link } from 'react-router-dom'
import { SectionLabel } from '@/components/common/SectionLabel'

interface ChadService {
  icon: number
  name: string
  role: string
  blurb: string
  to: string
}

/** Everything you can set up in Chad with us — single-jurisdiction focus. */
const CHAD_SERVICES: ChadService[] = [
  {
    icon: 0,
    name: 'Chad Company Formation',
    role: 'Residents & Non-Residents',
    blurb: 'Register your company in Chad with all documents handled for you.',
    to: '/incorporation/non-resident',
  },
  {
    icon: 1,
    name: 'Registered Office Address',
    role: 'Official Chad Address',
    blurb: 'A compliant registered office and agent address in Chad.',
    to: '/virtual-offices',
  },
  {
    icon: 2,
    name: 'Chad Virtual Office',
    role: 'Mail Handling Included',
    blurb: 'A prestigious Chad business address with mail scanning & forwarding.',
    to: '/virtual-offices',
  },
  {
    icon: 3,
    name: 'Statutory Filings & Compliance',
    role: 'Always in Good Standing',
    blurb: 'We keep your Chad company compliant and filings up to date.',
    to: '/company-services',
  },
]

function ServiceGlyph({ index }: { index: number }) {
  const paths = [
    'M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z', // formation / hexagon
    'M4 10l8-6 8 6v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9z', // address / building
    'M4 7h16M4 12h10M4 17h16', // virtual office / lines
    'M20 6L9 17l-5-5', // compliance / check
  ]
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <path d={paths[index % paths.length]} />
    </svg>
  )
}

export function JurisdictionsSection() {
  return (
    <section id="jurisdictions" className="py-16 sm:py-20">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-5 sm:px-8">
        <div className="flex flex-col gap-5">
          <SectionLabel>Your partner in Chad</SectionLabel>
          <h2 className="max-w-2xl font-display text-display-lg font-bold text-frost">
            One trusted gateway to register and run your company in Chad
          </h2>
          <p className="max-w-xl font-body text-base leading-relaxed text-frost/60">
            We help businesses of every size establish, expand and succeed in Chad — with company
            formation, addresses and ongoing compliance handled in one place.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CHAD_SERVICES.map((s) => (
            <Link
              key={s.name}
              to={s.to}
              className="group flex items-center gap-4 rounded-3xl border border-frost/10 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-xl hover:shadow-frost/10"
            >
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-steel text-indigo-pulse">
                <ServiceGlyph index={s.icon} />
              </span>
              <div className="flex min-w-0 flex-col gap-1.5">
                <div>
                  <h3 className="font-display text-base font-semibold text-frost">{s.name}</h3>
                  <p className="font-body text-xs font-medium text-frost/55">{s.role}</p>
                </div>
                <p className="font-body text-xs text-frost/50">{s.blurb}</p>
                <span className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-teal-electric opacity-0 transition-opacity group-hover:opacity-100">
                  Learn more →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
