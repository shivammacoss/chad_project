import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface SectionLabelProps extends HTMLAttributes<HTMLDivElement> {
  /** Render a leading index marker, e.g. "02". */
  index?: string
}

/**
 * Mono, uppercase eyebrow label used above section headings.
 * Pairs a short teal rule with optional index + label text.
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
      <span aria-hidden="true" className="h-px w-8 bg-teal-electric/50" />
      {index && <span className="text-teal-electric/60">{index}</span>}
      <span>{children}</span>
    </div>
  )
}
