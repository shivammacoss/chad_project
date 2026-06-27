import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { GridCanvas } from '@/components/common/GridCanvas'
import { useTr } from '@/lib/i18n'

/** 404 — "Off the Grid". */
export default function NotFoundPage() {
  const navigate = useNavigate()
  const tr = useTr()

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 pt-16">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-grid-pattern bg-grid [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,black,transparent)]"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-hero-gradient opacity-60" />
      <GridCanvas className="opacity-40" />

      <div className="relative flex max-w-xl flex-col items-center gap-6 text-center">
        <Badge tone="warning">{tr({ fr: 'Signal perdu', en: 'Signal lost', ar: 'فقدان الإشارة' })}</Badge>

        <p className="font-mono text-7xl font-medium text-frost sm:text-8xl">404</p>

        <h1 className="text-display-md font-semibold text-frost">
          {tr({ fr: 'Vous êtes ', en: "You're ", ar: 'أنت ' })}
          <span className="text-gradient">
            {tr({ fr: 'hors du réseau.', en: 'off the grid.', ar: 'خارج الشبكة.' })}
          </span>
        </h1>

        <p className="max-w-md font-body text-base leading-relaxed text-frost/60">
          {tr({
            fr: "Ce nœud n'est pas sur le réseau. La page a peut-être été désactivée, redirigée, ou n'a jamais existé.",
            en: "This node isn't on the network. The page may have been decommissioned, rerouted, or never existed in the first place.",
            ar: 'هذه العقدة ليست على الشبكة. ربما تم إيقاف الصفحة أو إعادة توجيهها أو أنها لم توجد من الأساس.',
          })}
        </p>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Button variant="primary" size="lg" onClick={() => navigate('/')}>
            {tr({ fr: 'Retour à GATE', en: 'Back to Gate', ar: 'العودة إلى GATE' })}
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/dashboard')}>
            {tr({ fr: 'Ouvrir la console', en: 'Open Console', ar: 'فتح وحدة التحكم' })}
          </Button>
        </div>
      </div>
    </section>
  )
}
