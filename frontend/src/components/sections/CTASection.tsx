import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useTr } from '@/lib/i18n'

export function CTASection() {
  const navigate = useNavigate()
  const tr = useTr()

  return (
    <section id="get-started" className="border-t border-frost/10 bg-navy">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="relative overflow-hidden rounded-3xl border border-teal-electric/15 bg-steel/30 px-6 py-16 sm:px-16 sm:py-20">
          {/* Grid-pattern background */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-grid-pattern bg-grid [mask-image:radial-gradient(ellipse_60%_80%_at_50%_50%,black,transparent)]"
          />
          <div
            aria-hidden="true"
            className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-pulse/20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-teal-electric/10 blur-3xl"
          />

          <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
            <Badge tone="live">
              {tr({
                fr: 'Intégration de nouvelles entreprises',
                en: 'Onboarding new businesses',
                ar: 'استقبال أعمال جديدة',
              })}
            </Badge>

            <h2 className="text-display-lg font-bold text-frost">
              {tr({
                fr: 'Faites passer votre entreprise',
                en: 'Bring your business',
                ar: 'مرِّر أعمالك',
              })}{' '}
              <span className="text-gradient">
                {tr({ fr: 'par GATE.', en: 'through the GATE.', ar: 'عبر GATE.' })}
              </span>
            </h2>

            <p className="max-w-xl font-body text-lg leading-relaxed text-frost/65">
              {tr({
                fr: 'Dites-nous ce dont vous avez besoin et notre équipe tracera la voie la plus rapide pour mettre en place votre société — généralement avec une réponse sous un jour ouvré.',
                en: 'Tell us what you need and our team will map out the fastest route to getting your company set up — usually with a response within one business day.',
                ar: 'أخبرنا بما تحتاجه وسيرسم فريقنا أسرع طريق لتأسيس شركتك — عادةً مع رد خلال يوم عمل واحد.',
              })}
            </p>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Button variant="primary" size="lg" onClick={() => navigate('/contact')}>
                {tr({ fr: 'Commencer', en: 'Get Started', ar: 'ابدأ' })}
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/virtual-offices')}>
                {tr({ fr: 'Explorer les services', en: 'Explore Services', ar: 'استكشف الخدمات' })}
              </Button>
            </div>

            <p className="mt-2 font-mono text-xs uppercase tracking-wider text-frost/40">
              {tr({
                fr: 'Aucuns frais cachés · Agent enregistré · Assistance mondiale',
                en: 'No hidden costs · Registered agent · Worldwide support',
                ar: 'لا تكاليف خفية · وكيل مسجَّل · دعم عالمي',
              })}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
