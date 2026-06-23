import { MetricCard } from '@/components/ui/MetricCard'
import { SectionLabel } from '@/components/common/SectionLabel'
import type { Metric } from '@/types'

const METRICS: Metric[] = [
  { value: '12K+', label: 'Companies Formed', sublabel: 'And Counting' },
  { value: '38', label: 'Countries Served', sublabel: 'Worldwide' },
  { value: '24/7', label: 'Operator Support', sublabel: 'Always On' },
  { value: 'Same-Day', label: 'UK Filing', sublabel: 'Companies House' },
]

export function MetricsSection() {
  return (
    <section id="numbers" className="border-t border-frost/10 bg-navy">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="mb-12 flex flex-col gap-4">
          <SectionLabel index="01">By the numbers</SectionLabel>
          <h2 className="max-w-2xl text-display-md font-semibold text-frost">
            Trusted by founders building across borders.
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-frost/10 bg-frost/10 lg:grid-cols-4">
          {METRICS.map((metric) => (
            <MetricCard
              key={metric.label}
              value={metric.value}
              label={metric.label}
              sublabel={metric.sublabel}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
