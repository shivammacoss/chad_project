import { Button } from '@/components/ui/Button'
import { CheckIcon, PlayIcon } from '@/components/ui/Icons'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1500&q=80'

const FEATURES = [
  { title: 'Unique design', text: 'Conveniently synergize design language across every surface.' },
  { title: 'Smart features', text: 'Objectively coordinate logic that anticipates what users need.' },
  { title: 'Clear structure', text: 'Professionally orchestrate content into intuitive journeys.' },
]

export function Hero() {
  return (
    <section id="top" className="relative pt-[72px]">
      <div className="container-x pt-8 sm:pt-10">
        {/* Hero image with overlaid headline */}
        <div className="relative overflow-hidden rounded-4xl shadow-card">
          <img
            src={HERO_IMAGE}
            alt="A creative team collaborating in a bright studio"
            className="h-[420px] w-full object-cover sm:h-[520px] lg:h-[560px]"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/25 to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-between p-7 sm:p-10 lg:p-14">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 font-body text-xs font-medium text-white backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              High traffic
            </span>

            <div className="flex flex-col gap-7">
              <h1 className="max-w-2xl text-balance font-display text-h-xl font-bold text-white">
                We always aim for the stars.
              </h1>

              <button
                type="button"
                className="group inline-flex w-fit items-center gap-3 rounded-full bg-white/10 py-1.5 pl-1.5 pr-5 backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-brand text-ink">
                  <span className="absolute inset-0 rounded-full bg-brand/50 motion-safe:animate-pulse-ring" />
                  <PlayIcon className="relative ml-0.5 h-5 w-5" />
                </span>
                <span className="font-display text-sm font-semibold text-white">Watch video</span>
              </button>
            </div>
          </div>
        </div>

        {/* Overlapping white card: features + CTA strip */}
        <div className="relative z-10 mx-auto -mt-12 w-[94%] rounded-4xl bg-white p-6 shadow-card sm:-mt-16 sm:w-[92%] sm:p-8 lg:w-[88%]">
          <div className="grid gap-6 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-line">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex flex-col gap-2 sm:px-6 sm:first:pl-0 sm:last:pr-0">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/15 text-brand-700">
                    <CheckIcon className="h-4 w-4" />
                  </span>
                  <h3 className="font-display text-base font-semibold text-ink">{f.title}</h3>
                </div>
                <p className="font-body text-sm leading-relaxed text-slatey">{f.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-col gap-4 rounded-3xl bg-cloud p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex flex-col gap-1">
              <p className="font-display text-lg font-semibold text-ink">
                Start your journey with exploring our <span className="text-brand-600">mission</span>
              </p>
              <p className="font-body text-sm text-slatey">
                Key ideas and beliefs driving our success.
              </p>
            </div>
            <Button variant="dark" size="lg" className="w-full sm:w-auto">
              Get started now
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
