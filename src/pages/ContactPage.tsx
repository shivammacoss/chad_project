import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SectionLabel } from '@/components/common/SectionLabel'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { MENU } from '@/content/menu'
import { cn } from '@/lib/utils'

const INTERESTS = MENU.filter((c) => !c.custom).map((c) => c.label)

const inputClasses =
  'w-full rounded-lg border border-frost/15 bg-steel/30 px-4 py-3 font-body text-sm text-frost outline-none transition-colors placeholder:text-frost/35 focus:border-teal-electric/50 focus:bg-steel/50'

export default function ContactPage() {
  const [interest, setInterest] = useState<string>(INTERESTS[0])
  const [sent, setSent] = useState(false)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="bg-navy">
      <section className="relative overflow-hidden pt-16">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-grid-pattern bg-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-hero-gradient opacity-70" />

        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Left: copy */}
            <div className="flex flex-col gap-6 motion-safe:animate-fade-up">
              <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Contact' }]} />
              <SectionLabel>Get in touch</SectionLabel>
              <h1 className="text-display-lg font-bold text-frost">
                Let&apos;s get your business <span className="text-gradient">moving.</span>
              </h1>
              <p className="max-w-md font-body text-lg leading-relaxed text-frost/65">
                Tell us what you need and our team will get back to you, usually within one business
                day.
              </p>

              <div className="mt-2 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-steel/60 font-mono text-teal-electric">
                    ✆
                  </span>
                  <div>
                    <p className="font-mono text-xs uppercase tracking-wider text-frost/40">
                      Worldwide support
                    </p>
                    <p className="font-display text-sm font-semibold text-frost">+(8) 123 456 7890</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-steel/60 font-mono text-teal-electric">
                    @
                  </span>
                  <div>
                    <p className="font-mono text-xs uppercase tracking-wider text-frost/40">
                      Sales &amp; inquiries
                    </p>
                    <p className="font-display text-sm font-semibold text-frost">
                      hello@gridglobalgate.com
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: form */}
            <div className="rounded-3xl border border-frost/10 bg-steel/30 p-6 sm:p-8">
              {sent ? (
                <div className="flex h-full min-h-[20rem] flex-col items-center justify-center gap-4 text-center">
                  <Badge tone="live">Message received</Badge>
                  <h2 className="text-display-md font-semibold text-frost">Thank you.</h2>
                  <p className="max-w-sm font-body text-sm text-frost/60">
                    We&apos;ve logged your enquiry about <span className="text-frost">{interest}</span>{' '}
                    and will be in touch shortly.
                  </p>
                  <Button variant="outline" size="md" onClick={() => setSent(false)}>
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="flex flex-col gap-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-2">
                      <span className="font-mono text-xs uppercase tracking-wider text-frost/50">
                        Full name
                      </span>
                      <input required name="name" placeholder="Jane Doe" className={inputClasses} />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="font-mono text-xs uppercase tracking-wider text-frost/50">
                        Email
                      </span>
                      <input
                        required
                        type="email"
                        name="email"
                        placeholder="jane@company.com"
                        className={inputClasses}
                      />
                    </label>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="font-mono text-xs uppercase tracking-wider text-frost/50">
                      I&apos;m interested in
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {INTERESTS.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setInterest(item)}
                          className={cn(
                            'rounded-full border px-3.5 py-1.5 font-body text-xs transition-colors',
                            interest === item
                              ? 'border-teal-electric/50 bg-teal-electric/10 text-teal-electric'
                              : 'border-frost/15 text-frost/60 hover:border-frost/30 hover:text-frost',
                          )}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="flex flex-col gap-2">
                    <span className="font-mono text-xs uppercase tracking-wider text-frost/50">
                      How can we help?
                    </span>
                    <textarea
                      required
                      name="message"
                      rows={4}
                      placeholder="Tell us a little about your business…"
                      className={cn(inputClasses, 'resize-none')}
                    />
                  </label>

                  <Button type="submit" variant="primary" size="lg" fullWidth>
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
