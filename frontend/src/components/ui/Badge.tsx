import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export type BadgeTone = 'live' | 'neutral' | 'warning'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  /** Render the leading pulsing status dot (default true). */
  withDot?: boolean
}

const toneClasses: Record<BadgeTone, string> = {
  live: 'border-teal-electric/30 bg-teal-electric/10 text-teal-electric',
  neutral: 'border-frost/15 bg-steel/60 text-frost/80',
  warning: 'border-indigo-pulse/40 bg-indigo-pulse/10 text-indigo-pulse',
}

const dotClasses: Record<BadgeTone, string> = {
  live: 'bg-teal-electric',
  neutral: 'bg-frost/60',
  warning: 'bg-indigo-pulse',
}

/**
 * Pill badge with an optional pulsing status dot — used for live indicators.
 */
export function Badge({ className, tone = 'live', withDot = true, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs font-medium uppercase tracking-wider',
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {withDot && (
        <span className="relative flex h-2 w-2 shrink-0">
          <span
            className={cn(
              'absolute inline-flex h-full w-full rounded-full opacity-75 motion-safe:animate-node-ping',
              dotClasses[tone],
            )}
          />
          <span className={cn('relative inline-flex h-2 w-2 rounded-full', dotClasses[tone])} />
        </span>
      )}
      {children}
    </span>
  )
}
