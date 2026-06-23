import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { CheckIcon } from '@/components/ui/Icons'
import { cn } from '@/lib/utils'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setDone(true)
    setEmail('')
  }

  return (
    <section id="newsletter" className="py-16 sm:py-24">
      <div className="container-x flex flex-col items-center gap-7 text-center">
        <SectionLabel>Instant notifications</SectionLabel>
        <h2 className="max-w-2xl text-balance font-display text-h-md font-bold text-ink sm:text-h-lg">
          Subscribe to our newsletter to always be in the loop with our new awesome features
        </h2>

        <form
          onSubmit={onSubmit}
          className="mt-2 flex w-full max-w-md items-center gap-2 rounded-full border border-line bg-white p-1.5 shadow-soft focus-within:border-ink/20"
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
            className="min-w-0 flex-1 bg-transparent px-4 font-body text-sm text-ink outline-none placeholder:text-slatey/70"
          />
          <Button type="submit" variant="brand" size="md" className="shrink-0">
            Subscribe
          </Button>
        </form>

        <p
          className={cn(
            'flex items-center gap-1.5 font-body text-sm text-brand-700 transition-opacity',
            done ? 'opacity-100' : 'opacity-0',
          )}
          aria-live="polite"
        >
          <CheckIcon className="h-4 w-4" /> You’re on the list — welcome aboard!
        </p>
      </div>
    </section>
  )
}
