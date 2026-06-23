import { useCallback, useEffect, useRef, useState } from 'react'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/ui/Icons'
import { TESTIMONIALS } from '@/data'
import { cn } from '@/lib/utils'

const COUNT = TESTIMONIALS.length
const AUTOPLAY_MS = 5000

function getPerView(): number {
  if (typeof window === 'undefined') return 3
  if (window.matchMedia('(min-width: 1024px)').matches) return 3
  if (window.matchMedia('(min-width: 640px)').matches) return 2
  return 1
}

export function Testimonials() {
  const [perView, setPerView] = useState(getPerView)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const pointerStart = useRef<number | null>(null)

  const maxIndex = Math.max(0, COUNT - perView)

  const goTo = useCallback(
    (next: number) => {
      // Wrap around at both ends for a continuous slide.
      const wrapped = next < 0 ? maxIndex : next > maxIndex ? 0 : next
      setIndex(wrapped)
    },
    [maxIndex],
  )

  const prev = useCallback(() => goTo(index - 1), [goTo, index])
  const next = useCallback(() => goTo(index + 1), [goTo, index])

  // Recompute cards-per-view on resize and keep the index in range.
  useEffect(() => {
    const onResize = () => setPerView(getPerView())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex))
  }, [maxIndex])

  // Autoplay — pauses on hover/focus and respects reduced-motion.
  useEffect(() => {
    if (paused || maxIndex === 0) return
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const id = window.setInterval(() => {
      setIndex((i) => (i >= maxIndex ? 0 : i + 1))
    }, AUTOPLAY_MS)
    return () => window.clearInterval(id)
  }, [paused, maxIndex])

  // Pointer / touch swipe.
  const onPointerDown = (e: React.PointerEvent) => {
    pointerStart.current = e.clientX
  }
  const onPointerUp = (e: React.PointerEvent) => {
    if (pointerStart.current === null) return
    const delta = e.clientX - pointerStart.current
    if (Math.abs(delta) > 45) {
      if (delta < 0) next()
      else prev()
    }
    pointerStart.current = null
  }

  return (
    <section id="testimonials" className="py-16 sm:py-24">
      <div className="container-x flex flex-col gap-12">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-5">
            <SectionLabel>Honest feedback</SectionLabel>
            <h2 className="max-w-xl text-balance font-display text-h-lg font-bold text-ink">
              Our customers are our best marketers
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Previous testimonial"
              onClick={prev}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-line text-ink transition-colors hover:bg-cloud active:scale-95"
            >
              <ArrowLeftIcon />
            </button>
            <button
              type="button"
              aria-label="Next testimonial"
              onClick={next}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white transition-colors hover:bg-ink-soft active:scale-95"
            >
              <ArrowRightIcon />
            </button>
          </div>
        </div>

        {/* Slider viewport */}
        <div
          className="overflow-hidden"
          role="region"
          aria-roledescription="carousel"
          aria-label="Customer testimonials"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          <div
            className="flex touch-pan-y transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translateX(-${index * (100 / perView)}%)` }}
          >
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.name}
                className="w-full shrink-0 grow-0 basis-full px-2.5 sm:basis-1/2 lg:basis-1/3"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${COUNT}`}
                aria-hidden={i < index || i >= index + perView}
              >
                <article
                  className={cn(
                    'flex h-full select-none flex-col justify-between gap-8 rounded-4xl p-7 sm:p-8',
                    t.tone === 'brand' ? 'bg-brand text-ink' : 'bg-ink text-white',
                  )}
                >
                  <p
                    className={cn(
                      'font-display text-lg font-semibold leading-snug',
                      t.tone === 'brand' ? 'text-ink' : 'text-white',
                    )}
                  >
                    “{t.quote}”
                  </p>

                  <div
                    className={cn(
                      'flex items-center gap-3 rounded-2xl p-2.5',
                      t.tone === 'brand' ? 'bg-white/85' : 'bg-white/10',
                    )}
                  >
                    <img
                      src={t.avatar}
                      alt={t.name}
                      loading="lazy"
                      draggable={false}
                      className="h-11 w-11 rounded-xl object-cover"
                    />
                    <div>
                      <p
                        className={cn(
                          'font-display text-sm font-semibold',
                          t.tone === 'brand' ? 'text-ink' : 'text-white',
                        )}
                      >
                        {t.name}
                      </p>
                      <p
                        className={cn(
                          'font-body text-xs',
                          t.tone === 'brand' ? 'text-slatey' : 'text-white/60',
                        )}
                      >
                        {t.role}
                      </p>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>

        {/* Dots — one per slide position */}
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={index === i}
              onClick={() => goTo(i)}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                index === i ? 'w-7 bg-brand' : 'w-2 bg-ink/15 hover:bg-ink/30',
              )}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
