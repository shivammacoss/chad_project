import { SectionLabel } from '@/components/common/SectionLabel'
import { useTr, type Localized } from '@/lib/i18n'

interface Step {
  n: string
  title: Localized
  description: Localized
}

const STEPS: Step[] = [
  {
    n: '01',
    title: {
      fr: 'Choisissez votre service',
      en: 'Choose Your Service',
      ar: 'اختر خدمتك',
    },
    description: {
      fr: 'Choisissez une juridiction et les services dont vous avez besoin — adresse, constitution ou conformité.',
      en: 'Pick a jurisdiction and the services you need — address, incorporation or compliance.',
      ar: 'اختر الولاية القضائية والخدمات التي تحتاجها — عنوان أو تأسيس أو امتثال.',
    },
  },
  {
    n: '02',
    title: {
      fr: 'Partagez vos informations',
      en: 'Share Your Details',
      ar: 'شارك بياناتك',
    },
    description: {
      fr: 'Transmettez-nous vos informations une seule fois. Nous vous indiquons précisément ce qui est requis et vous guidons.',
      en: 'Send us your information once. We tell you exactly what is required and guide you.',
      ar: 'أرسل لنا معلوماتك مرة واحدة. نخبرك بالضبط بما هو مطلوب ونرشدك.',
    },
  },
  {
    n: '03',
    title: {
      fr: 'Nous gérons le dépôt',
      en: 'We Handle the Filing',
      ar: 'نحن نتولى التسجيل',
    },
    description: {
      fr: 'Nous préparons et déposons tout, et mettons en place votre adresse et votre agent enregistré.',
      en: 'We prepare and submit everything, set up your address and registered agent.',
      ar: 'نُعِدّ ونقدّم كل شيء، ونُنشئ عنوانك ووكيلك المسجَّل.',
    },
  },
  {
    n: '04',
    title: {
      fr: 'Commencez votre activité',
      en: 'Start Trading',
      ar: 'ابدأ نشاطك',
    },
    description: {
      fr: 'Recevez vos documents et commencez à exploiter votre société — généralement en quelques jours.',
      en: 'Receive your documents and start operating your company — usually within days.',
      ar: 'استلم مستنداتك وابدأ تشغيل شركتك — عادةً في غضون أيام.',
    },
  },
]

export function ProcessSection() {
  const tr = useTr()

  return (
    <section id="process" className="border-t border-frost/10 bg-navy">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="mb-12 flex flex-col gap-4">
          <SectionLabel index="05">
            {tr({ fr: 'Comment ça marche', en: 'How it works', ar: 'كيف تعمل الخدمة' })}
          </SectionLabel>
          <h2 className="max-w-2xl text-display-lg font-semibold text-frost">
            {tr({
              fr: 'De l’idée à la société constituée en quatre étapes.',
              en: 'From idea to incorporated in four steps.',
              ar: 'من الفكرة إلى شركة مؤسَّسة في أربع خطوات.',
            })}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-frost/10 bg-frost/10 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <div key={step.n} className="flex flex-col gap-4 bg-navy p-7 sm:p-8">
              <span className="font-mono text-3xl font-medium text-teal-electric/80">{step.n}</span>
              <h3 className="font-display text-lg font-semibold text-frost">{tr(step.title)}</h3>
              <p className="font-body text-sm leading-relaxed text-frost/60">{tr(step.description)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
