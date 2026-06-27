import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SectionLabel } from '@/components/common/SectionLabel'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { MetricCard } from '@/components/ui/MetricCard'

const BENEFITS = [
  {
    id: 'B-01',
    title: 'Tax-Efficient Structure',
    description: 'Operate through a jurisdiction designed to be competitive for international business.',
  },
  {
    id: 'B-02',
    title: '100% Foreign Ownership',
    description: 'Retain full ownership of your company — no local partner required.',
  },
  {
    id: 'B-03',
    title: 'Fully Remote Setup',
    description: 'Incorporate from anywhere in the world without travelling to register.',
  },
  {
    id: 'B-04',
    title: 'Fast Incorporation',
    description: 'Streamlined filing and documentation so you can launch quickly.',
  },
  {
    id: 'B-05',
    title: 'Address & Agent Included',
    description: 'Registered address and agent support bundled with your incorporation.',
  },
  {
    id: 'B-06',
    title: 'Banking Introductions',
    description: 'Connections to trusted banking partners to help you get operational.',
  },
]

const STEPS = [
  { n: '01', title: 'Choose Your Package', text: 'Select the free-zone package that matches your goals.' },
  { n: '02', title: 'Submit Documents', text: 'Provide your details and ID — we guide you through every requirement.' },
  { n: '03', title: 'We File Everything', text: 'We handle registration, address and agent setup on your behalf.' },
  { n: '04', title: 'Start Trading', text: 'Receive your documents and begin operating your new company.' },
]

const AUDIENCE = [
  'International founders and entrepreneurs',
  'E-commerce and digital businesses',
  'Consultants and service providers',
  'Holding and investment vehicles',
]

export default function ChadFreeZonePage() {
  const navigate = useNavigate()

  return (
    <div className="bg-navy">
      {/* Hero */}
      <section className="relative overflow-hidden pt-16">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-grid-pattern bg-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-hero-gradient opacity-80" />
        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="flex max-w-3xl flex-col gap-6 motion-safe:animate-fade-up">
            <Breadcrumb
              items={[
                { label: 'Home', to: '/' },
                { label: 'Jurisdictions' },
                { label: 'Chad International Free Zone' },
              ]}
            />
            <Badge tone="live">Flagship Jurisdiction</Badge>
            <h1 className="text-display-xl font-bold text-frost">
              Chad International <span className="text-gradient">Free Zone</span>
            </h1>
            <p className="max-w-2xl font-body text-lg leading-relaxed text-frost/65">
              Incorporate in a fast-growing African free zone with a competitive tax structure,
              100% foreign ownership, and a fully remote setup — managed end to end by GATE.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="primary" size="lg" onClick={() => navigate('/contact')}>
                Explore the Free Zone
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/contact')}>
                Talk to an Advisor
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-frost/10">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-frost/10 bg-frost/10 lg:grid-cols-4">
            <MetricCard value="100%" label="Foreign Ownership" sublabel="No Local Partner" />
            <MetricCard value="Remote" label="Incorporation" sublabel="From Anywhere" />
            <MetricCard value="Fast" label="Turnaround" sublabel="Streamlined Filing" />
            <MetricCard value="All-In" label="Address & Agent" sublabel="Included" />
          </div>
        </div>
      </section>

      {/* About */}
      <section className="border-t border-frost/10">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col gap-4">
              <SectionLabel index="01">About the free zone</SectionLabel>
              <h2 className="text-display-md font-semibold text-frost">
                A modern gateway to African and global markets.
              </h2>
            </div>
            <div className="flex flex-col gap-4 font-body text-base leading-relaxed text-frost/65">
              <p>
                The Chad International Free Zone offers international entrepreneurs a streamlined,
                cost-effective way to establish a company with a competitive regulatory and tax
                environment.
              </p>
              <p>
                As your registered agent, GATE manages the entire process — from
                documentation and filing to your registered address and ongoing compliance — so you
                can set up remotely and focus on growing your business.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-t border-frost/10">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="mb-10 flex flex-col gap-3">
            <SectionLabel index="02">Why incorporate here</SectionLabel>
            <h2 className="max-w-2xl text-display-md font-semibold text-frost">
              Built for international business.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-frost/10 bg-frost/10 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b) => (
              <article key={b.id} className="flex flex-col gap-3 bg-navy p-7">
                <span className="font-mono text-xs font-medium tracking-wider text-teal-electric/80">
                  {b.id}
                </span>
                <h3 className="font-display text-lg font-semibold text-frost">{b.title}</h3>
                <p className="font-body text-sm leading-relaxed text-frost/60">{b.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Process + Audience */}
      <section className="border-t border-frost/10">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col gap-6">
              <SectionLabel index="03">How it works</SectionLabel>
              <div className="flex flex-col">
                {STEPS.map((step, i) => (
                  <div
                    key={step.n}
                    className={`flex gap-5 py-5 ${i !== 0 ? 'border-t border-frost/10' : ''}`}
                  >
                    <span className="font-mono text-sm text-teal-electric/80">{step.n}</span>
                    <div className="flex flex-col gap-1">
                      <h3 className="font-display text-base font-semibold text-frost">
                        {step.title}
                      </h3>
                      <p className="font-body text-sm leading-relaxed text-frost/60">{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <SectionLabel index="04">Who it&apos;s for</SectionLabel>
              <ul className="flex flex-col gap-3">
                {AUDIENCE.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 rounded-xl border border-frost/10 bg-steel/20 px-5 py-4"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-electric" />
                    <span className="font-body text-sm text-frost/75">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
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
              <h2 className="text-display-md font-bold text-frost">
                Launch in the Chad International Free Zone.
              </h2>
              <p className="font-body text-base text-frost/60">
                Tell us about your business and we&apos;ll map out the fastest route to incorporation.
              </p>
              <Button variant="primary" size="lg" onClick={() => navigate('/contact')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
