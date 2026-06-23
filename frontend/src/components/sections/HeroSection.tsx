import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1500&q=80'

const FEATURES = [
  {
    title: 'Non-Resident Friendly',
    text: 'The same process and pricing to register in Chad, wherever in the world you live.',
  },
  {
    title: 'Fast Chad Filing',
    text: 'Company formation filed directly with the Chad authorities, handled end to end.',
  },
  {
    title: 'Registered Agent Included',
    text: 'Registered office and agent services in Chad bundled with your package.',
  },
]

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className={className}>
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function HeroSection() {

  return (
    <section id="top" className="relative pt-16">
      <div className="mx-auto max-w-7xl px-5 pt-8 sm:px-8 sm:pt-10">
        {/* Hero image with overlaid headline */}
        <div className="relative overflow-hidden rounded-[2rem] shadow-2xl shadow-frost/10">
          <img
            src={HERO_IMAGE}
            alt="A team collaborating in a bright modern office"
            className="h-[420px] w-full object-cover sm:h-[520px] lg:h-[560px]"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E13]/85 via-[#0B0E13]/25 to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-end p-7 pb-16 sm:p-10 sm:pb-24 lg:p-14 lg:pb-28">
            <h1 className="max-w-2xl font-display text-display-xl font-bold text-white">
              The gateway to business in Chad.
            </h1>
          </div>
        </div>

        {/* Overlapping white card: 3 features + CTA strip */}
        <div className="relative z-10 mx-auto -mt-12 w-[94%] rounded-[2rem] bg-white p-6 shadow-2xl shadow-frost/10 sm:-mt-16 sm:w-[92%] sm:p-8 lg:w-[88%]">
          <div className="grid gap-6 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-frost/10">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex flex-col gap-2 sm:px-6 sm:first:pl-0 sm:last:pr-0">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-electric/15 text-indigo-pulse">
                    <CheckIcon className="h-4 w-4" />
                  </span>
                  <h3 className="font-display text-base font-semibold text-frost">{f.title}</h3>
                </div>
                <p className="font-body text-sm leading-relaxed text-frost/55">{f.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-col gap-4 rounded-2xl bg-steel p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex flex-col gap-1">
              <p className="font-display text-lg font-semibold text-frost">
                Start your journey by exploring our{' '}
                <span className="text-indigo-pulse">services</span>
              </p>
              <p className="font-body text-sm text-frost/55">
                Everything to launch and run your company, in one place.
              </p>
            </div>
            <Link to="/get-started" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full bg-chad-blue text-white shadow-none hover:bg-[#013a87] sm:w-auto"
              >
                Get started now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
