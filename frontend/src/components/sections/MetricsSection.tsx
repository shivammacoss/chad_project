import { MetricCard } from '@/components/ui/MetricCard'
import { SectionLabel } from '@/components/common/SectionLabel'
import type { Metric } from '@/types'

const METRICS: Metric[] = [
  { value: '240+', label: 'Countries Served', sublabel: 'Clients Worldwide' },
  { value: '100%', label: 'Foreign Ownership', sublabel: 'In Chad' },
  { value: '24/7', label: 'Client Support', sublabel: 'Always On' },
  { value: 'Remote', label: 'Setup From Anywhere', sublabel: 'Fully Online' },
]

export function MetricsSection() {
  return (
    <section id="numbers" className="border-t border-frost/10 bg-navy">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="mb-12 flex flex-col gap-4">
          <SectionLabel index="01">Global coverage</SectionLabel>
          <h2 className="max-w-2xl text-display-md font-semibold text-frost">
            We serve clients globally — all registered in Chad.
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
