import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SectionLabel } from '@/components/common/SectionLabel'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { cn } from '@/lib/utils'
import { useTr, type Localized } from '@/lib/i18n'

interface Post {
  title: Localized
  excerpt: Localized
  category: string
  readTime: string
  date: string
}

const CATEGORIES = ['All', 'Formation', 'Compliance', 'Banking', 'Back Office']

/** Display labels for the (untranslated) category keys used in filtering. */
const CATEGORY_LABELS: Record<string, Localized> = {
  All: { fr: 'Tout', en: 'All', ar: 'الكل' },
  Formation: { fr: 'Création', en: 'Formation', ar: 'التأسيس' },
  Compliance: { fr: 'Conformité', en: 'Compliance', ar: 'الامتثال' },
  Banking: { fr: 'Banque', en: 'Banking', ar: 'الخدمات المصرفية' },
  'Back Office': { fr: 'Back-office', en: 'Back Office', ar: 'الإدارة الخلفية' },
}

const POSTS: Post[] = [
  {
    title: {
      fr: 'Comment les non-résidents peuvent enregistrer une entreprise au Tchad',
      en: 'How non-residents can register a company in Chad',
      ar: 'كيف يمكن لغير المقيمين تسجيل شركة في تشاد',
    },
    excerpt: {
      fr: 'Un guide étape par étape pour se constituer au Tchad depuis l’étranger — documents, adresses et délais.',
      en: 'A step-by-step guide to incorporating in Chad from abroad — documents, addresses and timelines.',
      ar: 'دليل خطوة بخطوة للتأسيس في تشاد من الخارج — المستندات والعناوين والمواعيد الزمنية.',
    },
    category: 'Formation',
    readTime: '6 min',
    date: 'Jun 2026',
  },
  {
    title: {
      fr: 'Déclarations annuelles de conformité : ce qu’elles sont et pourquoi elles comptent',
      en: 'Annual compliance filings: what they are and why they matter',
      ar: 'الإقرارات السنوية للامتثال: ما هي ولماذا تهمّ',
    },
    excerpt: {
      fr: 'Restez en règle auprès du registre des sociétés du Tchad en comprenant vos déclarations annuelles.',
      en: 'Stay in good standing with the Chad company registry by understanding your annual filings.',
      ar: 'حافظ على وضعك القانوني لدى سجل الشركات في تشاد من خلال فهم إقراراتك السنوية.',
    },
    category: 'Compliance',
    readTime: '4 min',
    date: 'May 2026',
  },
  {
    title: {
      fr: 'Zone Franche Internationale du Tchad : est-elle adaptée à votre entreprise ?',
      en: 'Chad International Free Zone: is it right for your business?',
      ar: 'المنطقة الحرة الدولية في تشاد: هل هي مناسبة لأعمالك؟',
    },
    excerpt: {
      fr: 'Quand une société de zone franche a-t-elle du sens par rapport à une société tchadienne classique — et comment décider.',
      en: 'When a free-zone company makes sense versus a standard Chad company — and how to decide.',
      ar: 'متى تكون شركة المنطقة الحرة منطقية مقارنة بالشركة التشادية العادية — وكيف تقرر.',
    },
    category: 'Formation',
    readTime: '5 min',
    date: 'May 2026',
  },
  {
    title: {
      fr: 'Ouvrir un compte bancaire professionnel en tant que nouvelle société',
      en: 'Opening a business bank account as a new company',
      ar: 'فتح حساب مصرفي تجاري كشركة جديدة',
    },
    excerpt: {
      fr: 'Ce que recherchent les banques, et comment des recommandations fiables peuvent accélérer l’approbation.',
      en: 'What banks look for, and how trusted referrals can speed up approval.',
      ar: 'ما الذي تبحث عنه البنوك، وكيف يمكن للإحالات الموثوقة تسريع الموافقة.',
    },
    category: 'Banking',
    readTime: '7 min',
    date: 'Apr 2026',
  },
  {
    title: {
      fr: 'Externaliser la saisie de données sans perdre en qualité',
      en: 'Outsourcing data entry without losing quality',
      ar: 'الاستعانة بمصادر خارجية لإدخال البيانات دون فقدان الجودة',
    },
    excerpt: {
      fr: 'Comment la validation et le contrôle qualité maintiennent une grande précision lorsque vous développez votre back-office.',
      en: 'How validation and QA keep accuracy high when you scale your back office.',
      ar: 'كيف يحافظ التحقق وضمان الجودة على دقة عالية عند توسيع إدارتك الخلفية.',
    },
    category: 'Back Office',
    readTime: '5 min',
    date: 'Apr 2026',
  },
  {
    title: {
      fr: 'Préserver la confidentialité de votre adresse personnelle en tant que dirigeant',
      en: 'Keeping your home address private as a director',
      ar: 'الحفاظ على خصوصية عنوان منزلك بصفتك مديرًا',
    },
    excerpt: {
      fr: 'Pourquoi une adresse professionnelle de dirigeant protège votre vie privée dans les registres publics.',
      en: "Why a director's service address protects your privacy on the public record.",
      ar: 'لماذا يحمي عنوان الخدمة الخاص بالمدير خصوصيتك في السجلات العامة.',
    },
    category: 'Compliance',
    readTime: '4 min',
    date: 'Mar 2026',
  },
]

