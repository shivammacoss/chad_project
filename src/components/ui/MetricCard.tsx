import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface MetricCardProps extends HTMLAttributes<HTMLDivElement> {
  /** The large headline figure, e.g. "2.4B" or "99.98%". */
  value: string
  /** Primary descriptor, e.g. "Data Points". */
  label: string
  /** Secondary descriptor, e.g. "Per Day". */
  sublabel?: string
}

/**
 * Stat card: a big mono value over a label + sublabel, with a hairline
 * accent that lights up teal on hover.
 */
export function MetricCard({ value, label, sublabel, className, ...props }: MetricCardProps) {
  return (
    <div
      className={cn(
        'group relative flex flex-col gap-3 overflow-hidden bg-steel/30 p-6 transition-colors duration-300 hover:bg-steel/60 sm:p-8',
        className,
      )}
      {...props}
    >
      {/* Top accent line */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-frost/10 transition-colors duration-300 group-hover:bg-teal-electric/60"
      />

      <span className="font-mono text-4xl font-medium tracking-tight text-frost sm:text-5xl">
        {value}
      </span>

      <div className="flex flex-col gap-0.5">
        <span className="font-display text-sm font-medium text-frost/90">{label}</span>
        {sublabel && (
          <span className="font-mono text-xs uppercase tracking-wider text-frost/45">{sublabel}</span>
        )}
      </div>
    </div>
  )
}
