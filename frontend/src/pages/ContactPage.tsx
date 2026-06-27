import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SectionLabel } from '@/components/common/SectionLabel'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { MENU } from '@/content/menu'
import { cn } from '@/lib/utils'
import { useTr, type Localized } from '@/lib/i18n'

const INTERESTS: Localized[] = MENU.filter((c) => !c.custom).map((c) => c.label)

const inputClasses =
  'w-full rounded-lg border border-frost/15 bg-steel/30 px-4 py-3 font-body text-sm text-frost outline-none transition-colors placeholder:text-frost/35 focus:border-teal-electric/50 focus:bg-steel/50'

export default function ContactPage() {
  const tr = useTr()
  const [interest, setInterest] = useState<Localized>(INTERESTS[0])
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
              <Breadcrumb
                items={[
                  { label: tr({ fr: 'Accueil', en: 'Home', ar: 'الرئيسية' }), to: '/' },
                  { label: tr({ fr: 'Contact', en: 'Contact', ar: 'اتصال' }) },
                ]}
              />
              <SectionLabel>{tr({ fr: 'Entrer en contact', en: 'Get in touch', ar: 'تواصل معنا' })}</SectionLabel>
              <h1 className="text-display-lg font-bold text-frost">
                {tr({ fr: 'Mettons votre entreprise ', en: "Let's get your business ", ar: 'لنجعل أعمالك ' })}
                <span className="text-gradient">
                  {tr({ fr: 'en mouvement.', en: 'moving.', ar: 'تتحرّك.' })}
                </span>
              </h1>
              <p className="max-w-md font-body text-lg leading-relaxed text-frost/65">
                {tr({
                  fr: 'Dites-nous ce dont vous avez besoin et notre équipe vous répondra, généralement sous un jour ouvré.',
                  en: 'Tell us what you need and our team will get back to you, usually within one business day.',
                  ar: 'أخبرنا بما تحتاجه وسيردّ عليك فريقنا، عادةً في غضون يوم عمل واحد.',
                })}
              </p>

              <div className="mt-2 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-steel/60 font-mono text-teal-electric">
                    ✆
                  </span>
                  <div>
                    <p className="font-mono text-xs uppercase tracking-wider text-frost/40">
                      {tr({ fr: 'Assistance mondiale', en: 'Worldwide support', ar: 'دعم عالمي' })}
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
                      {tr({ fr: 'Ventes et demandes', en: 'Sales & inquiries', ar: 'المبيعات والاستفسارات' })}
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
                  <Badge tone="live">{tr({ fr: 'Message reçu', en: 'Message received', ar: 'تم استلام الرسالة' })}</Badge>
                  <h2 className="text-display-md font-semibold text-frost">
                    {tr({ fr: 'Merci.', en: 'Thank you.', ar: 'شكرًا لك.' })}
                  </h2>
                  <p className="max-w-sm font-body text-sm text-frost/60">
                    {tr({ fr: 'Nous avons enregistré votre demande concernant ', en: "We've logged your enquiry about ", ar: 'لقد سجّلنا استفسارك حول ' })}
                    <span className="text-frost">{tr(interest)}</span>{' '}
                    {tr({ fr: 'et nous vous contacterons sous peu.', en: 'and will be in touch shortly.', ar: 'وسنتواصل معك قريبًا.' })}
                  </p>
                  <Button variant="outline" size="md" onClick={() => setSent(false)}>
                    {tr({ fr: 'Envoyer un autre message', en: 'Send another message', ar: 'إرسال رسالة أخرى' })}
                  </Button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="flex flex-col gap-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-2">
                      <span className="font-mono text-xs uppercase tracking-wider text-frost/50">
                        {tr({ fr: 'Nom complet', en: 'Full name', ar: 'الاسم الكامل' })}
                      </span>
                      <input
                        required
                        name="name"
                        placeholder={tr({ fr: 'Jean Dupont', en: 'Jane Doe', ar: 'فلان الفلاني' })}
                        className={inputClasses}
                      />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="font-mono text-xs uppercase tracking-wider text-frost/50">
                        {tr({ fr: 'E-mail', en: 'Email', ar: 'البريد الإلكتروني' })}
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
                      {tr({ fr: 'Je suis intéressé par', en: "I'm interested in", ar: 'أنا مهتم بـ' })}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {INTERESTS.map((item) => (
                        <button
                          key={item.en}
                          type="button"
                          onClick={() => setInterest(item)}
                          className={cn(
                            'rounded-full border px-3.5 py-1.5 font-body text-xs transition-colors',
                            interest === item
                              ? 'border-teal-electric/50 bg-teal-electric/10 text-teal-electric'
                              : 'border-frost/15 text-frost/60 hover:border-frost/30 hover:text-frost',
                          )}
                        >
                          {tr(item)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="flex flex-col gap-2">
                    <span className="font-mono text-xs uppercase tracking-wider text-frost/50">
                      {tr({ fr: 'Comment pouvons-nous vous aider ?', en: 'How can we help?', ar: 'كيف يمكننا مساعدتك؟' })}
                    </span>
                    <textarea
                      required
                      name="message"
                      rows={4}
                      placeholder={tr({
                        fr: 'Parlez-nous un peu de votre entreprise…',
                        en: 'Tell us a little about your business…',
                        ar: 'أخبرنا قليلاً عن أعمالك…',
                      })}
                      className={cn(inputClasses, 'resize-none')}
                    />
                  </label>

                  <Button type="submit" variant="primary" size="lg" fullWidth>
                    {tr({ fr: 'Envoyer le message', en: 'Send Message', ar: 'إرسال الرسالة' })}
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
