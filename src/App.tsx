import { Routes, Route } from 'react-router-dom'
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
import { ProtectedRoute } from './components/ProtectedRoute'
import { InstallPrompt } from './components/InstallPrompt'

function App() {
  return (
    <AuthProvider>
      <InstallPrompt />
      <Routes>
        <Route path="/login" element={<Login />} />
        
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