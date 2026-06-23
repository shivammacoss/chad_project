import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SectionLabel } from '@/components/common/SectionLabel'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { cn } from '@/lib/utils'

interface Post {
  title: string
  excerpt: string
  category: string
  readTime: string
  date: string
}

const CATEGORIES = ['All', 'Formation', 'Compliance', 'Banking', 'Back Office']

const POSTS: Post[] = [
  {
    title: 'How non-residents can form a UK limited company',
    excerpt:
      'A step-by-step guide to incorporating in the UK from abroad — documents, addresses and timelines.',
    category: 'Formation',
    readTime: '6 min',
    date: 'Jun 2026',
  },
  {
    title: 'Confirmation statements: what they are and why they matter',
    excerpt: 'Stay compliant with Companies House by understanding this essential annual filing.',
    category: 'Compliance',
    readTime: '4 min',
    date: 'May 2026',
  },
  {
    title: 'Choosing between a US address only and an LLC',
    excerpt: 'When you need just a presence versus a full entity — and how to decide.',
    category: 'Formation',
    readTime: '5 min',
    date: 'May 2026',
  },
  {
    title: 'Opening a business bank account as a new company',
    excerpt: 'What banks look for, and how trusted referrals can speed up approval.',
    category: 'Banking',
    readTime: '7 min',
    date: 'Apr 2026',
  },
  {
    title: 'Outsourcing data entry without losing quality',
    excerpt: 'How validation and QA keep accuracy high when you scale your back office.',
    category: 'Back Office',
    readTime: '5 min',
    date: 'Apr 2026',
  },
  {
    title: 'Keeping your home address private as a director',
    excerpt: "Why a director's service address protects your privacy on the public record.",
    category: 'Compliance',
    readTime: '4 min',
    date: 'Mar 2026',
  },
]

export default function InsightsPage() {
  const [active, setActive] = useState('All')
  const visible = active === 'All' ? POSTS : POSTS.filter((p) => p.category === active)
  const [featured, ...rest] = visible

  return (
    <div className="bg-navy">
      <section className="relative overflow-hidden pt-16">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-grid-pattern bg-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-hero-gradient opacity-70" />
        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="flex max-w-3xl flex-col gap-6 motion-safe:animate-fade-up">
            <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Insights' }]} />
            <SectionLabel>Latest Insights</SectionLabel>
            <h1 className="text-display-lg font-bold text-frost">Expert Guides &amp; Insights</h1>
            <p className="max-w-2xl font-body text-lg leading-relaxed text-frost/65">
              Practical guidance on business formation, compliance, and entrepreneurship.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-frost/10">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
          {/* Category filter */}
          <div className="mb-10 flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActive(cat)}
                className={cn(
                  'rounded-full border px-4 py-2 font-body text-sm transition-colors',
                  active === cat
                    ? 'border-teal-electric/50 bg-teal-electric/10 text-teal-electric'
                    : 'border-frost/15 text-frost/60 hover:border-frost/30 hover:text-frost',
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {featured && (
            <article className="group mb-6 overflow-hidden rounded-3xl border border-frost/10 bg-steel/30 transition-colors hover:bg-steel/50">
              <div className="grid gap-6 p-7 sm:p-10 lg:grid-cols-2 lg:items-center">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <Badge tone="live" withDot={false}>
                      Featured
                    </Badge>
                    <span className="font-mono text-xs uppercase tracking-wider text-frost/40">
                      {featured.category} · {featured.readTime}
                    </span>
                  </div>
                  <h2 className="text-display-md font-semibold text-frost">{featured.title}</h2>
                  <p className="font-body text-base leading-relaxed text-frost/60">
                    {featured.excerpt}
                  </p>
                  <span className="font-mono text-xs text-frost/40">{featured.date}</span>
                </div>
                <div className="hidden h-full min-h-[12rem] items-center justify-center rounded-2xl bg-grid-pattern bg-grid lg:flex">
                  <span className="font-display text-6xl font-bold text-frost/10">GG</span>
                </div>
              </div>
            </article>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <article
                key={post.title}
                className="group flex flex-col gap-3 rounded-2xl border border-frost/10 bg-steel/20 p-6 transition-colors hover:bg-steel/50"
              >
                <span className="font-mono text-xs uppercase tracking-wider text-teal-electric/80">
                  {post.category} · {post.readTime}
                </span>
                <h3 className="font-display text-lg font-semibold text-frost">{post.title}</h3>
                <p className="font-body text-sm leading-relaxed text-frost/60">{post.excerpt}</p>
                <span className="mt-auto font-mono text-xs text-frost/40">{post.date}</span>
              </article>
            ))}
          </div>

          {visible.length === 0 && (
            <p className="font-body text-sm text-frost/50">No articles in this category yet.</p>
          )}
        </div>
      </section>

      {/* Newsletter signup */}
      <section className="border-t border-frost/10">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="flex flex-col items-center gap-5 text-center">
            <SectionLabel>Stay in the loop</SectionLabel>
            <h2 className="max-w-xl text-display-md font-semibold text-frost">
              Get new guides in your inbox.
            </h2>
            <NewsletterInline />
          </div>
        </div>
      </section>
    </div>
  )
}

function NewsletterInline() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (email.trim()) setDone(true)
      }}
      className="flex w-full max-w-md flex-col items-center gap-3 sm:flex-row"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => {
          setEmail(e.target.value)
          setDone(false)
        }}
        placeholder="Enter your email"
        aria-label="Email address"
        className="h-12 w-full flex-1 rounded-lg border border-frost/15 bg-steel/30 px-4 font-body text-sm text-frost outline-none transition-colors placeholder:text-frost/35 focus:border-teal-electric/50"
      />
      <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto">
        {done ? 'Subscribed ✓' : 'Subscribe'}
      </Button>
    </form>
  )
}
