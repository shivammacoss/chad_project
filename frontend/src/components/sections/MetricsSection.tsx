import { MetricCard } from '@/components/ui/MetricCard'
import { SectionLabel } from '@/components/common/SectionLabel'
import { useTr, type Localized } from '@/lib/i18n'

interface LocalizedMetric {
  value: Localized
  label: Localized
  sublabel: Localized
}

const METRICS: LocalizedMetric[] = [
  {
    value: { fr: '240+', en: '240+', ar: '+240' },
    label: { fr: 'Pays desservis', en: 'Countries Served', ar: 'دولة نخدمها' },
    sublabel: { fr: 'Clients dans le monde', en: 'Clients Worldwide', ar: 'عملاء حول العالم' },
  },
  {
    value: { fr: '100%', en: '100%', ar: '100%' },
    label: { fr: 'Propriété étrangère', en: 'Foreign Ownership', ar: 'ملكية أجنبية' },
    sublabel: { fr: 'Au Tchad', en: 'In Chad', ar: 'في تشاد' },
  },
  {
    value: { fr: '24/7', en: '24/7', ar: '24/7' },
    label: { fr: 'Assistance client', en: 'Client Support', ar: 'دعم العملاء' },
    sublabel: { fr: 'Toujours disponible', en: 'Always On', ar: 'متاح دائماً' },
  },
  {
    value: { fr: 'À distance', en: 'Remote', ar: 'عن بُعد' },
    label: { fr: 'Configuration depuis partout', en: 'Setup From Anywhere', ar: 'إعداد من أي مكان' },
    sublabel: { fr: 'Entièrement en ligne', en: 'Fully Online', ar: 'بالكامل عبر الإنترنت' },
  },
]

export function MetricsSection() {
  const tr = useTr()
  return (
    <section id="numbers" className="border-t border-frost/10 bg-navy">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="mb-12 flex flex-col gap-4">
          <SectionLabel index="01">
            {tr({ fr: 'Couverture mondiale', en: 'Global coverage', ar: 'تغطية عالمية' })}
          </SectionLabel>
          <h2 className="max-w-2xl text-display-md font-semibold text-frost">
            {tr({
              fr: 'Nous servons des clients dans le monde entier — tous immatriculés au Tchad.',
              en: 'We serve clients globally — all registered in Chad.',
              ar: 'نخدم عملاء في جميع أنحاء العالم — جميعهم مسجّلون في تشاد.',
            })}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-frost/10 bg-frost/10 lg:grid-cols-4">
          {METRICS.map((metric) => (
            <MetricCard
              key={metric.label.en}
              value={tr(metric.value)}
              label={tr(metric.label)}
              sublabel={tr(metric.sublabel)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
