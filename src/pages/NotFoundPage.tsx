import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { GridCanvas } from '@/components/common/GridCanvas'

/** 404 — "Off the Grid". */
export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 pt-16">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-grid-pattern bg-grid [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,black,transparent)]"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-hero-gradient opacity-60" />
      <GridCanvas className="opacity-40" />

      <div className="relative flex max-w-xl flex-col items-center gap-6 text-center">
        <Badge tone="warning">Signal lost</Badge>

        <p className="font-mono text-7xl font-medium text-frost sm:text-8xl">404</p>

        <h1 className="text-display-md font-semibold text-frost">
          You&apos;re <span className="text-gradient">off the grid.</span>
        </h1>

        <p className="max-w-md font-body text-base leading-relaxed text-frost/60">
          This node isn&apos;t on the network. The page may have been decommissioned, rerouted, or
          never existed in the first place.
        </p>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Button variant="primary" size="lg" onClick={() => navigate('/')}>
            Back to Gate
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/dashboard')}>
            Open Console
          </Button>
        </div>
      </div>
    </section>
  )
}
