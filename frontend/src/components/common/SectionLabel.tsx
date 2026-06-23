import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface SectionLabelProps extends HTMLAttributes<HTMLDivElement> {
  /** Render a leading index marker, e.g. "02". */
  index?: string
}

/**
 * Mono, uppercase eyebrow label used above section headings.
 * Pairs a short Chad-flag tricolor rule with optional index + label text.
 */
export function SectionLabel({ index, className, children, ...props }: SectionLabelProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 font-mono text-xs font-medium uppercase tracking-[0.22em] text-teal-electric',
        className,
      )}
      {...props}
    >
      <span aria-hidden="true" className="flex h-1 w-10 overflow-hidden rounded-full">
        <span className="flex-1 bg-chad-blue" />
        <span className="flex-1 bg-chad-yellow" />
        <span className="flex-1 bg-chad-red" />
      </span>
      {index && <span className="text-teal-electric/60">{index}</span>}
      <span>{children}</span>
    </div>
  )
}
