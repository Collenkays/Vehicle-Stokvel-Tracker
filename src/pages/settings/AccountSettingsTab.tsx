import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useUpdateUserProfile, useUpdateUserPreferences } from '@/hooks/useUserPreferences'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Mail, Phone, Lock, CheckCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface AccountSettingsTabProps {
  preferences: any
}

export const AccountSettingsTab = ({ preferences }: AccountSettingsTabProps) => {
  const { user } = useAuth()
  const updateProfile = useUpdateUserProfile()
  const updatePreferences = useUpdateUserPreferences()

  const [profileData, setProfileData] = useState({
    email: user?.email || '',
    phone_number: preferences?.phone_number || '',
  })

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  })

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    try {
      // Update phone number in preferences
      if (profileData.phone_number !== preferences?.phone_number) {
        await updatePreferences.mutateAsync({
          phone_number: profileData.phone_number,
        })
      }

      // Update email if changed
      if (profileData.email !== user?.email) {
        await updateProfile.mutateAsync({
          email: profileData.email,
        })
        setMessage({
          type: 'success',
          text: 'Profile updated successfully! Check your new email for verification.',
        })
      } else {
        setMessage({
          type: 'success',
          text: 'Profile updated successfully!',
        })
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to update profile',
      })
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Passwords do not match',
      })
      return
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({
        type: 'error',
        text: 'Password must be at least 6 characters',
      })
      return
    }

    try {
      await updateProfile.mutateAsync({
        password: passwordData.newPassword,
      })
      setMessage({
        type: 'success',
        text: 'Password updated successfully!',
      })
      setPasswordData({ newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to update password',
      })
    }
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Profile Information</span>
          </CardTitle>
          <CardDescription>Update your account profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>Email Address</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                required
              />
              <p className="text-sm text-gray-500">
                Email verification status:{' '}
                <span className={user?.email_confirmed_at ? 'text-green-600' : 'text-yellow-600'}>
                  {user?.email_confirmed_at ? 'Verified ✓' : 'Pending verification'}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>Phone Number</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={profileData.phone_number}
                onChange={(e) => setProfileData({ ...profileData, phone_number: e.target.value })}
                placeholder="+27 12 345 6789"
              />
            </div>

            <Button
              type="submit"
              disabled={updateProfile.isPending || updatePreferences.isPending}
            >
              {updateProfile.isPending || updatePreferences.isPending
                ? 'Saving...'
                : 'Save Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lock className="h-5 w-5" />
            <span>Change Password</span>
          </CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                placeholder="Enter new password"
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                placeholder="Confirm new password"
                minLength={6}
              />
            </div>

            <Button type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
