import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export interface Crumb {
  label: string
  to?: string
}

/** Compact breadcrumb trail for sub-pages. */
export function Breadcrumb({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn('font-mono text-xs text-frost/45', className)}>
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-2">
              {item.to && !isLast ? (
                <Link to={item.to} className="transition-colors hover:text-teal-electric">
                  {item.label}
                </Link>
              ) : (
                <span className={cn(isLast && 'text-frost/70')}>{item.label}</span>
              )}
              {!isLast && <span aria-hidden="true" className="text-frost/25">/</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
