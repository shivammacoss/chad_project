import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { SectionLabel } from '@/components/common/SectionLabel'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import type { MenuCategory } from '@/content/menu'
import { useTr } from '@/lib/i18n'

/** Overview page for a menu category — lists its service sub-pages as cards. */
export default function CategoryPage({ category }: { category: MenuCategory }) {
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
                { label: tr(category.label) },
              ]}
            />
            <SectionLabel>{tr({ fr: 'Services', en: 'Services', ar: 'الخدمات' })}</SectionLabel>
            <h1 className="text-display-lg font-bold text-frost">{tr(category.label)}</h1>
            <p className="max-w-2xl font-body text-lg leading-relaxed text-frost/65">
              {tr(category.blurb)}
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-frost/10">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-frost/10 bg-frost/10 sm:grid-cols-2 lg:grid-cols-3">
            {category.pages.map((page, i) => (
              <Link
                key={page.id}
                to={page.path}
                className="group flex flex-col gap-3 bg-navy p-7 transition-colors duration-300 hover:bg-steel/60"
              >
                <span className="font-mono text-xs font-medium tracking-wider text-teal-electric/80">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h2 className="font-display text-lg font-semibold text-frost">{tr(page.menuLabel)}</h2>
                <p className="font-body text-sm leading-relaxed text-frost/60">{tr(page.intro)}</p>
                <span className="mt-1 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-teal-electric opacity-0 transition-opacity group-hover:opacity-100">
                  {tr({ fr: 'En savoir plus', en: 'Learn more', ar: 'اعرف المزيد' })}
                  <span aria-hidden="true">→</span>
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-10">
            <Button variant="outline" size="lg" onClick={() => navigate('/contact')}>
              {tr({
                fr: 'Vous ne savez pas quoi choisir ? Parlons-en',
                en: 'Not sure which fits? Talk to us',
                ar: 'لست متأكدًا من الخيار المناسب؟ تحدث إلينا',
              })}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
