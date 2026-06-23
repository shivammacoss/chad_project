import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SectionLabel } from '@/components/common/SectionLabel'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import type { MenuCategory, ServicePage as ServicePageContent } from '@/content/menu'

interface ServicePageProps {
  page: ServicePageContent
  category: MenuCategory
}

const TRUST = [
  'Registered Companies House agent',
  'Same process & pricing for non-residents',
  'Secure, confidential handling',
]

/** Generic template that renders any service sub-page from content data. */
export default function ServicePage({ page, category }: ServicePageProps) {
  const navigate = useNavigate()
  const ctaTo = page.ctaTo ?? '/contact'

  return (
    <div className="bg-navy">
      {/* Hero */}
      <section className="relative overflow-hidden pt-16">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-grid-pattern bg-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-hero-gradient opacity-70" />

        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="flex max-w-3xl flex-col gap-6 motion-safe:animate-fade-up">
            <Breadcrumb
              items={[
                { label: 'Home', to: '/' },
                { label: category.label, to: category.overviewPath },
                { label: page.menuLabel },
              ]}
            />

            <SectionLabel>{category.label}</SectionLabel>

            <h1 className="text-display-lg font-bold text-frost">{page.heroTitle}</h1>

            {page.note && (
              <Badge tone="neutral" withDot={false} className="w-fit">
                {page.note}
              </Badge>
            )}

            <p className="max-w-2xl font-body text-lg leading-relaxed text-frost/65">{page.intro}</p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button variant="primary" size="lg" onClick={() => navigate(ctaTo)}>
                {page.cta}
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/contact')}>
                Talk to an Advisor
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Sections */}
      {page.sections.length > 0 && (
        <section className="border-t border-frost/10">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
            <div className="mb-10 flex flex-col gap-3">
              <SectionLabel index="01">What we offer</SectionLabel>
              <h2 className="max-w-2xl text-display-md font-semibold text-frost">
                Everything included in {page.menuLabel.toLowerCase()}.
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-frost/10 bg-frost/10 sm:grid-cols-2 lg:grid-cols-3">
              {page.sections.map((section, i) => (
                <article
                  key={section.title}
                  className="group flex flex-col gap-3 bg-navy p-7 transition-colors duration-300 hover:bg-steel/60"
                >
                  <span className="font-mono text-xs font-medium tracking-wider text-teal-electric/80">
                    S-{String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-display text-lg font-semibold text-frost">{section.title}</h3>
                  <p className="font-body text-sm leading-relaxed text-frost/60">
                    {section.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust strip */}
      <section className="border-t border-frost/10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-5 py-10 sm:grid-cols-3 sm:px-8">
          {TRUST.map((item) => (
            <div key={item} className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-electric" />
              <span className="font-body text-sm text-frost/70">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="border-t border-frost/10">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="relative overflow-hidden rounded-3xl border border-teal-electric/15 bg-steel/30 px-6 py-14 sm:px-12">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-grid-pattern bg-grid [mask-image:radial-gradient(ellipse_60%_80%_at_50%_50%,black,transparent)]"
            />
            <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2">
                <h2 className="text-display-md font-bold text-frost">Ready to get started?</h2>
                <p className="max-w-md font-body text-base text-frost/60">
                  Our team typically responds within one business day.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button variant="primary" size="lg" onClick={() => navigate(ctaTo)}>
                  {page.cta}
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate('/contact')}>
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
