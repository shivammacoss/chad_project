import { HeroSection } from '@/components/sections/HeroSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { JurisdictionsSection } from '@/components/sections/JurisdictionsSection'
import { MetricsSection } from '@/components/sections/MetricsSection'
import { GrowTogetherSection } from '@/components/sections/GrowTogetherSection'
import { TrustedBySection } from '@/components/sections/TrustedBySection'
import { ServicesSection } from '@/components/sections/ServicesSection'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'
import { ShowcaseSection } from '@/components/sections/ShowcaseSection'
import { CTASection } from '@/components/sections/CTASection'
import { NewsletterSection } from '@/components/sections/NewsletterSection'

/** Landing page — business-support flow, localised to Chad. */
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <JurisdictionsSection />
      <MetricsSection />
      <GrowTogetherSection />
      <TrustedBySection />
      <ServicesSection />
      <TestimonialsSection />
      <ShowcaseSection />
      <CTASection />
      <NewsletterSection />
    </>
  )
}
