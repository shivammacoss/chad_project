const LOGOS = ['Barclays', 'Tide', 'Wise', 'ANNA', 'Monzo', 'World First']

export function TrustedBySection() {
  return (
    <section className="py-14 sm:py-16">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-5 sm:px-8">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.25em] text-frost/45">
          We only partner with the best
        </p>
        <div className="flex w-full flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {LOGOS.map((logo, i) => (
            <span
              key={`${logo}-${i}`}
              className="font-display text-xl font-bold tracking-tight text-frost/30 transition-colors hover:text-frost/60"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
