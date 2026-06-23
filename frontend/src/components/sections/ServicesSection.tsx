import { Link } from 'react-router-dom'
import { SectionLabel } from '@/components/common/SectionLabel'
import { MENU } from '@/content/menu'

interface ServiceCard {
  id: string
  title: string
  description: string
  to: string
}

/** Chad-localised descriptions, keyed by menu category id. */
const CHAD_BLURBS: Record<string, string> = {
  'virtual-offices': 'Prestigious Chad business addresses with secure mail handling and forwarding.',
  'company-incorporation': 'Form your company in Chad — residents and non-residents welcome.',
  'company-services': 'Compliance, secretarial, branding and banking to run your Chad company.',
  communication: 'Call answering and virtual numbers for a professional business image.',
  'back-office': 'Data, documents, transcription and quality assurance — handled with precision.',
}

const SERVICE_CARDS: ServiceCard[] = [
  ...MENU.filter((c) => c.overviewPath).map((c) => ({
    id: c.id,
    title: c.label,
    description: CHAD_BLURBS[c.id] ?? c.blurb,
    to: c.overviewPath as string,
  })),
  {
    id: 'chad-free-zone',
    title: 'Chad International Free Zone',
    description: 'Incorporate in a fast-growing free zone with tax advantages and full remote setup.',
    to: '/chad-free-zone',
  },
]

function GlyphIcon({ index }: { index: number }) {
  // Simple distinct line-glyphs per card, in the brand green.
  const paths = [
    'M4 7h16M4 12h10M4 17h16', // address / lines
    'M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z', // incorporation / hexagon
    'M5 5h14v14H5zM9 9h6v6H9z', // services / frames
    'M4 11a8 8 0 0 1 16 0M8 15a4 4 0 0 1 8 0', // comms / waves
    'M5 5h14v6H5zM5 13h8v6H5z', // back office / blocks
    'M12 3l2.6 5.6L20 10l-5.4 1.4L12 17l-2.6-5.6L4 10l5.4-1.4L12 3z', // free zone / star
  ]
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d={paths[index % paths.length]} />
    </svg>
  )
}

export function ServicesSection() {
  return (
    <section id="services" className="py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl items-start gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-14">
        {/* Left: copy */}
        <div className="flex flex-col gap-6">
          <SectionLabel>Business operation solutions</SectionLabel>
          <h2 className="max-w-md font-display text-display-lg font-bold text-frost">
            One gateway with common goals
          </h2>
          <p className="max-w-md font-body text-base leading-relaxed text-frost/60">
            Virtual offices, company incorporation, compliance, communication and back-office
            support — everything to launch and run a company, across every market you operate in.
          </p>
          <div>
            <Link
              to="/virtual-offices"
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-chad-blue px-6 font-display text-base font-semibold text-white transition-colors hover:bg-[#013a87]"
            >
              Explore services
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-chad-yellow text-chad-blue transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </div>
        </div>

        {/* Right: dark service cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {SERVICE_CARDS.map((service, i) => (
            <Link
              key={service.id}
              to={service.to}
              className="group flex flex-col gap-4 rounded-3xl bg-chad-blue p-6 text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#013a87]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-chad-yellow transition-colors group-hover:bg-chad-yellow group-hover:text-chad-blue">
                <GlyphIcon index={i} />
              </span>
              <h3 className="font-display text-lg font-semibold">{service.title}</h3>
              <p className="font-body text-sm leading-relaxed text-white/55">{service.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
