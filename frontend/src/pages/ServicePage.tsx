import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SectionLabel } from '@/components/common/SectionLabel'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import type { MenuCategory, ServicePage as ServicePageContent } from '@/content/menu'
import { useTr, type Localized } from '@/lib/i18n'

interface ServicePageProps {
  page: ServicePageContent
  category: MenuCategory
}

const TRUST: Localized[] = [
  {
    fr: "Agent agréé de création d'entreprise au Tchad",
    en: 'Registered company-formation agent in Chad',
    ar: 'وكيل معتمد لتأسيس الشركات في تشاد',
  },
  {
    fr: 'Même processus et tarifs pour les non-résidents',
    en: 'Same process & pricing for non-residents',
    ar: 'نفس الإجراءات والأسعار لغير المقيمين',
  },
  {
    fr: 'Traitement sécurisé et confidentiel',
    en: 'Secure, confidential handling',
    ar: 'معالجة آمنة وسرية',
  },
]

/** Generic template that renders any service sub-page from content data. */
export default function ServicePage({ page, category }: ServicePageProps) {
  const navigate = useNavigate()
  const ctaTo = page.ctaTo ?? '/contact'
  const tr = useTr()

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
                { label: tr({ fr: 'Accueil', en: 'Home', ar: 'الرئيسية' }), to: '/' },
                { label: tr(category.label), to: category.overviewPath },
                { label: tr(page.menuLabel) },
              ]}
            />

            <SectionLabel>{tr(category.label)}</SectionLabel>

            <h1 className="text-display-lg font-bold text-frost">{tr(page.heroTitle)}</h1>

            {page.note && (
              <Badge tone="neutral" withDot={false} className="w-fit">
                {tr(page.note)}
              </Badge>
            )}

            <p className="max-w-2xl font-body text-lg leading-relaxed text-frost/65">{tr(page.intro)}</p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button variant="primary" size="lg" onClick={() => navigate(ctaTo)}>
                {tr(page.cta)}
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/contact')}>
                {tr({ fr: 'Parler à un conseiller', en: 'Talk to an Advisor', ar: 'تحدث إلى مستشار' })}
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
              <SectionLabel index="01">
                {tr({ fr: 'Ce que nous offrons', en: 'What we offer', ar: 'ما نقدمه' })}
              </SectionLabel>
              <h2 className="max-w-2xl text-display-md font-semibold text-frost">
                {tr({ fr: 'Tout est inclus dans', en: 'Everything included in', ar: 'كل ما يشمله' })}{' '}
                {tr(page.menuLabel).toLowerCase()}.
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-frost/10 bg-frost/10 sm:grid-cols-2 lg:grid-cols-3">
              {page.sections.map((section, i) => (
                <article
                  key={i}
                  className="group flex flex-col gap-3 bg-navy p-7 transition-colors duration-300 hover:bg-steel/60"
                >
                  <span className="font-mono text-xs font-medium tracking-wider text-teal-electric/80">
                    S-{String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-display text-lg font-semibold text-frost">{tr(section.title)}</h3>
                  <p className="font-body text-sm leading-relaxed text-frost/60">
                    {tr(section.description)}
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
            <div key={item.en} className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-electric" />
              <span className="font-body text-sm text-frost/70">{tr(item)}</span>
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
                <h2 className="text-display-md font-bold text-frost">
                  {tr({ fr: 'Prêt à commencer ?', en: 'Ready to get started?', ar: 'هل أنت مستعد للبدء؟' })}
                </h2>
                <p className="max-w-md font-body text-base text-frost/60">
                  {tr({
                    fr: 'Notre équipe répond généralement en un jour ouvrable.',
                    en: 'Our team typically responds within one business day.',
                    ar: 'يستجيب فريقنا عادةً خلال يوم عمل واحد.',
                  })}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button variant="primary" size="lg" onClick={() => navigate(ctaTo)}>
                  {tr(page.cta)}
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate('/contact')}>
                  {tr({ fr: 'Contactez-nous', en: 'Contact Us', ar: 'اتصل بنا' })}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
