import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { LANGUAGES, useLanguage, type LanguageCode } from '@/store/LanguageContext'

/** ISO country code used for each language's flag image. */
const FLAG_CC: Record<LanguageCode, string> = { fr: 'fr', en: 'gb', ar: 'sa' }

/** Renders a real flag image (emoji flags don't render on Windows). */
function FlagIcon({ code, className }: { code: LanguageCode; className?: string }) {
  return (
    <img
      src={`https://flagcdn.com/${FLAG_CC[code]}.svg`}
      alt=""
      aria-hidden="true"
      loading="lazy"
      className={cn('h-4 w-6 shrink-0 rounded-[3px] object-cover ring-1 ring-frost/10', className)}
    />
  )
}

/** Globe icon for the switcher trigger. */
function GlobeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18" />
    </svg>
  )
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={cn('h-3.5 w-3.5 transition-transform duration-200', open && 'rotate-180')}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

interface Props {
  /** `desktop` renders a compact dropdown; `mobile` renders an inline option list. */
  variant?: 'desktop' | 'mobile'
  /** Called after a language is picked (used to close the mobile menu). */
  onSelect?: () => void
}

export function LanguageSwitcher({ variant = 'desktop', onSelect }: Props) {
  const { lang, language, setLang } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close the desktop dropdown on outside click or Escape.
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const select = (code: LanguageCode) => {
    setLang(code)
    setOpen(false)
    onSelect?.()
  }

  if (variant === 'mobile') {
    return (
      <div className="border-b border-frost/10 pb-3">
        <p className="px-2 py-3.5 font-body text-sm font-medium text-frost">Language</p>
        <div className="grid grid-cols-3 gap-2 px-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => select(l.code)}
              aria-pressed={l.code === lang}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 font-body text-xs transition-colors',
                l.code === lang
                  ? 'border-teal-electric/50 bg-teal-electric/10 text-teal-electric'
                  : 'border-frost/10 text-frost/70 hover:bg-steel hover:text-frost',
              )}
            >
              <FlagIcon code={l.code} className="h-5 w-7" />
              {l.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Select language"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 whitespace-nowrap rounded-md px-1.5 py-2 font-body text-[0.78rem] font-semibold text-frost/90 transition-colors hover:text-frost focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-electric/70"
      >
        <GlobeIcon />
        <FlagIcon code={language.code} />
        <span className="uppercase">{language.code}</span>
        <Chevron open={open} />
      </button>

      <div
        className={cn(
          'absolute right-0 top-full pt-3 transition-all duration-200',
          open
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-1 opacity-0',
        )}
      >
        <div className="w-44 rounded-2xl border border-frost/10 bg-steel/95 p-2 shadow-2xl shadow-black/40 backdrop-blur-md">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => select(l.code)}
              aria-pressed={l.code === lang}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left font-body text-sm transition-colors',
                l.code === lang
                  ? 'bg-navy/60 text-teal-electric'
                  : 'text-frost/80 hover:bg-navy/60 hover:text-frost',
              )}
            >
              <FlagIcon code={l.code} />
              <span className="font-medium">{l.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
