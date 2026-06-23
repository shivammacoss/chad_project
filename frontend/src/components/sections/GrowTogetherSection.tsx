import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { SectionLabel } from '@/components/common/SectionLabel'

const GROW_IMAGE =
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1000&q=80'

const BENEFITS = [
  'Seamless company incorporation in Chad',
  'Prestigious Chad virtual office address with mail forwarding',
  'Complete virtual office & registered-agent services',
  'Business essentials under one roof',
  'Dedicated support & personalised guidance',
]

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className={className}>
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** "Grow with us together" — benefits checklist beside a portrait image. */
export function GrowTogetherSection() {
  const navigate = useNavigate()

  return (
    <section id="grow" className="py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
        {/* Left: copy + checklist */}
        <div className="flex flex-col gap-6">
          <SectionLabel>Grow with us</SectionLabel>
          <h2 className="max-w-md font-display text-display-lg font-bold text-frost">
            Grow with GRIDGLOBAL GATE together
          </h2>
          <p className="max-w-md font-body text-base leading-relaxed text-frost/60">
            We provide quick solutions to drive growth and success for your business in Chad.
          </p>

          <ul className="flex flex-col gap-3.5">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-electric/15 text-teal-electric">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                <span className="font-body text-base text-frost/75">{benefit}</span>
              </li>
            ))}
          </ul>

          <div className="mt-2">
            <Button variant="primary" size="lg" onClick={() => navigate('/contact')}>
              Talk to us now
            </Button>
          </div>
        </div>

        {/* Right: image */}
        <div className="relative overflow-hidden rounded-[2rem] shadow-2xl shadow-frost/10">
          <img
            src={GROW_IMAGE}
            alt="A business professional ready to help you grow"
            loading="lazy"
            className="h-[360px] w-full object-cover sm:h-[460px]"
          />
        </div>
      </div>
    </section>
  )
}
