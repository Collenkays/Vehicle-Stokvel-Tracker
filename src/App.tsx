import { Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { AuthProvider } from './contexts/AuthContext'
import { Layout } from './components/Layout'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Members } from './pages/Members'
import { Contributions } from './pages/Contributions'
import { Payouts } from './pages/Payouts'
import { Reports } from './pages/Reports'
import { Settings } from './pages/Settings'
import { GlobalSettings } from './pages/GlobalSettings'
import { MyStokvels } from './pages/MyStokvels'
import { StokvelTypeCatalog } from './pages/StokvelTypeCatalog'
import { CreateStokvelWizard } from './components/CreateStokvelWizard'
import FairnessDashboard from './pages/FairnessDashboard'
import { FAQ } from './pages/FAQ'
import { UserGuide } from './pages/UserGuide'
import { AcceptInvitation } from './pages/AcceptInvitation'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PublicRoute } from './components/PublicRoute'
import { InstallPrompt } from './components/InstallPrompt'
import { HelpSystem } from './components/HelpSystem'
import { LandingPage } from './pages/LandingPage'
import { Features } from './pages/Features'
import { Pricing } from './pages/Pricing'
import { About } from './pages/About'
import { Contact } from './pages/Contact'
import { AuthDebug } from './pages/AuthDebug'
import { Blog } from './pages/Blog'
import { BlogPost } from './pages/BlogPost'

function App() {
  return (
    <AuthProvider>
      <Analytics />
      <InstallPrompt />
      <HelpSystem />
      <Routes>
        {/* Public marketing routes */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          }
        />
        <Route
          path="/features"
          element={
            <PublicRoute redirectIfAuthenticated={false}>
              <Features />
            </PublicRoute>
          }
        />
        <Route
          path="/pricing"
          element={
            <PublicRoute redirectIfAuthenticated={false}>
              <Pricing />
            </PublicRoute>
          }
        />
        <Route
          path="/about"
          element={
            <PublicRoute redirectIfAuthenticated={false}>
              <About />
            </PublicRoute>
          }
        />
        <Route
          path="/contact"
          element={
            <PublicRoute redirectIfAuthenticated={false}>
              <Contact />
            </PublicRoute>
          }
        />
        <Route
          path="/blog"
          element={
            <PublicRoute redirectIfAuthenticated={false}>
              <Blog />
            </PublicRoute>
          }
        />
        <Route
          path="/blog/:slug"
          element={
            <PublicRoute redirectIfAuthenticated={false}>
              <BlogPost />
            </PublicRoute>
          }
        />

        {/* Public auth routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route path="/invite/:token" element={<AcceptInvitation />} />

        {/* Debug route - remove in production */}
        <Route path="/auth-debug" element={<AuthDebug />} />

        {/* Multi-stokvel routes (full-screen, no layout) */}
        <Route
          path="/browse-stokvel-types"
          element={
            <ProtectedRoute>
              <StokvelTypeCatalog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-stokvel"
          element={
            <ProtectedRoute>
              <CreateStokvelWizard />
            </ProtectedRoute>
          }
        />

        {/* Global account settings (full-screen, no layout) */}
        <Route
          path="/account-settings"
          element={
            <ProtectedRoute>
              <GlobalSettings />
            </ProtectedRoute>
          }
        />

        {/* FAQ page (full-screen, no layout) */}
        <Route
          path="/faq"
          element={
            <ProtectedRoute>
              <FAQ />
            </ProtectedRoute>
          }
        />

        {/* User Guide page (full-screen, no layout) */}
        <Route
          path="/user-guide"
          element={
            <ProtectedRoute>
              <UserGuide />
            </ProtectedRoute>
          }
        />

        {/* Protected routes with layout */}
        <Route
          path="/my-stokvels/*"
          element={
            <ProtectedRoute>
              <Layout>
                <MyStokvels />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/stokvel/:stokvelId/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/stokvel/:stokvelId/members"
          element={
            <ProtectedRoute>
              <Layout>
                <Members />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/stokvel/:stokvelId/contributions"
          element={
            <ProtectedRoute>
              <Layout>
                <Contributions />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/stokvel/:stokvelId/payouts"
          element={
            <ProtectedRoute>
              <Layout>
                <Payouts />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/stokvel/:stokvelId/reports"
          element={
            <ProtectedRoute>
              <Layout>
                <Reports />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/stokvel/:stokvelId/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/stokvel/:stokvelId/fairness"
          element={
            <ProtectedRoute>
              <Layout>
                <FairnessDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  )
}

export default App