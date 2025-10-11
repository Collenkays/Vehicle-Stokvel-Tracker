import { useState, useEffect } from 'react'
import { useUpdateUserPreferences } from '@/hooks/useUserPreferences'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, Mail, Smartphone, CheckCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface NotificationSettingsTabProps {
  preferences: any
}

export const NotificationSettingsTab = ({ preferences }: NotificationSettingsTabProps) => {
  const updatePreferences = useUpdateUserPreferences()

  const [notificationData, setNotificationData] = useState({
    notification_email: preferences?.notification_email ?? true,
    notification_push: preferences?.notification_push ?? true,
    notification_frequency: preferences?.notification_frequency ?? 'immediate',
  })

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (preferences) {
      setNotificationData({
        notification_email: preferences.notification_email ?? true,
        notification_push: preferences.notification_push ?? true,
        notification_frequency: preferences.notification_frequency ?? 'immediate',
      })
    }
  }, [preferences])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    try {
      await updatePreferences.mutateAsync(notificationData)
      setMessage({
        type: 'success',
        text: 'Notification preferences updated successfully!',
      })
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to update notification preferences',
      })
    }
  }

  const handleToggle = (field: keyof typeof notificationData) => {
    setNotificationData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notification Preferences</span>
          </CardTitle>
          <CardDescription>
            Control how and when you receive notifications about your stokvels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            {/* Email Notifications */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 mt-0.5 text-gray-600" />
                <div>
                  <Label htmlFor="email-notifications" className="text-base font-medium">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-gray-500">
                    Receive notifications via email about contributions, payouts, and activities
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant={notificationData.notification_email ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleToggle('notification_email')}
              >
                {notificationData.notification_email ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            {/* Push Notifications */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-start space-x-3">
                <Smartphone className="h-5 w-5 mt-0.5 text-gray-600" />
                <div>
                  <Label htmlFor="push-notifications" className="text-base font-medium">
                    Push Notifications
                  </Label>
                  <p className="text-sm text-gray-500">
                    Receive push notifications on your device (PWA)
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant={notificationData.notification_push ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleToggle('notification_push')}
              >
                {notificationData.notification_push ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            {/* Notification Frequency */}
            <div className="space-y-2">
              <Label htmlFor="frequency">Notification Frequency</Label>
              <Select
                value={notificationData.notification_frequency}
                onValueChange={(value) =>
                  setNotificationData({ ...notificationData, notification_frequency: value })
                }
              >
                <SelectTrigger id="frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate (as they happen)</SelectItem>
                  <SelectItem value="daily">Daily Digest (once per day)</SelectItem>
                  <SelectItem value="weekly">Weekly Summary (once per week)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                Choose how often you want to receive notification digests
              </p>
            </div>

            <div className="pt-4 border-t">
              <Button type="submit" disabled={updatePreferences.isPending}>
                {updatePreferences.isPending ? 'Saving...' : 'Save Preferences'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>
            Stokvel-specific notifications are configured in each stokvel's settings page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <div className="h-1.5 w-1.5 rounded-full bg-gray-400 mt-2" />
              <div>
                <p className="font-medium text-gray-900">Contribution Reminders</p>
                <p>Alerts when contributions are due or overdue</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="h-1.5 w-1.5 rounded-full bg-gray-400 mt-2" />
              <div>
                <p className="font-medium text-gray-900">Payout Notifications</p>
                <p>Alerts when payouts are processed or pending</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="h-1.5 w-1.5 rounded-full bg-gray-400 mt-2" />
              <div>
                <p className="font-medium text-gray-900">Member Activity</p>
                <p>Notifications when members join, leave, or make contributions</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="h-1.5 w-1.5 rounded-full bg-gray-400 mt-2" />
              <div>
                <p className="font-medium text-gray-900">Payment Verification</p>
                <p>Alerts when payment verification is required or completed</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
