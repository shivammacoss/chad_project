import { Button } from '@/components/ui/Button'
import { ArrowRightIcon, PlayIcon } from '@/components/ui/Icons'

const JOIN_IMAGE =
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80'

export function JoinTeam() {
  return (
    <section id="careers" className="relative overflow-hidden">
      <img
        src={JOIN_IMAGE}
        alt="A modern open-plan office space"
        loading="lazy"
        className="h-[460px] w-full object-cover sm:h-[520px]"
      />
      <div className="absolute inset-0 bg-ink/55" />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-5 text-center">
        <button
          type="button"
          aria-label="Play video"
          className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-white text-ink"
        >
          <span className="absolute inset-0 rounded-full bg-white/40 motion-safe:animate-pulse-ring" />
          <PlayIcon className="relative ml-1 h-6 w-6" />
        </button>

        <span className="inline-flex items-center gap-2 font-body text-sm font-medium text-white/80">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          Start exploring
        </span>

        <h2 className="text-balance font-display text-h-lg font-bold text-white">Join our team!</h2>

        <Button variant="brand" size="lg" className="group">
          Go to careers website
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-brand transition-transform group-hover:translate-x-0.5">
            <ArrowRightIcon className="h-4 w-4" />
          </span>
        </Button>
      </div>
    </section>
  )
}
