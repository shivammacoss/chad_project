import { Routes, Route } from 'react-router-dom'
import MainLayout from '@/components/layout/MainLayout'
import HomePage from '@/pages/HomePage'
import DashboardPage from '@/pages/DashboardPage'
import ApplicationWizardPage from '@/pages/ApplicationWizardPage'
import ApplicationDetailPage from '@/pages/ApplicationDetailPage'
import StartServicePage from '@/pages/StartServicePage'
import GenericServiceWizardPage from '@/pages/GenericServiceWizardPage'
import NotFoundPage from '@/pages/NotFoundPage'
import ServicePage from '@/pages/ServicePage'
import CategoryPage from '@/pages/CategoryPage'
import ContactPage from '@/pages/ContactPage'
import InsightsPage from '@/pages/InsightsPage'
import AffiliatePage from '@/pages/AffiliatePage'
import ChadFreeZonePage from '@/pages/ChadFreeZonePage'
import LoginPage from '@/pages/LoginPage'
import GetStartedPage from '@/pages/GetStartedPage'
import VerifyEmailPage from '@/pages/VerifyEmailPage'
import InvoicesPage from '@/pages/InvoicesPage'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import AdminRoute from '@/components/auth/AdminRoute'
import StaffRoute from '@/components/auth/StaffRoute'
import AdminLoginPage from '@/pages/AdminLoginPage'
import AdminPage from '@/pages/AdminPage'
import StaffPage from '@/pages/StaffPage'
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
          <Route path="/applications/new" element={<ApplicationWizardPage />} />
          <Route path="/applications/:id" element={<ApplicationDetailPage />} />
          <Route path="/services/new" element={<StartServicePage />} />
          <Route path="/services/:id" element={<GenericServiceWizardPage />} />
          <Route path="/invoices" element={<InvoicesPage />} />
        </Route>
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
        <Route element={<StaffRoute />}>
          <Route path="/staff" element={<StaffPage />} />
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
        <Route path="/get-started" element={<GetStartedPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
