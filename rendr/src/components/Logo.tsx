import { cn } from '@/lib/utils'

/** Brand wordmark: "Stellr." with a brand-green dot. */
export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <a
      href="#top"
      aria-label="Stellr home"
      className={cn(
        'inline-flex items-end font-display text-2xl font-bold tracking-tight',
        light ? 'text-white' : 'text-ink',
        className,
      )}
    >
      stellr<span className="text-brand">.</span>
    </a>
  )
}
