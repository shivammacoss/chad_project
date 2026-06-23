import { Button } from '@/components/ui/Button'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { ArrowRightIcon, SERVICE_ICONS } from '@/components/ui/Icons'
import { SERVICES } from '@/data'

export function Services() {
  return (
    <section id="services" className="py-16 sm:py-20">
      <div className="container-x grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Left: copy */}
        <div className="flex flex-col gap-6">
          <SectionLabel>Packed with cool stuff</SectionLabel>
          <h2 className="max-w-md text-balance font-display text-h-lg font-bold text-ink">
            Creative community with common goals
          </h2>
          <p className="max-w-md font-body text-base leading-relaxed text-slatey">
            Credibly fashion dynamic thinking without intermandated alignments. Continually develop
            sustainable leadership and empowered metrics, then synergistically underwhelm emerging
            value for sticky testing procedures.
          </p>
          <div>
            <Button variant="dark" size="lg" className="group">
              More about services
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-ink transition-transform group-hover:translate-x-0.5">
                <ArrowRightIcon className="h-4 w-4" />
              </span>
            </Button>
          </div>
        </div>

        {/* Right: 2x2 dark service cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {SERVICES.map((service) => {
            const Icon = SERVICE_ICONS[service.icon]
            return (
              <article
                key={service.id}
                className="group flex flex-col gap-4 rounded-3xl bg-ink p-6 text-white transition-all duration-300 hover:-translate-y-1 hover:bg-ink-soft"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-brand transition-colors group-hover:bg-brand group-hover:text-ink">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="font-display text-lg font-semibold">{service.title}</h3>
                <p className="font-body text-sm leading-relaxed text-white/55">
                  {service.description}
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
