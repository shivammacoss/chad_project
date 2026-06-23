import { HeroSection } from '@/components/sections/HeroSection'
import { TrustedBySection } from '@/components/sections/TrustedBySection'
import { MetricsSection } from '@/components/sections/MetricsSection'
import { ServicesSection } from '@/components/sections/ServicesSection'
import { JurisdictionsSection } from '@/components/sections/JurisdictionsSection'
import { JoinBandSection } from '@/components/sections/JoinBandSection'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'
import { NewsletterSection } from '@/components/sections/NewsletterSection'

/** Landing page — rendr-style section flow with GRIDGLOBAL GATE content. */
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustedBySection />
      <MetricsSection />
      <ServicesSection />
      <JurisdictionsSection />
      <JoinBandSection />
      <TestimonialsSection />
      <NewsletterSection />
    </>
  )
}
