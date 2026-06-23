import { useCallback, useEffect, useRef, useState } from 'react'
import { SectionLabel } from '@/components/common/SectionLabel'
import { cn } from '@/lib/utils'

interface Insight {
  title: string
  category: string
  meta: string
  tone: 'brand' | 'dark'
}

/**
 * Latest insights — expert guides on doing business in Chad.
 * (Carousel component reused from the original testimonials slider.)
 */
const INSIGHTS: Insight[] = [
  {
    title: 'How to register a company in Chad as a non-resident',
    category: 'Company Formation',
    meta: 'Jun 2026 · 5 min read',
    tone: 'brand',
  },
  {
    title: 'Why a Chad virtual office builds instant credibility',
    category: 'Virtual Offices',
    meta: 'Jun 2026 · 4 min read',
    tone: 'dark',
  },
  {
    title: 'Chad International Free Zone: tax advantages explained',
    category: 'Free Zone',
    meta: 'May 2026 · 6 min read',
    tone: 'brand',
  },
  {
    title: 'Staying compliant: statutory filings for Chad companies',
    category: 'Compliance',
    meta: 'May 2026 · 4 min read',
    tone: 'dark',
  },
  {
    title: 'Opening a business bank account from abroad',
    category: 'Banking',
    meta: 'Apr 2026 · 5 min read',
    tone: 'brand',
  },
  {
    title: '5 steps to launch your business in Chad remotely',
    category: 'Guides',
    meta: 'Apr 2026 · 3 min read',
    tone: 'dark',
  },
]

const COUNT = INSIGHTS.length
const AUTOPLAY_MS = 5000

function getPerView(): number {
  if (typeof window === 'undefined') return 3
  if (window.matchMedia('(min-width: 1024px)').matches) return 3
  if (window.matchMedia('(min-width: 640px)').matches) return 2
  return 1
}

function ArrowIcon({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
      {dir === 'left' ? (
        <path d="M19 12H5M11 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  )
}

export function TestimonialsSection() {
  const [perView, setPerView] = useState(getPerView)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const pointerStart = useRef<number | null>(null)

  const maxIndex = Math.max(0, COUNT - perView)

  const goTo = useCallback(
    (next: number) => setIndex(next < 0 ? maxIndex : next > maxIndex ? 0 : next),
    [maxIndex],
  )
  const prev = useCallback(() => goTo(index - 1), [goTo, index])
  const next = useCallback(() => goTo(index + 1), [goTo, index])

  useEffect(() => {
    const onResize = () => setPerView(getPerView())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex))
  }, [maxIndex])

  useEffect(() => {
    if (paused || maxIndex === 0) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => setIndex((i) => (i >= maxIndex ? 0 : i + 1)), AUTOPLAY_MS)
    return () => window.clearInterval(id)
  }, [paused, maxIndex])

  const onPointerDown = (e: React.PointerEvent) => {
    pointerStart.current = e.clientX
  }
  const onPointerUp = (e: React.PointerEvent) => {
    if (pointerStart.current === null) return
    const delta = e.clientX - pointerStart.current
    if (Math.abs(delta) > 45) (delta < 0 ? next : prev)()
    pointerStart.current = null
  }

  return (
    <section id="testimonials" className="py-16 sm:py-24">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-5 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-5">
            <SectionLabel>Latest insights</SectionLabel>
            <h2 className="max-w-xl font-display text-display-lg font-bold text-frost">
              Insights & guides to help you launch in Chad
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Previous insight"
              onClick={prev}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-frost/15 text-frost transition-colors hover:bg-steel active:scale-95"
            >
              <ArrowIcon dir="left" />
            </button>
            <button
              type="button"
              aria-label="Next insight"
              onClick={next}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-chad-blue text-white transition-colors hover:bg-[#013a87] active:scale-95"
            >
              <ArrowIcon dir="right" />
            </button>
          </div>
        </div>

        {/* Slider viewport */}
        <div
          className="overflow-hidden"
          role="region"
          aria-roledescription="carousel"
          aria-label="Latest insights"
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
            {INSIGHTS.map((item, i) => (
              <div
                key={item.title}
                className="w-full shrink-0 grow-0 basis-full px-2.5 sm:basis-1/2 lg:basis-1/3"
                aria-hidden={i < index || i >= index + perView}
              >
                <article
                  className={cn(
                    'flex h-full select-none flex-col justify-between gap-8 rounded-[1.75rem] p-7 sm:p-8',
                    item.tone === 'brand' ? 'bg-chad-red text-white' : 'bg-chad-blue text-white',
                  )}
                >
                  <h3 className="font-display text-lg font-semibold leading-snug text-white">
                    {item.title}
                  </h3>

                  <div
                    className={cn(
                      'flex items-center gap-3 rounded-2xl p-2.5',
                      item.tone === 'brand' ? 'bg-white/80' : 'bg-white/10',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-11 w-11 items-center justify-center rounded-xl font-display text-sm font-bold',
                        item.tone === 'brand' ? 'bg-frost text-white' : 'bg-chad-yellow text-chad-blue',
                      )}
                    >
                      {item.category
                        .split(' ')
                        .map((p) => p[0])
                        .join('')
                        .slice(0, 2)}
                    </span>
                    <div>
                      <p
                        className={cn(
                          'font-display text-sm font-semibold',
                          item.tone === 'brand' ? 'text-frost' : 'text-white',
                        )}
                      >
                        {item.category}
                      </p>
                      <p
                        className={cn(
                          'font-body text-xs',
                          item.tone === 'brand' ? 'text-frost/60' : 'text-white/60',
                        )}
                      >
                        {item.meta}
                      </p>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
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
                index === i ? 'w-7 bg-teal-electric' : 'w-2 bg-frost/15 hover:bg-frost/30',
              )}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
