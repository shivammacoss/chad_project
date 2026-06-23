import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { SectionLabel } from '@/components/common/SectionLabel'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { MetricCard } from '@/components/ui/MetricCard'

const STEPS = [
  {
    id: 'A-01',
    title: 'Sign Up',
    description: 'Create your free affiliate account in minutes and get your unique referral link.',
  },
  {
    id: 'A-02',
    title: 'Refer Businesses',
    description: 'Share your link with founders and companies who need addresses, formation or compliance.',
  },
  {
    id: 'A-03',
    title: 'Earn Commission',
    description: 'Get paid for every customer who signs up through your link — transparently tracked.',
  },
]

export default function AffiliatePage() {
  const navigate = useNavigate()

  return (
    <div className="bg-navy">
      <section className="relative overflow-hidden pt-16">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-grid-pattern bg-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-hero-gradient opacity-70" />
        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="flex max-w-3xl flex-col gap-6 motion-safe:animate-fade-up">
            <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Affiliate Programme' }]} />
            <SectionLabel>Partnerships</SectionLabel>
            <h1 className="text-display-lg font-bold text-frost">
              Partner With <span className="text-gradient">GRIDGLOBAL GATE</span>
            </h1>
            <p className="max-w-2xl font-body text-lg leading-relaxed text-frost/65">
              Earn by referring businesses to our services. Simple sign-up, transparent commissions.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="primary" size="lg" onClick={() => navigate('/contact')}>
                Join the Programme
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-frost/10">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-frost/10 bg-frost/10 lg:grid-cols-4">
            <MetricCard value="20%" label="Commission" sublabel="Per Referral" />
            <MetricCard value="90d" label="Cookie Window" sublabel="Generous Tracking" />
            <MetricCard value="Monthly" label="Payouts" sublabel="Reliable" />
            <MetricCard value="Free" label="To Join" sublabel="No Cost" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-frost/10">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="mb-10 flex flex-col gap-3">
            <SectionLabel index="01">How it works</SectionLabel>
            <h2 className="max-w-2xl text-display-md font-semibold text-frost">
              Three steps to start earning.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-frost/10 bg-frost/10 sm:grid-cols-3">
            {STEPS.map((step) => (
              <article key={step.id} className="flex flex-col gap-3 bg-navy p-7">
                <span className="font-mono text-xs font-medium tracking-wider text-teal-electric/80">
                  {step.id}
                </span>
                <h3 className="font-display text-lg font-semibold text-frost">{step.title}</h3>
                <p className="font-body text-sm leading-relaxed text-frost/60">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-frost/10">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="relative overflow-hidden rounded-3xl border border-teal-electric/15 bg-steel/30 px-6 py-14 text-center sm:px-12">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-grid-pattern bg-grid [mask-image:radial-gradient(ellipse_60%_80%_at_50%_50%,black,transparent)]"
            />
            <div className="relative mx-auto flex max-w-xl flex-col items-center gap-5">
              <h2 className="text-display-md font-bold text-frost">Ready to partner with us?</h2>
              <p className="font-body text-base text-frost/60">
                Join the programme today and start earning transparent commissions.
              </p>
              <Button variant="primary" size="lg" onClick={() => navigate('/contact')}>
                Join the Programme
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
