import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface SectionLabelProps extends HTMLAttributes<HTMLSpanElement> {
  /** Render light text + dot for use on dark backgrounds. */
  inverted?: boolean
}

/** Small eyebrow label with a leading brand dot, e.g. "Packed with cool stuff". */
export function SectionLabel({ inverted, className, children, ...props }: SectionLabelProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-body text-sm font-medium',
        inverted ? 'text-white/70' : 'text-slatey',
        className,
      )}
      {...props}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-brand" />
      {children}
    </span>
  )
}
