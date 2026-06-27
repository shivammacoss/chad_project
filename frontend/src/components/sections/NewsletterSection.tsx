import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { SectionLabel } from '@/components/common/SectionLabel'
import { useTr } from '@/lib/i18n'

export function NewsletterSection() {
  const tr = useTr()
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setDone(true)
      setEmail('')
    }
  }

  return (
    <section id="newsletter" className="py-16 sm:py-24">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-7 px-5 text-center sm:px-8">
        <SectionLabel>
          {tr({ fr: 'Notifications instantanées', en: 'Instant notifications', ar: 'إشعارات فورية' })}
        </SectionLabel>
        <h2 className="max-w-2xl font-display text-display-md font-bold text-frost sm:text-display-lg">
          {tr({
            fr: 'Abonnez-vous à notre newsletter pour rester toujours informé de nos nouvelles fonctionnalités',
            en: 'Subscribe to our newsletter to always be in the loop with our new awesome features',
            ar: 'اشترك في نشرتنا الإخبارية لتبقى دائماً على اطلاع بميزاتنا الجديدة الرائعة',
          })}
        </h2>

        <form
          onSubmit={onSubmit}
          className="mt-2 flex w-full max-w-md items-center gap-2 rounded-full border border-frost/15 bg-white p-1.5 shadow-sm focus-within:border-frost/30"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setDone(false)
            }}
            placeholder={tr({ fr: 'Saisissez votre e-mail', en: 'Enter your email', ar: 'أدخل بريدك الإلكتروني' })}
            aria-label={tr({ fr: 'Adresse e-mail', en: 'Email address', ar: 'عنوان البريد الإلكتروني' })}
            className="min-w-0 flex-1 bg-transparent px-4 font-body text-sm text-frost outline-none placeholder:text-frost/40"
          />
          <Button type="submit" variant="primary" size="md" className="shrink-0">
            {done
              ? tr({ fr: 'Abonné ✓', en: 'Subscribed ✓', ar: 'تم الاشتراك ✓' })
              : tr({ fr: 'S’abonner', en: 'Subscribe', ar: 'اشترك' })}
          </Button>
        </form>
      </div>
    </section>
  )
}