export default function InsightsPage() {
  const tr = useTr()
  const [active, setActive] = useState('All')
  const visible = active === 'All' ? POSTS : POSTS.filter((p) => p.category === active)
  const [featured, ...rest] = visible

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
                { label: tr({ fr: 'Analyses', en: 'Insights', ar: 'رؤى' }) },
              ]}
            />
            <SectionLabel>{tr({ fr: 'Dernières analyses', en: 'Latest Insights', ar: 'أحدث الرؤى' })}</SectionLabel>
            <h1 className="text-display-lg font-bold text-frost">
              {tr({ fr: 'Guides et analyses d’experts', en: 'Expert Guides & Insights', ar: 'أدلة ورؤى الخبراء' })}
            </h1>
            <p className="max-w-2xl font-body text-lg leading-relaxed text-frost/65">
              {tr({
                fr: 'Des conseils pratiques sur la création d’entreprise, la conformité et l’entrepreneuriat.',
                en: 'Practical guidance on business formation, compliance, and entrepreneurship.',
                ar: 'إرشادات عملية حول تأسيس الأعمال والامتثال وريادة الأعمال.',
              })}
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-frost/10">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
          {/* Category filter */}
          <div className="mb-10 flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActive(cat)}
                className={cn(
                  'rounded-full border px-4 py-2 font-body text-sm transition-colors',
                  active === cat
                    ? 'border-teal-electric/50 bg-teal-electric/10 text-teal-electric'
                    : 'border-frost/15 text-frost/60 hover:border-frost/30 hover:text-frost',
                )}
              >
                {tr(CATEGORY_LABELS[cat])}
              </button>
            ))}
          </div>

          {featured && (
            <article className="group mb-6 overflow-hidden rounded-3xl border border-frost/10 bg-steel/30 transition-colors hover:bg-steel/50">
              <div className="grid gap-6 p-7 sm:p-10 lg:grid-cols-2 lg:items-center">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <Badge tone="live" withDot={false}>
                      {tr({ fr: 'À la une', en: 'Featured', ar: 'مميّز' })}
                    </Badge>
                    <span className="font-mono text-xs uppercase tracking-wider text-frost/40">
                      {tr(CATEGORY_LABELS[featured.category])} · {featured.readTime}
                    </span>
                  </div>
                  <h2 className="text-display-md font-semibold text-frost">{tr(featured.title)}</h2>
                  <p className="font-body text-base leading-relaxed text-frost/60">
                    {tr(featured.excerpt)}
                  </p>
                  <span className="font-mono text-xs text-frost/40">{featured.date}</span>
                </div>
                <div className="hidden h-full min-h-[12rem] items-center justify-center rounded-2xl bg-grid-pattern bg-grid lg:flex">
                  <span className="font-display text-6xl font-bold text-frost/10">GG</span>
                </div>
              </div>
            </article>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <article
                key={post.title.en}
                className="group flex flex-col gap-3 rounded-2xl border border-frost/10 bg-steel/20 p-6 transition-colors hover:bg-steel/50"
              >
                <span className="font-mono text-xs uppercase tracking-wider text-teal-electric/80">
                  {tr(CATEGORY_LABELS[post.category])} · {post.readTime}
                </span>
                <h3 className="font-display text-lg font-semibold text-frost">{tr(post.title)}</h3>
                <p className="font-body text-sm leading-relaxed text-frost/60">{tr(post.excerpt)}</p>
                <span className="mt-auto font-mono text-xs text-frost/40">{post.date}</span>
              </article>
            ))}
          </div>

          {visible.length === 0 && (
            <p className="font-body text-sm text-frost/50">
              {tr({ fr: 'Aucun article dans cette catégorie pour le moment.', en: 'No articles in this category yet.', ar: 'لا توجد مقالات في هذه الفئة بعد.' })}
            </p>
          )}
        </div>
      </section>

      {/* Newsletter signup */}
      <section className="border-t border-frost/10">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="flex flex-col items-center gap-5 text-center">
            <SectionLabel>{tr({ fr: 'Restez informé', en: 'Stay in the loop', ar: 'ابقَ على اطّلاع' })}</SectionLabel>
            <h2 className="max-w-xl text-display-md font-semibold text-frost">
              {tr({ fr: 'Recevez les nouveaux guides dans votre boîte mail.', en: 'Get new guides in your inbox.', ar: 'احصل على الأدلة الجديدة في بريدك الوارد.' })}
            </h2>
            <NewsletterInline />
          </div>
        </div>
      </section>
    </div>
  )
}

function NewsletterInline() {
  const tr = useTr()
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (email.trim()) setDone(true)
      }}
      className="flex w-full max-w-md flex-col items-center gap-3 sm:flex-row"
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
        className="h-12 w-full flex-1 rounded-lg border border-frost/15 bg-steel/30 px-4 font-body text-sm text-frost outline-none transition-colors placeholder:text-frost/35 focus:border-teal-electric/50"
      />
      <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto">
        {done
          ? tr({ fr: 'Inscrit ✓', en: 'Subscribed ✓', ar: 'تم الاشتراك ✓' })
          : tr({ fr: 'S’abonner', en: 'Subscribe', ar: 'اشترك' })}
      </Button>
    </form>
  )
}
