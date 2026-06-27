import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { SectionLabel } from '@/components/common/SectionLabel'
import { useTr, type Localized } from '@/lib/i18n'

const GROW_IMAGE = '/banner1.png'

const BENEFITS: Localized[] = [
  {
    fr: 'Constitution de société sans accroc au Tchad',
    en: 'Seamless company incorporation in Chad',
    ar: 'تأسيس شركة بسلاسة في تشاد',
  },
  {
    fr: 'Adresse de bureau virtuel prestigieuse au Tchad avec réexpédition du courrier',
    en: 'Prestigious Chad virtual office address with mail forwarding',
    ar: 'عنوان مكتب افتراضي مرموق في تشاد مع إعادة توجيه البريد',
  },
  {
    fr: 'Services complets de bureau virtuel et d’agent enregistré',
    en: 'Complete virtual office & registered-agent services',
    ar: 'خدمات متكاملة للمكتب الافتراضي والوكيل المسجّل',
  },
  {
    fr: 'L’essentiel pour votre entreprise réuni en un seul endroit',
    en: 'Business essentials under one roof',
    ar: 'كل ما يلزم عملك تحت سقف واحد',
  },
  {
    fr: 'Assistance dédiée et accompagnement personnalisé',
    en: 'Dedicated support & personalised guidance',
    ar: 'دعم مخصص وإرشاد شخصي',
  },
]

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className={className}>
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** "Grow with us together" — benefits checklist beside a portrait image. */
export function GrowTogetherSection() {
  const tr = useTr()
  const navigate = useNavigate()

  return (
    <section id="grow" className="py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
        {/* Left: copy + checklist */}
        <div className="flex flex-col gap-6">
          <SectionLabel>{tr({ fr: 'Grandissez avec nous', en: 'Grow with us', ar: 'انمُ معنا' })}</SectionLabel>
          <h2 className="max-w-md font-display text-display-lg font-bold text-frost">
            {tr({ fr: 'Grandissez avec GATE', en: 'Grow with GATE together', ar: 'انمُ مع GATE معاً' })}
          </h2>
          <p className="max-w-md font-body text-base leading-relaxed text-frost/60">
            {tr({
              fr: 'En tant que partenaire agréé de création d’entreprise, nous offrons des solutions fiables et officielles pour aider votre entreprise à croître et à réussir au Tchad.',
              en: 'As an accredited business-formation partner, we provide reliable, official solutions to help your business grow and succeed in Chad.',
              ar: 'بصفتنا شريكاً معتمداً لتأسيس الأعمال، نقدّم حلولاً موثوقة ورسمية لمساعدة عملك على النمو والنجاح في تشاد.',
            })}
          </p>

          <ul className="flex flex-col gap-3.5">
            {BENEFITS.map((benefit) => (
              <li key={benefit.en} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-electric/15 text-teal-electric">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                <span className="font-body text-base text-frost/75">{tr(benefit)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-2">
            <Button variant="primary" size="lg" onClick={() => navigate('/contact')}>
              {tr({ fr: 'Parlez-nous dès maintenant', en: 'Talk to us now', ar: 'تحدّث إلينا الآن' })}
            </Button>
          </div>
        </div>

        {/* Right: image */}
        <div className="relative overflow-hidden rounded-[2rem] shadow-2xl shadow-frost/10">
          <img
            src={GROW_IMAGE}
            alt={tr({
              fr: 'Un professionnel prêt à vous aider à grandir',
              en: 'A business professional ready to help you grow',
              ar: 'محترف أعمال مستعد لمساعدتك على النمو',
            })}
            loading="lazy"
            className="h-[360px] w-full object-cover sm:h-[460px]"
          />
        </div>
      </div>
    </section>
  )
}
