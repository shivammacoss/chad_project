import { useState } from 'react'
import { SectionLabel } from '@/components/common/SectionLabel'

interface ShowcasePanel {
  id: string
  /** Caption shown on the expanded panel. */
  label: string
  /** Background image path. Leave '' to show the dark placeholder. */
  image: string
}

/**
 * Expanding image panels. One panel is open by default (the centre one); on
 * hover/focus the hovered panel expands and the others collapse to thin strips.
 * Image slots are intentionally left empty — drop paths into `image` later.
 */
const PANELS: ShowcasePanel[] = [
  { id: 'panel-1', label: 'Panel one', image: '/Panel1.png' },
  { id: 'panel-2', label: 'Panel two', image: '/Panel2.png' },
  { id: 'panel-3', label: 'Panel three', image: '/Panel3.png' },
  { id: 'panel-4', label: 'Panel four', image: '/Panel4.png' },
  { id: 'panel-5', label: 'Panel five', image: '/Panel5.png' },
]

/** Index that starts expanded (centre panel). */
const DEFAULT_OPEN = 2

export function ShowcaseSection() {
  const [active, setActive] = useState(DEFAULT_OPEN)

  return (
    <section id="showcase" className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Heading */}
        <div className="flex flex-col items-center gap-4 text-center">
          <SectionLabel>Gallery</SectionLabel>
          <h2 className="max-w-xl font-display text-display-lg font-bold text-frost">
            A closer look at business in Chad
          </h2>
          <p className="max-w-md font-body text-base leading-relaxed text-frost/60">
            Explore the offices, spaces and opportunities that make Chad your gateway to business.
          </p>
        </div>

        {/* Expanding panels */}
        <div className="mt-12 flex gap-3 sm:gap-4">
          {PANELS.map((panel, i) => {
            const isActive = active === i
            return (
              <div
                key={panel.id}
                role="button"
                tabIndex={0}
                aria-label={panel.label}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                style={{
                  flexGrow: isActive ? 6 : 1,
                  ...(panel.image ? { backgroundImage: `url(${panel.image})` } : {}),
                }}
                className="group relative h-[320px] basis-0 cursor-pointer overflow-hidden rounded-[1.75rem] bg-frost bg-cover bg-center outline-none transition-[flex-grow] duration-500 ease-out focus-visible:ring-2 focus-visible:ring-chad-blue/60 sm:h-[460px]"
              >
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
