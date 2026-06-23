import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { MENU } from '@/content/menu'

interface FooterColumn {
  title: string
  links: Array<{ label: string; to: string }>
}

const serviceCategory = (id: string) => MENU.find((c) => c.id === id)

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Services',
    links: MENU.filter((c) => c.overviewPath).map((c) => ({
      label: c.label,
      to: c.overviewPath as string,
    })),
  },
  {
    title: 'Incorporation',
    links: (serviceCategory('company-incorporation')?.pages ?? []).map((p) => ({
      label: p.menuLabel,
      to: p.path,
    })),
  },
  {
    title: 'Company',
    links: [
      { label: 'Latest Insights', to: '/insights' },
      { label: 'Affiliate Programme', to: '/affiliate' },
      { label: 'Chad Free Zone', to: '/chad-free-zone' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', to: '/contact' },
      { label: 'Terms', to: '/contact' },
      { label: 'Compliance', to: '/contact' },
      { label: 'Dashboard', to: '/dashboard' },
    ],
  },
]

const YEAR = 2026

export function Footer() {
  return (
    <footer className="bg-[#0B0E13] text-white">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          {/* Brand block */}
          <div className="col-span-2 flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2" aria-label="GRIDGLOBAL GATE home">
              <span className="font-display text-lg font-bold tracking-tight">
                <span className="text-teal-electric">GRID</span>
                <span className="text-white">GLOBAL</span>
              </span>
              <span className="rounded border border-teal-electric/40 px-1.5 py-0.5 font-mono text-[0.65rem] font-medium uppercase tracking-widest text-teal-electric/90">
                GATE
              </span>
            </Link>
            <p className="max-w-xs font-body text-sm leading-relaxed text-white/55">
              Your gateway to global business — virtual offices, company incorporation, compliance
              and back-office services for founders worldwide.
            </p>
            <Badge tone="live" className="w-fit">
              Registered Companies House agent
            </Badge>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className="flex flex-col gap-3">
              <h3 className="font-mono text-xs font-medium uppercase tracking-wider text-white/40">
                {column.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {column.links.map((link, i) => (
                  <li key={`${column.title}-${i}`}>
                    <Link
                      to={link.to}
                      className="font-body text-sm text-white/65 transition-colors hover:text-teal-electric"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
          <p className="font-mono text-xs text-white/40">
            © {YEAR} GRIDGLOBAL GATE — All rights reserved.
          </p>
          <p className="font-mono text-xs text-white/40">
            UK · USA · Canada · <span className="text-teal-electric/80">Chad Free Zone</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
