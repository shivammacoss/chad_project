import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SectionLabel } from '@/components/common/SectionLabel'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { MetricCard } from '@/components/ui/MetricCard'
import { useTr, type Localized } from '@/lib/i18n'

const BENEFITS: { id: string; title: Localized; description: Localized }[] = [
  {
    id: 'B-01',
    title: { fr: 'Structure fiscalement avantageuse', en: 'Tax-Efficient Structure', ar: 'هيكل فعّال ضريبيًا' },
    description: {
      fr: 'Opérez via une juridiction conçue pour être compétitive pour les affaires internationales.',
      en: 'Operate through a jurisdiction designed to be competitive for international business.',
      ar: 'اعمل عبر اختصاص قضائي مصمّم ليكون تنافسيًا للأعمال الدولية.',
    },
  },
  {
    id: 'B-02',
    title: { fr: 'Propriété étrangère à 100 %', en: '100% Foreign Ownership', ar: 'ملكية أجنبية بنسبة 100٪' },
    description: {
      fr: 'Conservez la pleine propriété de votre entreprise — aucun partenaire local requis.',
      en: 'Retain full ownership of your company — no local partner required.',
      ar: 'احتفظ بالملكية الكاملة لشركتك — دون الحاجة إلى شريك محلي.',
    },
  },
  {
    id: 'B-03',
    title: { fr: 'Création entièrement à distance', en: 'Fully Remote Setup', ar: 'تأسيس عن بُعد بالكامل' },
    description: {
      fr: 'Constituez votre société depuis n’importe où dans le monde, sans vous déplacer pour l’enregistrement.',
      en: 'Incorporate from anywhere in the world without travelling to register.',
      ar: 'أسّس شركتك من أي مكان في العالم دون الحاجة إلى السفر للتسجيل.',
    },
  },
  {
    id: 'B-04',
    title: { fr: 'Constitution rapide', en: 'Fast Incorporation', ar: 'تأسيس سريع' },
    description: {
      fr: 'Dépôt et documentation simplifiés pour vous permettre de démarrer rapidement.',
      en: 'Streamlined filing and documentation so you can launch quickly.',
      ar: 'إجراءات وتوثيق مبسّطة لتتمكن من الانطلاق بسرعة.',
    },
  },
  {
    id: 'B-05',
    title: { fr: 'Adresse et agent inclus', en: 'Address & Agent Included', ar: 'العنوان والوكيل مشمولان' },
    description: {
      fr: 'Adresse enregistrée et accompagnement par un agent inclus dans votre constitution.',
      en: 'Registered address and agent support bundled with your incorporation.',
      ar: 'عنوان مسجّل ودعم وكيل مشمولان مع تأسيس شركتك.',
    },
  },
  {
    id: 'B-06',
    title: { fr: 'Mises en relation bancaires', en: 'Banking Introductions', ar: 'تعريفات مصرفية' },
    description: {
      fr: 'Mises en relation avec des partenaires bancaires de confiance pour vous aider à devenir opérationnel.',
      en: 'Connections to trusted banking partners to help you get operational.',
      ar: 'روابط مع شركاء مصرفيين موثوقين لمساعدتك على بدء التشغيل.',
    },
  },
]

const STEPS: { n: string; title: Localized; text: Localized }[] = [
  {
    n: '01',
    title: { fr: 'Choisissez votre forfait', en: 'Choose Your Package', ar: 'اختر باقتك' },
    text: {
      fr: 'Sélectionnez le forfait de zone franche qui correspond à vos objectifs.',
      en: 'Select the free-zone package that matches your goals.',
      ar: 'اختر باقة المنطقة الحرة التي تناسب أهدافك.',
    },
  },
  {
    n: '02',
    title: { fr: 'Soumettez vos documents', en: 'Submit Documents', ar: 'قدّم المستندات' },
    text: {
      fr: 'Fournissez vos informations et votre pièce d’identité — nous vous guidons à chaque étape.',
      en: 'Provide your details and ID — we guide you through every requirement.',
      ar: 'قدّم بياناتك وهويتك — نرشدك خلال كل متطلب.',
    },
  },
  {
    n: '03',
    title: { fr: 'Nous nous occupons de tout', en: 'We File Everything', ar: 'نتولّى كل شيء' },
    text: {
      fr: 'Nous prenons en charge l’enregistrement, l’adresse et la mise en place de l’agent en votre nom.',
      en: 'We handle registration, address and agent setup on your behalf.',
      ar: 'نتولّى التسجيل والعنوان وإعداد الوكيل نيابةً عنك.',
    },
  },
  {
    n: '04',
    title: { fr: 'Commencez à opérer', en: 'Start Trading', ar: 'ابدأ النشاط' },
    text: {
      fr: 'Recevez vos documents et commencez à exploiter votre nouvelle société.',
      en: 'Receive your documents and begin operating your new company.',
      ar: 'استلم مستنداتك وابدأ بتشغيل شركتك الجديدة.',
    },
  },
]

