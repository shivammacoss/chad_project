import { SectionLabel } from '@/components/common/SectionLabel'

interface Step {
  n: string
  title: string
  description: string
}

const STEPS: Step[] = [
  {
    n: '01',
    title: 'Choose Your Service',
    description: 'Pick a jurisdiction and the services you need — address, incorporation or compliance.',
  },
  {
    n: '02',
    title: 'Share Your Details',
    description: 'Send us your information once. We tell you exactly what is required and guide you.',
  },
  {
    n: '03',
    title: 'We Handle the Filing',
    description: 'We prepare and submit everything, set up your address and registered agent.',
  },
  {
    n: '04',
    title: 'Start Trading',
    description: 'Receive your documents and start operating your company — usually within days.',
  },
]

export function ProcessSection() {
  return (
    <section id="process" className="border-t border-frost/10 bg-navy">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="mb-12 flex flex-col gap-4">
          <SectionLabel index="05">How it works</SectionLabel>
          <h2 className="max-w-2xl text-display-lg font-semibold text-frost">
            From idea to incorporated in four steps.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-frost/10 bg-frost/10 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <div key={step.n} className="flex flex-col gap-4 bg-navy p-7 sm:p-8">
              <span className="font-mono text-3xl font-medium text-teal-electric/80">{step.n}</span>
              <h3 className="font-display text-lg font-semibold text-frost">{step.title}</h3>
              <p className="font-body text-sm leading-relaxed text-frost/60">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
