import { Link } from 'react-router-dom'
import { SectionLabel } from '@/components/common/SectionLabel'
import { useTr, type Localized } from '@/lib/i18n'

interface ChadService {
  num: string
  name: Localized
  role: Localized
  blurb: Localized
  to: string
  /** Background image path for the box. Leave '' to show the dark placeholder. */
  image: string
}

/** Everything you can set up in Chad with us — single-jurisdiction focus. */
const CHAD_SERVICES: ChadService[] = [
  {
    num: '01',
    name: {
      fr: 'Création de société au Tchad',
      en: 'Chad Company Formation',
      ar: 'تأسيس شركة في تشاد',
    },
    role: {
      fr: 'Résidents et non-résidents',
      en: 'Residents & Non-Residents',
      ar: 'المقيمون وغير المقيمين',
    },
    blurb: {
      fr: 'Immatriculez votre société au Tchad, tous les documents pris en charge pour vous.',
      en: 'Register your company in Chad with all documents handled for you.',
      ar: 'سجّل شركتك في تشاد مع تولّينا جميع المستندات نيابةً عنك.',
    },
    to: '/incorporation/non-resident',
    image: '/box1.png',
  },
  {
    num: '02',
    name: {
      fr: 'Adresse de siège social',
      en: 'Registered Office Address',
      ar: 'عنوان المكتب المسجّل',
    },
    role: {
      fr: 'Adresse officielle au Tchad',
      en: 'Official Chad Address',
      ar: 'عنوان رسمي في تشاد',
    },
    blurb: {
      fr: 'Un siège social et une adresse d’agent conformes au Tchad.',
      en: 'A compliant registered office and agent address in Chad.',
      ar: 'مكتب مسجّل وعنوان وكيل متوافقان في تشاد.',
    },
    to: '/virtual-offices',
    image: '/box2.png',
  },
  {
    num: '03',
    name: {
      fr: 'Bureau virtuel au Tchad',
      en: 'Chad Virtual Office',
      ar: 'مكتب افتراضي في تشاد',
    },
    role: {
      fr: 'Gestion du courrier incluse',
      en: 'Mail Handling Included',
      ar: 'إدارة البريد مشمولة',
    },
    blurb: {
      fr: 'Une adresse professionnelle prestigieuse au Tchad avec numérisation et réexpédition du courrier.',
      en: 'A prestigious Chad business address with mail scanning & forwarding.',
      ar: 'عنوان تجاري مرموق في تشاد مع مسح البريد وإعادة توجيهه.',
    },
    to: '/virtual-offices',
    image: '/box3.png',
  },
  {
    num: '04',
    name: {
      fr: 'Déclarations légales et conformité',
      en: 'Statutory Filings & Compliance',
      ar: 'الإيداعات القانونية والامتثال',
    },
    role: {
      fr: 'Toujours en règle',
      en: 'Always in Good Standing',
      ar: 'دائماً في وضع قانوني سليم',
    },
    blurb: {
      fr: 'Nous maintenons votre société tchadienne en conformité et vos déclarations à jour.',
      en: 'We keep your Chad company compliant and filings up to date.',
      ar: 'نحافظ على امتثال شركتك التشادية وعلى تحديث إيداعاتها.',
    },
    to: '/company-services',
    image: '/box4.png',
  },
]

export function JurisdictionsSection() {
  const tr = useTr()
  return (
    <section id="jurisdictions" className="py-16 sm:py-20">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-5 sm:px-8">
        <div className="flex flex-col gap-5">
          <SectionLabel>
            {tr({
              fr: 'Votre partenaire accrédité au Tchad',
              en: 'Your accredited partner in Chad',
              ar: 'شريكك المعتمد في تشاد',
            })}
          </SectionLabel>
          <h2 className="max-w-2xl font-display text-display-lg font-bold text-frost">
            {tr({
              fr: 'La porte d’entrée officielle pour immatriculer et gérer votre société au Tchad',
              en: 'The official gateway to register and run your company in Chad',
              ar: 'البوابة الرسمية لتسجيل شركتك وإدارتها في تشاد',
            })}
          </h2>
          <p className="max-w-xl font-body text-base leading-relaxed text-frost/60">
            {tr({
              fr: 'En tant qu’agent enregistré agréé, nous aidons les entreprises de toutes tailles à s’implanter, se développer et opérer au Tchad — création de société, adresses officielles et conformité réglementaire continue gérées en un seul endroit.',
              en: 'Acting as your authorised registered agent, we help businesses of every size establish, expand and operate in Chad — with company formation, official addresses and ongoing regulatory compliance handled in one place.',
              ar: 'بصفتنا وكيلك المسجّل المعتمد، نساعد الشركات من جميع الأحجام على التأسيس والتوسّع والعمل في تشاد — مع تولّي تأسيس الشركات والعناوين الرسمية والامتثال التنظيمي المستمر في مكان واحد.',
            })}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {CHAD_SERVICES.map((s) => (
            <Link
              key={s.name.en}
              to={s.to}
              className="group relative flex min-h-[210px] items-center overflow-hidden rounded-3xl bg-frost bg-cover bg-center p-7 sm:p-8"
              style={s.image ? { backgroundImage: `url(${s.image})` } : undefined}
            >
              {/* Dark overlay so text stays readable over any image */}
              <div className="absolute inset-0 bg-frost/70 transition-colors duration-300 group-hover:bg-frost/60" />

              {/* Large faded step number watermark */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 select-none font-display text-[8rem] font-bold leading-none text-white/25 sm:left-6"
              >
                {s.num}
              </span>

              {/* Text content, offset to the right of the number */}
              <div className="relative ml-auto flex w-[62%] flex-col gap-2">
                <div>
                  <h3 className="font-display text-lg font-semibold leading-snug text-white">
                    {tr(s.name)}
                  </h3>
                  <p className="font-body text-xs font-medium text-chad-yellow">{tr(s.role)}</p>
                </div>
                <p className="font-body text-sm leading-relaxed text-white/75">{tr(s.blurb)}</p>
                <span className="mt-1 inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-chad-yellow transition-all group-hover:gap-2">
                  {tr({ fr: 'En savoir plus', en: 'Learn more', ar: 'اعرف المزيد' })} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
