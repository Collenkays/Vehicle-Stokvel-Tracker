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
import { InstallPrompt } from './components/InstallPrompt'
import { HelpSystem } from './components/HelpSystem'

function App() {
  return (
    <AuthProvider>
      <Analytics />
      <InstallPrompt />
      <HelpSystem />
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Public invitation route (no authentication required) */}
        <Route path="/invite/:token" element={<AcceptInvitation />} />

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
        
        {/* Legacy single-stokvel routes (with layout) */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/my-stokvels" element={<MyStokvels />} />
                  <Route path="/members" element={<Members />} />
                  <Route path="/contributions" element={<Contributions />} />
                  <Route path="/payouts" element={<Payouts />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/settings" element={<Settings />} />
                  
                  {/* Stokvel-specific routes */}
                  <Route path="/stokvel/:stokvelId/dashboard" element={<Dashboard />} />
                  <Route path="/stokvel/:stokvelId/members" element={<Members />} />
                  <Route path="/stokvel/:stokvelId/contributions" element={<Contributions />} />
                  <Route path="/stokvel/:stokvelId/payouts" element={<Payouts />} />
                  <Route path="/stokvel/:stokvelId/reports" element={<Reports />} />
                  <Route path="/stokvel/:stokvelId/settings" element={<Settings />} />
                  <Route path="/stokvel/:stokvelId/fairness" element={<FairnessDashboard />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  )
}

export default App