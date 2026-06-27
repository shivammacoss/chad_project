import { SectionLabel } from '@/components/common/SectionLabel'
import { useTr, type Localized } from '@/lib/i18n'

interface LocalizedFeature {
  id: string
  title: Localized
  description: Localized
}

const FEATURES: LocalizedFeature[] = [
  {
    id: 'W-01',
    title: {
      fr: 'Adapté aux non-résidents',
      en: 'Non-Resident Friendly',
      ar: 'مناسب لغير المقيمين',
    },
    description: {
      fr: 'Même processus et mêmes tarifs, que vous viviez dans le pays ou ailleurs dans le monde.',
      en: 'Same process and pricing whether you live in the country or anywhere else in the world.',
      ar: 'نفس الإجراءات والأسعار سواء كنت تعيش داخل البلد أو في أي مكان آخر من العالم.',
    },
  },
  {
    id: 'W-02',
    title: {
      fr: 'Dépôt rapide au Tchad',
      en: 'Fast Chad Filing',
      ar: 'تسجيل سريع في تشاد',
    },
    description: {
      fr: 'Création de société déposée directement auprès des autorités tchadiennes — gérée de bout en bout.',
      en: 'Company formation filed directly with the Chad authorities — handled end to end.',
      ar: 'تأسيس الشركة يُقدَّم مباشرة لدى السلطات التشادية — مع إدارة كاملة من البداية إلى النهاية.',
    },
  },
  {
    id: 'W-03',
    title: {
      fr: 'Agent enregistré inclus',
      en: 'Registered Agent Included',
      ar: 'وكيل مسجَّل مشمول',
    },
    description: {
      fr: 'Services de siège social et d’agent enregistré inclus dans vos forfaits de constitution.',
      en: 'Registered office and agent services bundled with your incorporation packages.',
      ar: 'خدمات المقر المسجَّل والوكيل مشمولة ضمن باقات التأسيس الخاصة بك.',
    },
  },
  {
    id: 'W-04',
    title: {
      fr: 'Sécurisé et confidentiel',
      en: 'Secure & Confidential',
      ar: 'آمن وسري',
    },
    description: {
      fr: 'Vos données et votre courrier traités selon des normes reconnues de sécurité et de conformité.',
      en: 'Your data and mail handled to recognised security and compliance standards.',
      ar: 'تُعالَج بياناتك ومراسلاتك وفق معايير معترف بها للأمان والامتثال.',
    },
  },
  {
    id: 'W-05',
    title: {
      fr: 'Assistance mondiale',
      en: 'Worldwide Support',
      ar: 'دعم عالمي',
    },
    description: {
      fr: 'Une véritable équipe disponible à toute heure pour vous guider à chaque étape.',
      en: 'A real team available around the clock to guide you through every step.',
      ar: 'فريق حقيقي متاح على مدار الساعة لإرشادك في كل خطوة.',
    },
  },
  {
    id: 'W-06',
    title: {
      fr: 'Tarifs transparents',
      en: 'Transparent Pricing',
      ar: 'أسعار شفافة',
    },
    description: {
      fr: 'Des frais clairs et fixes, sans coûts cachés — vous savez toujours ce que vous payez.',
      en: 'Clear, fixed fees with no hidden costs — you always know what you pay.',
      ar: 'رسوم واضحة وثابتة دون تكاليف خفية — تعرف دائمًا ما تدفعه.',
    },
  },
]

export function FeaturesSection() {
  const tr = useTr()

  return (
    <section id="why" className="border-t border-frost/10 bg-navy">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="mb-12 flex flex-col gap-4">
          <SectionLabel index="04">
            {tr({ fr: 'Pourquoi GATE', en: 'Why GATE', ar: 'لماذا GATE' })}
          </SectionLabel>
          <h2 className="max-w-2xl text-display-lg font-semibold text-frost">
            {tr({
              fr: 'Conçu pour simplifier les affaires à l’international.',
              en: 'Built to make global business simple.',
              ar: 'مصمَّم لجعل الأعمال العالمية بسيطة.',
            })}
          </h2>
          <p className="max-w-xl font-body text-base leading-relaxed text-frost/60">
            {tr({
              fr: 'De votre premier dépôt à la conformité continue, chaque aspect de la gestion d’une société se trouve dans un même lieu de confiance.',
              en: 'From your first filing to ongoing compliance, every part of running a company lives in one trusted place.',
              ar: 'من أول تسجيل لك إلى الامتثال المستمر، كل جانب من جوانب إدارة الشركة موجود في مكان واحد موثوق.',
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-frost/10 bg-frost/10 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <article
              key={feature.id}
              className="group flex flex-col gap-4 bg-navy p-7 transition-colors duration-300 hover:bg-steel/60 sm:p-8"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-medium tracking-wider text-teal-electric/80">
                  {feature.id}
                </span>
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-frost/20 transition-colors duration-300 group-hover:bg-teal-electric"
                />
              </div>
              <h3 className="font-display text-xl font-semibold text-frost">{tr(feature.title)}</h3>
              <p className="font-body text-sm leading-relaxed text-frost/60">
                {tr(feature.description)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
