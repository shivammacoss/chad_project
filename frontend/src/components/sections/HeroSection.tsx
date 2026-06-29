import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useTr, type Localized } from '@/lib/i18n'

const HERO_IMAGES = ['/hero_banner1.png', '/hero_banner2.png', '/hero_banner3.png']
// Clone the first slide at the end so the loop scrolls forward seamlessly.
const HERO_SLIDES = [...HERO_IMAGES, HERO_IMAGES[0]]

const FEATURES: { title: Localized; text: Localized }[] = [
  {
    title: {
      fr: 'Adapté aux non-résidents',
      en: 'Non-Resident Friendly',
      ar: 'مناسب لغير المقيمين',
    },
    text: {
      fr: 'Le même processus et les mêmes tarifs pour vous enregistrer au Tchad, où que vous viviez dans le monde.',
      en: 'The same process and pricing to register in Chad, wherever in the world you live.',
      ar: 'نفس الإجراءات والأسعار للتسجيل في تشاد، أينما كنت تعيش في العالم.',
    },
  },
  {
    title: {
      fr: 'Dépôt rapide au Tchad',
      en: 'Fast Chad Filing',
      ar: 'تسجيل سريع في تشاد',
    },
    text: {
      fr: 'Création de société déposée directement auprès des autorités tchadiennes, gérée de bout en bout.',
      en: 'Company formation filed directly with the Chad authorities, handled end to end.',
      ar: 'تأسيس الشركة يُقدَّم مباشرة لدى السلطات التشادية، مع إدارة كاملة من البداية إلى النهاية.',
    },
  },
  {
    title: {
      fr: 'Agent enregistré agréé',
      en: 'Authorised Registered Agent',
      ar: 'وكيل مسجَّل معتمد',
    },
    text: {
      fr: 'Services de siège social et d’agent enregistré agréés au Tchad, inclus dans votre forfait.',
      en: 'Accredited registered office and agent services in Chad, included with your package.',
      ar: 'خدمات مقر مسجَّل ووكيل معتمدة في تشاد، مشمولة في باقتك.',
    },
  },
]

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className={className}>
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function HeroSection() {
  const tr = useTr()
  const [index, setIndex] = useState(0)
  const [withTransition, setWithTransition] = useState(true)

  // Auto-advance every 2 seconds.
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => i + 1), 2000)
    return () => clearInterval(id)
  }, [])

  // When we land on the cloned slide, snap back to the real first one (without a
  // transition) so the loop appears continuous.
  useEffect(() => {
    if (index !== HERO_IMAGES.length) return
    const t = setTimeout(() => {
      setWithTransition(false)
      setIndex(0)
    }, 700)
    return () => clearTimeout(t)
  }, [index])

  // Re-enable the sliding transition on the next frame after a snap.
  useEffect(() => {
    if (withTransition) return
    const r = requestAnimationFrame(() => setWithTransition(true))
    return () => cancelAnimationFrame(r)
  }, [withTransition])

  const heroAlt = tr({
    fr: 'Une équipe collaborant dans un bureau moderne et lumineux',
    en: 'A team collaborating in a bright modern office',
    ar: 'فريق يتعاون في مكتب عصري مضيء',
  })

  return (
    <section id="top" className="relative pt-16">
      <div className="mx-auto max-w-7xl px-5 pt-8 sm:px-8 sm:pt-10">
        {/* Hero image carousel with overlaid headline */}
        <div className="relative overflow-hidden rounded-[2rem] shadow-2xl shadow-frost/10">
          <div
            className={`flex ${withTransition ? 'transition-transform duration-700 ease-out' : ''}`}
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {HERO_SLIDES.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={heroAlt}
                className="h-[420px] w-full shrink-0 object-cover sm:h-[520px] lg:h-[560px]"
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E13]/85 via-[#0B0E13]/25 to-transparent" />
        </div>

        {/* Overlapping white card: 3 features + CTA strip */}
        <div className="relative z-10 mx-auto -mt-12 w-[94%] rounded-[2rem] bg-white p-6 shadow-2xl shadow-frost/10 sm:-mt-16 sm:w-[92%] sm:p-8 lg:w-[88%]">
          <div className="grid gap-6 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-frost/10">
            {FEATURES.map((f) => (
              <div key={f.title.en} className="flex flex-col gap-2 sm:px-6 sm:first:pl-0 sm:last:pr-0">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-electric/15 text-indigo-pulse">
                    <CheckIcon className="h-4 w-4" />
                  </span>
                  <h3 className="font-display text-base font-semibold text-frost">{tr(f.title)}</h3>
                </div>
                <p className="font-body text-sm leading-relaxed text-frost/55">{tr(f.text)}</p>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-col gap-4 rounded-2xl bg-steel p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex flex-col gap-1">
              <p className="font-display text-lg font-semibold text-frost">
                {tr({
                  fr: 'Commencez votre parcours en explorant nos',
                  en: 'Start your journey by exploring our',
                  ar: 'ابدأ رحلتك باستكشاف',
                })}{' '}
                <span className="text-indigo-pulse">
                  {tr({ fr: 'services', en: 'services', ar: 'خدماتنا' })}
                </span>
              </p>
              <p className="font-body text-sm text-frost/55">
                {tr({
                  fr: 'Tout pour lancer et gérer votre société, en un seul endroit.',
                  en: 'Everything to launch and run your company, in one place.',
                  ar: 'كل ما يلزم لإطلاق وإدارة شركتك، في مكان واحد.',
                })}
              </p>
            </div>
            <Link to="/get-started" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full bg-chad-blue text-white shadow-none hover:bg-[#013a87] sm:w-auto"
              >
                {tr({ fr: 'Commencer maintenant', en: 'Get started now', ar: 'ابدأ الآن' })}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
