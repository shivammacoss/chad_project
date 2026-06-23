import { Routes, Route } from 'react-router-dom'
import MainLayout from '@/components/layout/MainLayout'
import HomePage from '@/pages/HomePage'
import DashboardPage from '@/pages/DashboardPage'
import NotFoundPage from '@/pages/NotFoundPage'
import ServicePage from '@/pages/ServicePage'
import CategoryPage from '@/pages/CategoryPage'
import ContactPage from '@/pages/ContactPage'
import InsightsPage from '@/pages/InsightsPage'
import AffiliatePage from '@/pages/AffiliatePage'
import ChadFreeZonePage from '@/pages/ChadFreeZonePage'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import VerifyEmailPage from '@/pages/VerifyEmailPage'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { SERVICE_CATEGORIES } from '@/content/menu'

/**
 * Application route table.
 *
 * Service routes (category overviews + sub-pages) are generated from the
 * MENU content model; bespoke pages are declared explicitly. Everything
 * renders inside MainLayout (Navbar + Footer chrome).
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
        <Route path="/contact" element={<ContactPage />} />

        {/* Generated category overviews + service sub-pages */}
        {SERVICE_CATEGORIES.map((category) => (
          <Route key={category.id}>
            {category.overviewPath && (
              <Route
                path={category.overviewPath}
                element={<CategoryPage category={category} />}
              />
            )}
            {category.pages.map((page) => (
              <Route
                key={page.id}
                path={page.path}
                element={<ServicePage page={page} category={category} />}
              />
            ))}
          </Route>
        ))}

        {/* Top-level bespoke pages */}
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/affiliate" element={<AffiliatePage />} />
        <Route path="/chad-free-zone" element={<ChadFreeZonePage />} />

        {/* Auth pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
