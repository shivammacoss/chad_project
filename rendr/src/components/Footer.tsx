import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/Logo'
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  MailIcon,
  PhoneIcon,
  TwitterIcon,
} from '@/components/ui/Icons'

const COMPANY = ['Home', 'About Us', 'Career', 'Contact Us']
const INFORMATION = ['My account', 'Login', 'Help', 'Into The Unknown', 'Transitions']
const BOTTOM_LINKS = ['Home', 'About Us', 'Career', 'Contact Us']

export function Footer() {
  const [email, setEmail] = useState('')

  return (
    <footer className="bg-ink text-white">
      <div className="container-x py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand */}
          <div className="flex flex-col gap-5 lg:col-span-4">
            <Logo light />
            <p className="max-w-xs font-body text-sm leading-relaxed text-white/55">
              Compellingly build value-added opportunities rather than worn-out performance. We
              design brands that aim higher.
            </p>
            <div className="flex items-center gap-3 pt-1">
              {[FacebookIcon, TwitterIcon, InstagramIcon, LinkedinIcon].map((Icon, i) => (
                <a
                  key={i}
                  href="#top"
                  aria-label="Social link"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/8 text-white/70 transition-colors hover:bg-brand hover:text-ink"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white/40">
              Company
            </h3>
            <ul className="flex flex-col gap-3">
              {COMPANY.map((l) => (
                <li key={l}>
                  <a href="#top" className="font-body text-sm text-white/65 transition-colors hover:text-brand">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white/40">
              Information
            </h3>
            <ul className="flex flex-col gap-3">
              {INFORMATION.map((l) => (
                <li key={l}>
                  <a href="#top" className="font-body text-sm text-white/65 transition-colors hover:text-brand">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Subscribe + contact */}
          <div className="flex flex-col gap-5 lg:col-span-4">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white/40">
              Subscribe to newsletter
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setEmail('')
              }}
              className="flex items-center gap-2 rounded-full bg-white/8 p-1.5"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                aria-label="Email address"
                className="min-w-0 flex-1 bg-transparent px-4 font-body text-sm text-white outline-none placeholder:text-white/40"
              />
              <Button type="submit" variant="brand" size="md" className="shrink-0">
                Subscribe
              </Button>
            </form>

            <div className="flex flex-col gap-3 pt-1">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/8 text-brand">
                  <PhoneIcon className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-body text-xs text-white/40">Toll free worldwide support</p>
                  <p className="font-display text-sm font-semibold">+(8) 123 456 7890</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/8 text-brand">
                  <MailIcon className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-body text-xs text-white/40">Sales &amp; inquiries</p>
                  <p className="font-display text-sm font-semibold">hello@stellr.studio</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-14 text-center font-display text-xl font-bold tracking-tight text-white/90 sm:text-2xl">
          www.stellr.studio
        </p>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <ul className="flex flex-wrap items-center gap-6">
            {BOTTOM_LINKS.map((l) => (
              <li key={l}>
                <a href="#top" className="font-body text-sm text-white/55 transition-colors hover:text-white">
                  {l}
                </a>
              </li>
            ))}
          </ul>
          <p className="font-body text-sm text-white/45">© 2026 Stellr — Crafted with care.</p>
        </div>
      </div>
    </footer>
  )
}