const AUDIENCE: Localized[] = [
  {
    fr: 'Fondateurs et entrepreneurs internationaux',
    en: 'International founders and entrepreneurs',
    ar: 'المؤسسون ورواد الأعمال الدوليون',
  },
  {
    fr: 'Entreprises de e-commerce et du numérique',
    en: 'E-commerce and digital businesses',
    ar: 'شركات التجارة الإلكترونية والرقمية',
  },
  {
    fr: 'Consultants et prestataires de services',
    en: 'Consultants and service providers',
    ar: 'الاستشاريون ومقدمو الخدمات',
  },
  {
    fr: 'Structures de holding et d’investissement',
    en: 'Holding and investment vehicles',
    ar: 'كيانات القابضة والاستثمار',
  },
]

export default function ChadFreeZonePage() {
  const navigate = useNavigate()
  const tr = useTr()

  return (
    <div className="bg-navy">
      {/* Hero */}
      <section className="relative overflow-hidden pt-16">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-grid-pattern bg-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-hero-gradient opacity-80" />
        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="flex max-w-3xl flex-col gap-6 motion-safe:animate-fade-up">
            <Breadcrumb
              items={[
                { label: tr({ fr: 'Accueil', en: 'Home', ar: 'الرئيسية' }), to: '/' },
                { label: tr({ fr: 'Juridictions', en: 'Jurisdictions', ar: 'الاختصاصات القضائية' }) },
                {
                  label: tr({
                    fr: 'Zone Franche Internationale du Tchad',
                    en: 'Chad International Free Zone',
                    ar: 'المنطقة الحرة الدولية في تشاد',
                  }),
                },
              ]}
            />
            <Badge tone="live">
              {tr({ fr: 'Juridiction phare', en: 'Flagship Jurisdiction', ar: 'الاختصاص القضائي الرائد' })}
            </Badge>
            <h1 className="text-display-xl font-bold text-frost">
              {tr({ fr: 'Zone Franche Internationale ', en: 'Chad International ', ar: 'المنطقة الحرة الدولية ' })}
              <span className="text-gradient">
                {tr({ fr: 'du Tchad', en: 'Free Zone', ar: 'في تشاد' })}
              </span>
            </h1>
            <p className="max-w-2xl font-body text-lg leading-relaxed text-frost/65">
              {tr({
                fr: 'Constituez votre société dans une zone franche africaine en pleine croissance, avec une structure fiscale compétitive, une propriété étrangère à 100 % et une création entièrement à distance — gérée de bout en bout par GATE.',
                en: 'Incorporate in a fast-growing African free zone with a competitive tax structure, 100% foreign ownership, and a fully remote setup — managed end to end by GATE.',
                ar: 'أسّس شركتك في منطقة حرة أفريقية سريعة النمو، بهيكل ضريبي تنافسي وملكية أجنبية بنسبة 100٪ وتأسيس عن بُعد بالكامل — تُدار من البداية إلى النهاية بواسطة GATE.',
              })}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="primary" size="lg" onClick={() => navigate('/contact')}>
                {tr({ fr: 'Découvrir la Zone Franche', en: 'Explore the Free Zone', ar: 'اكتشف المنطقة الحرة' })}
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/contact')}>
                {tr({ fr: 'Parler à un conseiller', en: 'Talk to an Advisor', ar: 'تحدث إلى مستشار' })}
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
              value="100%"
              label={tr({ fr: 'Propriété étrangère', en: 'Foreign Ownership', ar: 'ملكية أجنبية' })}
              sublabel={tr({ fr: 'Sans partenaire local', en: 'No Local Partner', ar: 'بدون شريك محلي' })}
            />
            <MetricCard
              value={tr({ fr: 'À distance', en: 'Remote', ar: 'عن بُعد' })}
              label={tr({ fr: 'Constitution', en: 'Incorporation', ar: 'التأسيس' })}
              sublabel={tr({ fr: 'Depuis n’importe où', en: 'From Anywhere', ar: 'من أي مكان' })}
            />
            <MetricCard
              value={tr({ fr: 'Rapide', en: 'Fast', ar: 'سريع' })}
              label={tr({ fr: 'Délai', en: 'Turnaround', ar: 'مدة الإنجاز' })}
              sublabel={tr({ fr: 'Dépôt simplifié', en: 'Streamlined Filing', ar: 'إجراءات مبسّطة' })}
            />
            <MetricCard
              value={tr({ fr: 'Tout compris', en: 'All-In', ar: 'شامل' })}
              label={tr({ fr: 'Adresse et agent', en: 'Address & Agent', ar: 'العنوان والوكيل' })}
              sublabel={tr({ fr: 'Inclus', en: 'Included', ar: 'مشمول' })}
            />
          </div>
        </div>
      </section>

      {/* About */}
      <section className="border-t border-frost/10">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col gap-4">
              <SectionLabel index="01">
                {tr({ fr: 'À propos de la zone franche', en: 'About the free zone', ar: 'حول المنطقة الحرة' })}
              </SectionLabel>
              <h2 className="text-display-md font-semibold text-frost">
                {tr({
                  fr: 'Une passerelle moderne vers les marchés africains et mondiaux.',
                  en: 'A modern gateway to African and global markets.',
                  ar: 'بوابة عصرية نحو الأسواق الأفريقية والعالمية.',
                })}
              </h2>
            </div>
            <div className="flex flex-col gap-4 font-body text-base leading-relaxed text-frost/65">
              <p>
                {tr({
                  fr: 'La Zone Franche Internationale du Tchad offre aux entrepreneurs internationaux un moyen simplifié et économique de créer une entreprise dans un environnement réglementaire et fiscal compétitif.',
                  en: 'The Chad International Free Zone offers international entrepreneurs a streamlined, cost-effective way to establish a company with a competitive regulatory and tax environment.',
                  ar: 'توفّر المنطقة الحرة الدولية في تشاد لرواد الأعمال الدوليين طريقة مبسّطة وفعّالة من حيث التكلفة لتأسيس شركة في بيئة تنظيمية وضريبية تنافسية.',
                })}
              </p>
              <p>
                {tr({
                  fr: 'En tant qu’agent enregistré, GATE gère l’ensemble du processus — de la documentation et du dépôt à votre adresse enregistrée et à la conformité continue — afin que vous puissiez vous installer à distance et vous concentrer sur la croissance de votre entreprise.',
                  en: 'As your registered agent, GATE manages the entire process — from documentation and filing to your registered address and ongoing compliance — so you can set up remotely and focus on growing your business.',
                  ar: 'بصفتنا وكيلك المسجّل، تدير GATE العملية بأكملها — من التوثيق والإيداع إلى عنوانك المسجّل والامتثال المستمر — حتى تتمكن من التأسيس عن بُعد والتركيز على تنمية أعمالك.',
                })}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-t border-frost/10">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="mb-10 flex flex-col gap-3">
            <SectionLabel index="02">
              {tr({ fr: 'Pourquoi vous constituer ici', en: 'Why incorporate here', ar: 'لماذا تؤسّس هنا' })}
            </SectionLabel>
            <h2 className="max-w-2xl text-display-md font-semibold text-frost">
              {tr({ fr: 'Conçue pour les affaires internationales.', en: 'Built for international business.', ar: 'مصمّمة للأعمال الدولية.' })}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-frost/10 bg-frost/10 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b) => (
              <article key={b.id} className="flex flex-col gap-3 bg-navy p-7">
                <span className="font-mono text-xs font-medium tracking-wider text-teal-electric/80">
                  {b.id}
                </span>
                <h3 className="font-display text-lg font-semibold text-frost">{tr(b.title)}</h3>
                <p className="font-body text-sm leading-relaxed text-frost/60">{tr(b.description)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Process + Audience */}
      <section className="border-t border-frost/10">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col gap-6">
              <SectionLabel index="03">{tr({ fr: 'Comment ça marche', en: 'How it works', ar: 'كيف يعمل' })}</SectionLabel>
              <div className="flex flex-col">
                {STEPS.map((step, i) => (
                  <div
                    key={step.n}
                    className={`flex gap-5 py-5 ${i !== 0 ? 'border-t border-frost/10' : ''}`}
                  >
                    <span className="font-mono text-sm text-teal-electric/80">{step.n}</span>
                    <div className="flex flex-col gap-1">
                      <h3 className="font-display text-base font-semibold text-frost">
                        {tr(step.title)}
                      </h3>
                      <p className="font-body text-sm leading-relaxed text-frost/60">{tr(step.text)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <SectionLabel index="04">{tr({ fr: 'À qui ça s’adresse', en: "Who it's for", ar: 'لمن هذا' })}</SectionLabel>
              <ul className="flex flex-col gap-3">
                {AUDIENCE.map((item) => (
                  <li
                    key={item.en}
                    className="flex items-center gap-3 rounded-xl border border-frost/10 bg-steel/20 px-5 py-4"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-electric" />
                    <span className="font-body text-sm text-frost/75">{tr(item)}</span>
                  </li>
                ))}
              </ul>
            </div>
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
                {tr({
                  fr: 'Lancez-vous dans la Zone Franche Internationale du Tchad.',
                  en: 'Launch in the Chad International Free Zone.',
                  ar: 'انطلق في المنطقة الحرة الدولية في تشاد.',
                })}
              </h2>
              <p className="font-body text-base text-frost/60">
                {tr({
                  fr: 'Parlez-nous de votre entreprise et nous tracerons la voie la plus rapide vers la constitution.',
                  en: "Tell us about your business and we'll map out the fastest route to incorporation.",
                  ar: 'أخبرنا عن أعمالك وسنرسم لك أسرع طريق نحو التأسيس.',
                })}
              </p>
              <Button variant="primary" size="lg" onClick={() => navigate('/contact')}>
                {tr({ fr: 'Commencer', en: 'Get Started', ar: 'ابدأ' })}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
