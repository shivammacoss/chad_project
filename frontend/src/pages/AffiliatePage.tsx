import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { SectionLabel } from '@/components/common/SectionLabel'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { MetricCard } from '@/components/ui/MetricCard'
import { useTr, type Localized } from '@/lib/i18n'

const STEPS: { id: string; title: Localized; description: Localized }[] = [
  {
    id: 'A-01',
    title: { fr: 'Inscription', en: 'Sign Up', ar: 'التسجيل' },
    description: {
      fr: 'Créez votre compte affilié gratuit en quelques minutes et obtenez votre lien de parrainage unique.',
      en: 'Create your free affiliate account in minutes and get your unique referral link.',
      ar: 'أنشئ حساب الشراكة المجاني في دقائق واحصل على رابط الإحالة الخاص بك.',
    },
  },
  {
    id: 'A-02',
    title: { fr: 'Recommandez des entreprises', en: 'Refer Businesses', ar: 'أحِل الشركات' },
    description: {
      fr: 'Partagez votre lien avec les fondateurs et les entreprises qui ont besoin de domiciliation, de création ou de conformité.',
      en: 'Share your link with founders and companies who need addresses, formation or compliance.',
      ar: 'شارك رابطك مع المؤسسين والشركات الذين يحتاجون إلى عناوين أو تأسيس أو امتثال.',
    },
  },
  {
    id: 'A-03',
    title: { fr: 'Gagnez des commissions', en: 'Earn Commission', ar: 'اكسب العمولة' },
    description: {
      fr: 'Soyez rémunéré pour chaque client qui s’inscrit via votre lien — avec un suivi transparent.',
      en: 'Get paid for every customer who signs up through your link — transparently tracked.',
      ar: 'احصل على أجر مقابل كل عميل يسجّل عبر رابطك — مع تتبّع شفاف.',
    },
  },
]

export default function AffiliatePage() {
  const navigate = useNavigate()
  const tr = useTr()

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
            <Breadcrumb
              items={[
                { label: tr({ fr: 'Accueil', en: 'Home', ar: 'الرئيسية' }), to: '/' },
                { label: tr({ fr: "Programme d'affiliation", en: 'Affiliate Programme', ar: 'برنامج الشراكة' }) },
              ]}
            />
            <SectionLabel>{tr({ fr: 'Partenariats', en: 'Partnerships', ar: 'الشراكات' })}</SectionLabel>
            <h1 className="text-display-lg font-bold text-frost">
              {tr({ fr: 'Devenez partenaire de ', en: 'Partner With ', ar: 'كن شريكًا مع ' })}
              <span className="text-gradient">GATE</span>
            </h1>
            <p className="max-w-2xl font-body text-lg leading-relaxed text-frost/65">
              {tr({
                fr: 'Gagnez de l’argent en recommandant des entreprises à nos services. Inscription simple, commissions transparentes.',
                en: 'Earn by referring businesses to our services. Simple sign-up, transparent commissions.',
                ar: 'اكسب من خلال إحالة الشركات إلى خدماتنا. تسجيل بسيط وعمولات شفافة.',
              })}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="primary" size="lg" onClick={() => navigate('/contact')}>
                {tr({ fr: 'Rejoindre le programme', en: 'Join the Programme', ar: 'انضم إلى البرنامج' })}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-frost/10">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-frost/10 bg-frost/10 lg:grid-cols-4">
            <MetricCard
              value="20%"
              label={tr({ fr: 'Commission', en: 'Commission', ar: 'عمولة' })}
              sublabel={tr({ fr: 'Par parrainage', en: 'Per Referral', ar: 'لكل إحالة' })}
            />
            <MetricCard
              value="90d"
              label={tr({ fr: 'Fenêtre de cookie', en: 'Cookie Window', ar: 'نافذة الكوكيز' })}
              sublabel={tr({ fr: 'Suivi généreux', en: 'Generous Tracking', ar: 'تتبّع سخيّ' })}
            />
            <MetricCard
              value={tr({ fr: 'Mensuels', en: 'Monthly', ar: 'شهريًا' })}
              label={tr({ fr: 'Versements', en: 'Payouts', ar: 'المدفوعات' })}
              sublabel={tr({ fr: 'Fiables', en: 'Reliable', ar: 'موثوقة' })}
            />
            <MetricCard
              value={tr({ fr: 'Gratuit', en: 'Free', ar: 'مجانًا' })}
              label={tr({ fr: 'Adhésion', en: 'To Join', ar: 'للانضمام' })}
              sublabel={tr({ fr: 'Sans frais', en: 'No Cost', ar: 'بدون تكلفة' })}
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-frost/10">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="mb-10 flex flex-col gap-3">
            <SectionLabel index="01">{tr({ fr: 'Comment ça marche', en: 'How it works', ar: 'كيف يعمل' })}</SectionLabel>
            <h2 className="max-w-2xl text-display-md font-semibold text-frost">
              {tr({ fr: 'Trois étapes pour commencer à gagner.', en: 'Three steps to start earning.', ar: 'ثلاث خطوات لتبدأ الكسب.' })}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-frost/10 bg-frost/10 sm:grid-cols-3">
            {STEPS.map((step) => (
              <article key={step.id} className="flex flex-col gap-3 bg-navy p-7">
                <span className="font-mono text-xs font-medium tracking-wider text-teal-electric/80">
                  {step.id}
                </span>
                <h3 className="font-display text-lg font-semibold text-frost">{tr(step.title)}</h3>
                <p className="font-body text-sm leading-relaxed text-frost/60">{tr(step.description)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-frost/10">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="relative overflow-hidden rounded-3xl border border-teal-electric/15 bg-steel/30 px-6 py-14 text-center sm:px-12">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-grid-pattern bg-grid [mask-image:radial-gradient(ellipse_60%_80%_at_50%_50%,black,transparent)]"
            />
            <div className="relative mx-auto flex max-w-xl flex-col items-center gap-5">
              <h2 className="text-display-md font-bold text-frost">
                {tr({ fr: 'Prêt à devenir notre partenaire ?', en: 'Ready to partner with us?', ar: 'هل أنت مستعد لتكون شريكنا؟' })}
              </h2>
              <p className="font-body text-base text-frost/60">
                {tr({
                  fr: 'Rejoignez le programme dès aujourd’hui et commencez à gagner des commissions transparentes.',
                  en: 'Join the programme today and start earning transparent commissions.',
                  ar: 'انضم إلى البرنامج اليوم وابدأ في كسب عمولات شفافة.',
                })}
              </p>
              <Button variant="primary" size="lg" onClick={() => navigate('/contact')}>
                {tr({ fr: 'Rejoindre le programme', en: 'Join the Programme', ar: 'انضم إلى البرنامج' })}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
