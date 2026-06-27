import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { MENU } from '@/content/menu'
import { cn } from '@/lib/utils'
import { useAuth } from '@/store/AuthContext'
import NotificationBell from '@/components/layout/NotificationBell'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { useTr } from '@/lib/i18n'

/** Brand logo. */
function Logo({ onClick }: { onClick?: () => void }) {
  const tr = useTr()
  return (
    <Link
      to="/"
      onClick={onClick}
      className="group flex shrink-0 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-electric/70 focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
      aria-label={tr({ fr: 'Accueil GATE', en: 'GATE home', ar: 'الصفحة الرئيسية GATE' })}
    >
      <img src="/logo.png" alt="GATE" className="h-12 w-auto shrink-0 sm:h-14" />
    </Link>
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

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)
  const [mobileCat, setMobileCat] = useState<string | null>(null)
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  // Staff/admin (any non-customer role) belong in the console (/staff), not the customer dashboard.
  const isStaff = !!user && !['customer', 'user'].includes(user.role)
  const homePath = isStaff ? '/staff' : '/dashboard'
  const tr = useTr()

  useEffect(() => {
    if (isDesktop && mobileOpen) setMobileOpen(false)
  }, [isDesktop, mobileOpen])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  // Close any open desktop dropdown on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const closeAll = () => {
    setOpenId(null)
    setMobileOpen(false)
    setMobileCat(null)
  }

  return (
    <header className="fixed inset-x-0 top-12 z-40 border-b border-frost/10 bg-navy/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Logo onClick={closeAll} />

        {/* Desktop navigation */}
        <ul className="hidden items-center gap-0.5 lg:flex">
          <li>
            <Link
              to="/"
              onClick={() => setOpenId(null)}
              className="flex items-center whitespace-nowrap rounded-md px-1.5 py-2 font-body text-[0.78rem] font-semibold text-frost/90 transition-colors hover:text-frost"
            >
              {tr({ fr: 'Accueil', en: 'Home', ar: 'الرئيسية' })}
            </Link>
          </li>
          {MENU.map((cat) => {
            const isOpen = openId === cat.id
            return (
              <li
                key={cat.id}
                className="relative"
                onMouseEnter={() => setOpenId(cat.id)}
                onMouseLeave={() => setOpenId((id) => (id === cat.id ? null : id))}
              >
                {cat.overviewPath ? (
                  <Link
                    to={cat.overviewPath}
                    onClick={() => setOpenId(null)}
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    className="flex items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-2 font-body text-[0.78rem] font-semibold text-frost/90 transition-colors hover:text-frost"
                  >
                    {tr(cat.label)}
                    <Chevron open={isOpen} />
                  </Link>
                ) : (
                  <button
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    onClick={() => setOpenId((id) => (id === cat.id ? null : cat.id))}
                    className="flex items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-2 font-body text-[0.78rem] font-semibold text-frost/90 transition-colors hover:text-frost"
                  >
                    {tr(cat.label)}
                    <Chevron open={isOpen} />
                  </button>
                )}

                {/* Dropdown panel */}
                <div
                  className={cn(
                    'absolute left-0 top-full pt-3 transition-all duration-200',
                    isOpen
                      ? 'pointer-events-auto translate-y-0 opacity-100'
                      : 'pointer-events-none -translate-y-1 opacity-0',
                  )}
                >
                  <div
                    className={cn(
                      'rounded-2xl border border-frost/10 bg-steel/95 p-2 shadow-2xl shadow-black/40 backdrop-blur-md',
                      cat.columns === 2 ? 'w-[34rem]' : 'w-72',
                    )}
                  >
                    <div
                      className={cn('grid gap-0.5', cat.columns === 2 ? 'grid-cols-2' : 'grid-cols-1')}
                    >
                      {cat.pages.map((page) => (
                        <Link
                          key={page.id}
                          to={page.path}
                          onClick={() => setOpenId(null)}
                          className="group flex flex-col gap-0.5 rounded-xl px-3 py-2.5 transition-colors hover:bg-navy/60"
                        >
                          <span className="font-body text-sm font-medium text-frost group-hover:text-teal-electric">
                            {tr(page.menuLabel)}
                          </span>
                          <span className="line-clamp-1 font-body text-xs text-frost/45">
                            {tr(page.intro)}
                          </span>
                        </Link>
                      ))}
                    </div>

                    {cat.overviewPath && (
                      <Link
                        to={cat.overviewPath}
                        onClick={() => setOpenId(null)}
                        className="mt-1 flex items-center justify-between rounded-xl border-t border-frost/10 px-3 py-2.5 font-mono text-xs uppercase tracking-wider text-teal-electric transition-colors hover:bg-navy/60"
                      >
                        {tr({ fr: 'Voir tout', en: 'View all', ar: 'عرض الكل' })} {tr(cat.label)}
                        <span aria-hidden="true">→</span>
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitcher />
          {user ? (
            <>
              <NotificationBell />
              <Button variant="ghost" size="sm" onClick={() => navigate(homePath)}>
                {isStaff
                  ? tr({ fr: 'Console', en: 'Console', ar: 'لوحة الإدارة' })
                  : tr({ fr: 'Tableau de bord', en: 'Dashboard', ar: 'لوحة التحكم' })}
              </Button>
              <Button variant="primary" size="sm" onClick={() => logout()}>
                {tr({ fr: 'Déconnexion', en: 'Log out', ar: 'تسجيل الخروج' })}
              </Button>
            </>
          ) : (
            <Button variant="primary" size="sm" onClick={() => navigate('/get-started')}>
              {tr({ fr: 'Commencer', en: 'Get Started', ar: 'ابدأ' })}
            </Button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-md text-frost transition-colors hover:bg-steel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-electric/70 lg:hidden"
          aria-label={
            mobileOpen
              ? tr({ fr: 'Fermer le menu', en: 'Close menu', ar: 'إغلاق القائمة' })
              : tr({ fr: 'Ouvrir le menu', en: 'Open menu', ar: 'فتح القائمة' })
          }
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span aria-hidden="true" className="relative block h-4 w-5">
            <span
              className={cn(
                'absolute left-0 block h-0.5 w-5 rounded-full bg-current transition-all duration-300',
                mobileOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-0',
              )}
            />
            <span
              className={cn(
                'absolute left-0 top-1/2 block h-0.5 w-5 -translate-y-1/2 rounded-full bg-current transition-all duration-300',
                mobileOpen ? 'opacity-0' : 'opacity-100',
              )}
            />
            <span
              className={cn(
                'absolute left-0 block h-0.5 w-5 rounded-full bg-current transition-all duration-300',
                mobileOpen ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'bottom-0',
              )}
            />
          </span>
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          'overflow-y-auto border-frost/10 bg-navy/95 backdrop-blur-md transition-[max-height,opacity] duration-300 ease-out lg:hidden',
          mobileOpen ? 'max-h-[calc(100vh-4rem)] border-t opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="flex flex-col gap-1 px-5 py-4">
          <Link
            to="/"
            onClick={closeAll}
            className="border-b border-frost/10 px-2 py-3.5 font-body text-sm font-medium text-frost"
          >
            {tr({ fr: 'Accueil', en: 'Home', ar: 'الرئيسية' })}
          </Link>
          {MENU.map((cat) => {
            const expanded = mobileCat === cat.id
            return (
              <div key={cat.id} className="border-b border-frost/10 last:border-0">
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setMobileCat((id) => (id === cat.id ? null : cat.id))}
                  className="flex w-full items-center justify-between px-2 py-3.5 font-body text-sm font-medium text-frost"
                >
                  {tr(cat.label)}
                  <Chevron open={expanded} />
                </button>
                <div
                  className={cn(
                    'overflow-hidden transition-[max-height,opacity] duration-300',
                    expanded ? 'max-h-[40rem] opacity-100' : 'max-h-0 opacity-0',
                  )}
                >
                  <div className="flex flex-col gap-0.5 pb-3 pl-2">
                    {cat.overviewPath && (
                      <Link
                        to={cat.overviewPath}
                        onClick={closeAll}
                        className="rounded-lg px-3 py-2.5 font-body text-sm text-teal-electric transition-colors hover:bg-steel"
                      >
                        {tr({ fr: 'Aperçu', en: 'Overview', ar: 'نظرة عامة' })}
                      </Link>
                    )}
                    {cat.pages.map((page) => (
                      <Link
                        key={page.id}
                        to={page.path}
                        onClick={closeAll}
                        className="rounded-lg px-3 py-2.5 font-body text-sm text-frost/70 transition-colors hover:bg-steel hover:text-frost"
                      >
                        {tr(page.menuLabel)}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}

          <LanguageSwitcher variant="mobile" onSelect={closeAll} />

          <div className="mt-4 flex flex-col gap-2 pt-2">
            {user ? (
              <>
                <div className="flex items-center justify-center py-2">
                  <NotificationBell />
                </div>
                <Button
                  variant="outline"
                  size="md"
                  fullWidth
                  onClick={() => {
                    closeAll()
                    navigate(homePath)
                  }}
                >
                  {isStaff
                    ? tr({ fr: 'Console', en: 'Console', ar: 'لوحة الإدارة' })
                    : tr({ fr: 'Tableau de bord', en: 'Dashboard', ar: 'لوحة التحكم' })}
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => {
                    closeAll()
                    logout()
                  }}
                >
                  Log out
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={() => {
                  closeAll()
                  navigate('/get-started')
                }}
              >
                Get Started
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
