import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle, Loader2, UserPlus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useValidateInvitation, useAcceptInvitation } from '../hooks/useInvitations'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert'
import { Badge } from '../components/ui/badge'

export const AcceptInvitation = () => {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  const [acceptanceStatus, setAcceptanceStatus] = useState<'idle' | 'accepting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data: invitation, isLoading: validating, error: validationError } = useValidateInvitation(token)
  const acceptInvitation = useAcceptInvitation()

  // Automatically accept invitation when user is authenticated and invitation is valid
  useEffect(() => {
    if (!authLoading && user && invitation && invitation.is_valid && acceptanceStatus === 'idle') {
      handleAcceptInvitation()
    }
  }, [authLoading, user, invitation, acceptanceStatus])

  const handleAcceptInvitation = async () => {
    if (!user || !token || !invitation) return

    setAcceptanceStatus('accepting')
    setErrorMessage(null)

    try {
      const result = await acceptInvitation.mutateAsync({
        token,
        userEmail: user.email!,
        userPhone: user.user_metadata?.phone || user.user_metadata?.contact_number,
      })

      if (result.success) {
        setAcceptanceStatus('success')
        // Redirect to the stokvel dashboard after 3 seconds
        setTimeout(() => {
          navigate(`/stokvel/${result.stokvel_id}/dashboard`)
        }, 3000)
      } else {
        setAcceptanceStatus('error')
        setErrorMessage(result.error || 'Failed to accept invitation')
      }
    } catch (error: any) {
      setAcceptanceStatus('error')
      setErrorMessage(error.message || 'An unexpected error occurred')
    }
  }

  // Loading state while checking authentication
  if (authLoading || validating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-gray-600">Validating invitation...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Invalid or expired invitation
  if (validationError || !invitation || !invitation.is_valid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-6 w-6" />
              <CardTitle>Invalid Invitation</CardTitle>
            </div>
            <CardDescription>
              This invitation link is invalid, expired, or has already been used.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Unable to Process Invitation</AlertTitle>
              <AlertDescription>
                The invitation link may have expired (valid for 7 days) or been used already.
                Please contact the stokvel admin for a new invitation.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col gap-2">
              <Button onClick={() => navigate('/my-stokvels')} className="w-full">
                View My Stokvels
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/login')}
                className="w-full"
              >
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // User not logged in - prompt to login/register
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserPlus className="h-6 w-6 text-primary" />
              <CardTitle>Stokvel Invitation</CardTitle>
            </div>
            <CardDescription>
              You've been invited to join a stokvel!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Valid Invitation</AlertTitle>
              <AlertDescription>
                <strong>{invitation.full_name}</strong>, you've been invited to join{' '}
                <strong>{invitation.stokvel_name}</strong> as a {invitation.role}.
              </AlertDescription>
            </Alert>

            <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Stokvel:</span>
                <span className="font-medium">{invitation.stokvel_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Your Name:</span>
                <span className="font-medium">{invitation.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium text-xs">{invitation.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Role:</span>
                <Badge variant={invitation.role === 'admin' ? 'default' : 'secondary'}>
                  {invitation.role}
                </Badge>
              </div>
              {invitation.rotation_order && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Rotation Order:</span>
                  <span className="font-medium">#{invitation.rotation_order}</span>
                </div>
              )}
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-sm">
                <strong>Important:</strong> You must log in or register with the email{' '}
                <strong>{invitation.email}</strong> to accept this invitation.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col gap-2">
              <Button
                onClick={() => navigate(`/login?redirect=/invite/${token}`)}
                className="w-full"
              >
                Log In to Accept
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/login?redirect=/invite/${token}`)}
                className="w-full"
              >
                Register New Account
              </Button>
            </div>

            <p className="text-xs text-center text-gray-500">
              Expires: {new Date(invitation.expires_at).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // User is logged in - show acceptance status
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        {acceptanceStatus === 'accepting' && (
          <>
            <CardContent className="flex flex-col items-center justify-center p-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-gray-600">Accepting invitation...</p>
            </CardContent>
          </>
        )}

        {acceptanceStatus === 'success' && (
          <>
            <CardHeader>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-6 w-6" />
                <CardTitle>Invitation Accepted!</CardTitle>
              </div>
              <CardDescription>
                You've successfully joined {invitation.stokvel_name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Welcome!</AlertTitle>
                <AlertDescription className="text-green-700">
                  You are now a {invitation.role} of {invitation.stokvel_name}.
                  Redirecting to your stokvel dashboard...
                </AlertDescription>
              </Alert>

              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            </CardContent>
          </>
        )}

        {acceptanceStatus === 'error' && (
          <>
            <CardHeader>
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-6 w-6" />
                <CardTitle>Error Accepting Invitation</CardTitle>
              </div>
              <CardDescription>
                Unable to accept the invitation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {errorMessage || 'An unexpected error occurred while accepting the invitation.'}
                </AlertDescription>
              </Alert>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                <p className="text-gray-700">
                  <strong>Common issues:</strong>
                </p>
                <ul className="list-disc list-inside text-xs space-y-1 text-gray-600">
                  <li>Your email doesn't match the invitation</li>
                  <li>You're already a member of this stokvel</li>
                  <li>The invitation has expired or been revoked</li>
                </ul>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => {
                    setAcceptanceStatus('idle')
                    setErrorMessage(null)
                    handleAcceptInvitation()
                  }}
                  className="w-full"
                >
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/my-stokvels')}
                  className="w-full"
                >
                  View My Stokvels
                </Button>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}
