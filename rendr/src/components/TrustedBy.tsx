import { TRUSTED_LOGOS } from '@/data'

export function TrustedBy() {
  return (
    <section className="py-14 sm:py-16">
      <div className="container-x flex flex-col items-center gap-8">
        <p className="font-body text-xs font-semibold uppercase tracking-[0.25em] text-slatey/70">
          Trusted by
        </p>
        <div className="flex w-full flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-60">
          {TRUSTED_LOGOS.map((logo, i) => (
            <span
              key={`${logo}-${i}`}
              className="font-display text-xl font-bold tracking-tight text-ink/40 grayscale transition hover:text-ink/70"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
