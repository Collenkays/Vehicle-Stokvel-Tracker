import { ReactNode } from 'react'
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import {
  Home,
  Users,
  CreditCard,
  Banknote,
  FileText,
  Settings,
  LogOut,
  Menu,
  ChevronDown,
  Plus,
  Grid3X3,
  UserCog
} from 'lucide-react'
import { useState } from 'react'
import { useUserStokvel } from '../hooks/useUserStokvels'

interface LayoutProps {
  children: ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const params = useParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stokvelDropdownOpen, setStokvelDropdownOpen] = useState(false)

  // Extract stokvelId from the URL path directly as a fallback
  const pathStokvelId = location.pathname.match(/\/stokvel\/([^/]+)/)?.[1]
  const stokvelId = params.stokvelId || pathStokvelId
  const { data: currentStokvel } = useUserStokvel(stokvelId || '')
  
  // Navigation items that adjust based on whether we're in a specific stokvel context
  const getNavigation = () => {
    const baseHref = stokvelId ? `/stokvel/${stokvelId}` : ''

    // Only show stokvel-specific navigation when a stokvel is selected
    if (stokvelId) {
      return [
        { name: 'Dashboard', href: `${baseHref}/dashboard`, icon: Home },
        { name: 'Members', href: `${baseHref}/members`, icon: Users },
        { name: 'Contributions', href: `${baseHref}/contributions`, icon: CreditCard },
        { name: 'Payouts', href: `${baseHref}/payouts`, icon: Banknote },
        { name: 'Reports', href: `${baseHref}/reports`, icon: FileText },
        { name: 'Settings', href: `${baseHref}/settings`, icon: Settings },
      ]
    }

    // When no stokvel is selected, show minimal navigation
    return [
      { name: 'My Stokvels', href: '/my-stokvels', icon: Grid3X3 },
    ]
  }
  
  const navigation = getNavigation()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="text-gray-300 hover:text-white"
            >
              <span className="sr-only">Close sidebar</span>
              ×
            </Button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 px-4">
              {/* Stokvel Selector */}
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setStokvelDropdownOpen(!stokvelDropdownOpen)}
                  className="w-full justify-between mb-4"
                >
                  <div className="flex items-center space-x-2">
                    {currentStokvel ? (
                      <>
                        <span>{currentStokvel.stokvel_type?.icon}</span>
                        <span className="truncate">{currentStokvel.name}</span>
                      </>
                    ) : (
                      <>
                        <Grid3X3 className="h-4 w-4" />
                        <span>Select Stokvel</span>
                      </>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
                
                {stokvelDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          navigate('/my-stokvels')
                          setStokvelDropdownOpen(false)
                          setSidebarOpen(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Grid3X3 className="h-4 w-4 inline mr-2" />
                        All Stokvels
                      </button>
                      <button
                        onClick={() => {
                          navigate('/create-stokvel')
                          setStokvelDropdownOpen(false)
                          setSidebarOpen(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Plus className="h-4 w-4 inline mr-2" />
                        Create New Stokvel
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center">
                <h1 className="text-lg font-semibold text-gray-900">
                  {currentStokvel ? currentStokvel.name : 'My Stokvels'}
                </h1>
              </div>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="mr-4 h-6 w-6" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex flex-col border-t border-gray-200 p-4 space-y-2">
            <div className="text-base font-medium text-gray-800">
              {user?.email}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigate('/account-settings')
                setSidebarOpen(false)
              }}
              className="justify-start text-gray-500 hover:text-gray-700"
            >
              <UserCog className="mr-2 h-4 w-4" />
              Account Settings
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="justify-start text-gray-500 hover:text-gray-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 px-4">
              {/* Stokvel Selector */}
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setStokvelDropdownOpen(!stokvelDropdownOpen)}
                  className="w-full justify-between mb-4"
                >
                  <div className="flex items-center space-x-2">
                    {currentStokvel ? (
                      <>
                        <span>{currentStokvel.stokvel_type?.icon}</span>
                        <span className="truncate">{currentStokvel.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {currentStokvel.stokvel_type?.name}
                        </Badge>
                      </>
                    ) : (
                      <>
                        <Grid3X3 className="h-4 w-4" />
                        <span>Select Stokvel</span>
                      </>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
                
                {stokvelDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          navigate('/my-stokvels')
                          setStokvelDropdownOpen(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Grid3X3 className="h-4 w-4 inline mr-2" />
                        All Stokvels
                      </button>
                      <button
                        onClick={() => {
                          navigate('/create-stokvel')
                          setStokvelDropdownOpen(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Plus className="h-4 w-4 inline mr-2" />
                        Create New Stokvel
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center">
                <h1 className="text-lg font-semibold text-gray-900">
                  {currentStokvel ? currentStokvel.name : 'My Stokvels'}
                </h1>
              </div>
            </div>
            <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="mr-3 h-6 w-6" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex flex-col border-t border-gray-200 p-4 space-y-2">
            <div className="text-sm font-medium text-gray-700">
              {user?.email}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/account-settings')}
              className="justify-start text-gray-500 hover:text-gray-700 p-0 h-auto"
            >
              <UserCog className="mr-2 h-4 w-4" />
              Account Settings
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="justify-start text-gray-500 hover:text-gray-700 p-0 h-auto"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <div className="lg:hidden">
          <div className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-lg font-semibold">{currentStokvel ? currentStokvel.name : 'My Stokvels'}</h1>
            <div></div>
          </div>
        </div>
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}