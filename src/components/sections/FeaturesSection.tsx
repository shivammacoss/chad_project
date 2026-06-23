import { SectionLabel } from '@/components/common/SectionLabel'
import type { Feature } from '@/types'

const FEATURES: Feature[] = [
  {
    id: 'W-01',
    title: 'Non-Resident Friendly',
    description:
      'Same process and pricing whether you live in the country or anywhere else in the world.',
  },
  {
    id: 'W-02',
    title: 'Fast Chad Filing',
    description: 'Company formation filed directly with the Chad authorities — handled end to end.',
  },
  {
    id: 'W-03',
    title: 'Registered Agent Included',
    description: 'Registered office and agent services bundled with your incorporation packages.',
  },
  {
    id: 'W-04',
    title: 'Secure & Confidential',
    description: 'Your data and mail handled to recognised security and compliance standards.',
  },
  {
    id: 'W-05',
    title: 'Worldwide Support',
    description: 'A real team available around the clock to guide you through every step.',
  },
  {
    id: 'W-06',
    title: 'Transparent Pricing',
    description: 'Clear, fixed fees with no hidden costs — you always know what you pay.',
  },
]

export function FeaturesSection() {
  return (
    <section id="why" className="border-t border-frost/10 bg-navy">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="mb-12 flex flex-col gap-4">
          <SectionLabel index="04">Why GRIDGLOBAL GATE</SectionLabel>
          <h2 className="max-w-2xl text-display-lg font-semibold text-frost">
            Built to make global business simple.
          </h2>
          <p className="max-w-xl font-body text-base leading-relaxed text-frost/60">
            From your first filing to ongoing compliance, every part of running a company lives in
            one trusted place.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-frost/10 bg-frost/10 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <article
              key={feature.id}
              className="group flex flex-col gap-4 bg-navy p-7 transition-colors duration-300 hover:bg-steel/60 sm:p-8"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-medium tracking-wider text-teal-electric/80">
                  {feature.id}
                </span>
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-frost/20 transition-colors duration-300 group-hover:bg-teal-electric"
                />
              </div>
              <h3 className="font-display text-xl font-semibold text-frost">{feature.title}</h3>
              <p className="font-body text-sm leading-relaxed text-frost/60">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
