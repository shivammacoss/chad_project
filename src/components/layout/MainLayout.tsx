import { Outlet } from 'react-router-dom'
import { TopBar } from '@/components/layout/TopBar'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ScrollToTop } from '@/components/common/ScrollToTop'

/**
 * Top-level chrome shared by all routed pages:
 * fixed TopBar + Navbar, routed page content, and the brand Footer.
 *
 * The fixed header stack is 12 (TopBar) + 16 (Navbar) tall. Each page already
 * adds `pt-16` to clear the navbar, so `main` adds `pt-12` for the TopBar.
 */
export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-navy">
      <ScrollToTop />
      <TopBar />
      <Navbar />
      <main className="flex-1 pt-12">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
