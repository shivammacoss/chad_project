import { Link } from 'react-router-dom'
import { SectionLabel } from '@/components/common/SectionLabel'

interface ChadService {
  num: string
  name: string
  role: string
  blurb: string
  to: string
  /** Background image path for the box. Leave '' to show the dark placeholder. */
  image: string
}

/** Everything you can set up in Chad with us — single-jurisdiction focus. */
const CHAD_SERVICES: ChadService[] = [
  {
    num: '01',
    name: 'Chad Company Formation',
    role: 'Residents & Non-Residents',
    blurb: 'Register your company in Chad with all documents handled for you.',
    to: '/incorporation/non-resident',
    image: '/box1.png',
  },
  {
    num: '02',
    name: 'Registered Office Address',
    role: 'Official Chad Address',
    blurb: 'A compliant registered office and agent address in Chad.',
    to: '/virtual-offices',
    image: '/box2.png',
  },
  {
    num: '03',
    name: 'Chad Virtual Office',
    role: 'Mail Handling Included',
    blurb: 'A prestigious Chad business address with mail scanning & forwarding.',
    to: '/virtual-offices',
    image: '/box3.png',
  },
  {
    num: '04',
    name: 'Statutory Filings & Compliance',
    role: 'Always in Good Standing',
    blurb: 'We keep your Chad company compliant and filings up to date.',
    to: '/company-services',
    image: '/box4.png',
  },
]

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

        <div className="grid gap-5 sm:grid-cols-2">
          {CHAD_SERVICES.map((s) => (
            <Link
              key={s.name}
              to={s.to}
              className="group relative flex min-h-[210px] items-center overflow-hidden rounded-3xl bg-frost bg-cover bg-center p-7 sm:p-8"
              style={s.image ? { backgroundImage: `url(${s.image})` } : undefined}
            >
              {/* Dark overlay so text stays readable over any image */}
              <div className="absolute inset-0 bg-frost/70 transition-colors duration-300 group-hover:bg-frost/60" />

              {/* Large faded step number watermark */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 select-none font-display text-[8rem] font-bold leading-none text-white/25 sm:left-6"
              >
                {s.num}
              </span>

              {/* Text content, offset to the right of the number */}
              <div className="relative ml-auto flex w-[62%] flex-col gap-2">
                <div>
                  <h3 className="font-display text-lg font-semibold leading-snug text-white">
                    {s.name}
                  </h3>
                  <p className="font-body text-xs font-medium text-chad-yellow">{s.role}</p>
                </div>
                <p className="font-body text-sm leading-relaxed text-white/75">{s.blurb}</p>
                <span className="mt-1 inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-chad-yellow transition-all group-hover:gap-2">
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
