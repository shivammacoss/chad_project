import { Navbar } from '@/components/Navbar'
import { Hero } from '@/components/Hero'
import { TrustedBy } from '@/components/TrustedBy'
import { Services } from '@/components/Services'
import { Team } from '@/components/Team'
import { JoinTeam } from '@/components/JoinTeam'
import { Testimonials } from '@/components/Testimonials'
import { Newsletter } from '@/components/Newsletter'
import { Footer } from '@/components/Footer'
import { BackToTop } from '@/components/BackToTop'

/** Stellr — single-page creative studio landing. */
export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <TrustedBy />
        <Services />
        <Team />
        <JoinTeam />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
      <BackToTop />
    </div>
  )
}
