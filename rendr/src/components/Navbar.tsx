import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/Logo'
import { CloseIcon, MenuIcon } from '@/components/ui/Icons'
import { NAV_ITEMS } from '@/data'
import { cn } from '@/lib/utils'

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled ? 'border-b border-line bg-white/85 backdrop-blur-md' : 'bg-transparent',
      )}
    >
      <nav className="container-x flex h-[72px] items-center justify-between">
        <div className="flex items-center gap-9">
          <Logo />
          <ul className="hidden items-center gap-6 lg:flex">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <a
                  href="#top"
                  className={cn(
                    'group relative flex items-start gap-0.5 font-body text-[15px] font-medium transition-colors',
                    item.label === 'Demos' ? 'text-brand-600' : 'text-ink/80 hover:text-ink',
                  )}
                >
                  {item.label}
                  {item.badge && (
                    <sup className="font-display text-[9px] font-semibold text-slatey/70">
                      {item.badge}
                    </sup>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Button variant="brand" size="md">
            Get started
          </Button>
          <Button variant="outline" size="md">
            Log in
          </Button>
        </div>

        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink transition-colors hover:bg-cloud lg:hidden"
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          'overflow-hidden border-line bg-white transition-[max-height,opacity] duration-300 lg:hidden',
          open ? 'max-h-[28rem] border-b opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="container-x flex flex-col gap-1 py-4">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href="#top"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-xl px-3 py-3 font-body text-[15px] font-medium text-ink/80 transition-colors hover:bg-cloud"
            >
              {item.label}
              {item.badge && <span className="text-xs text-slatey">{item.badge}</span>}
            </a>
          ))}
          <div className="mt-3 grid grid-cols-2 gap-3 border-t border-line pt-4">
            <Button variant="brand" fullWidth onClick={() => setOpen(false)}>
              Get started
            </Button>
            <Button variant="outline" fullWidth onClick={() => setOpen(false)}>
              Log in
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
