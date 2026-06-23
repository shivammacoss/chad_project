import { useNavigate } from 'react-router-dom'

const BAND_IMAGE =
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80'

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M8 5.5v13l11-6.5-11-6.5z" />
    </svg>
  )
}

export function JoinBandSection() {
  const navigate = useNavigate()

  return (
    <section className="relative overflow-hidden">
      <img
        src={BAND_IMAGE}
        alt="A modern open-plan office space"
        loading="lazy"
        className="h-[460px] w-full object-cover sm:h-[520px]"
      />
      <div className="absolute inset-0 bg-[#0B0E13]/65" />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-5 text-center">
        <button
          type="button"
          aria-label="Watch overview"
          onClick={() => navigate('/contact')}
          className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-white text-frost"
        >
          <span className="absolute inset-0 rounded-full bg-white/40 motion-safe:animate-node-ping" />
          <PlayIcon className="relative ml-1 h-6 w-6" />
        </button>

        <span className="inline-flex items-center gap-2 font-body text-sm font-medium text-white/80">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-electric" />
          Start exploring
        </span>

        <h2 className="font-display text-display-lg font-bold text-white">
          Bring your business through the gate.
        </h2>

        <button
          type="button"
          onClick={() => navigate('/contact')}
          className="group inline-flex h-12 items-center gap-2 rounded-full bg-teal-electric px-7 font-display text-base font-semibold text-frost shadow-lg shadow-teal-electric/25 transition-colors hover:bg-teal-electric/90"
        >
          Get started now
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0E1116] text-teal-electric transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </button>
      </div>
    </section>
  )
}
