import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface PublicRouteProps {
  children: React.ReactNode
  redirectIfAuthenticated?: boolean
}

/**
 * PublicRoute component - Allows unauthenticated users to access public pages
 * If redirectIfAuthenticated is true (default), authenticated users are redirected to dashboard
 */
export const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  redirectIfAuthenticated = true
}) => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  // Debug logging - remove in production
  console.log('PublicRoute:', {
    user: user ? 'authenticated' : 'not authenticated',
    loading,
    redirectIfAuthenticated,
    path: window.location.pathname
  })

  useEffect(() => {
    if (!loading && user && redirectIfAuthenticated) {
      // Redirect authenticated users to dashboard
      console.log('PublicRoute: Redirecting authenticated user to /my-stokvels')
      navigate('/my-stokvels')
    }
  }, [user, loading, navigate, redirectIfAuthenticated])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If redirectIfAuthenticated is false, allow both authenticated and unauthenticated users
  // If redirectIfAuthenticated is true, only render for unauthenticated users
  if (redirectIfAuthenticated && user) {
    console.log('PublicRoute: User is authenticated, returning null')
    return null
  }

  console.log('PublicRoute: Rendering children')
  return <>{children}</>
}
