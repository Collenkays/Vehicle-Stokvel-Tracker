import { useState, useEffect } from 'react'
import {
  useUpdateStokvelNotificationSettings,
  getStokvelNotificationSettings,
} from '@/hooks/useStokvelSettings'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, Mail, Users, CheckCircle2, Calendar } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface StokvelNotificationsTabProps {
  stokvel: any
  stokvelId: string
}

export const StokvelNotificationsTab = ({
  stokvel,
  stokvelId,
}: StokvelNotificationsTabProps) => {
  const updateNotificationSettings = useUpdateStokvelNotificationSettings()
  const notificationSettings = getStokvelNotificationSettings(stokvel)

  const [notificationsData, setNotificationsData] = useState(notificationSettings)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (stokvel) {
      setNotificationsData(getStokvelNotificationSettings(stokvel))
    }
  }, [stokvel])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    try {
      await updateNotificationSettings.mutateAsync({
        stokvelId,
        settings: notificationsData,
      })
      setMessage({
        type: 'success',
        text: 'Notification settings updated successfully!',
      })
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to update notification settings',
      })
    }
  }

  const handleToggle = (field: keyof typeof notificationsData) => {
    if (field === 'reminder_frequency') return // Can't toggle frequency
    setNotificationsData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Stokvel Notifications</span>
          </CardTitle>
          <CardDescription>
            Configure notification preferences for "{stokvel.name}"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            {/* Contribution Reminders */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 mt-0.5 text-gray-600" />
                <div>
                  <Label className="text-base font-medium">Contribution Reminders</Label>
                  <p className="text-sm text-gray-500">
                    Send reminders when contributions are due or overdue
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant={notificationsData.contribution_reminders ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleToggle('contribution_reminders')}
              >
                {notificationsData.contribution_reminders ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            {/* Payout Notifications */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 mt-0.5 text-gray-600" />
                <div>
                  <Label className="text-base font-medium">Payout Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Notifications when payouts are processed or pending
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant={notificationsData.payout_notifications ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleToggle('payout_notifications')}
              >
                {notificationsData.payout_notifications ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            {/* Member Activity Alerts */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 mt-0.5 text-gray-600" />
                <div>
                  <Label className="text-base font-medium">Member Activity Alerts</Label>
                  <p className="text-sm text-gray-500">
                    Alerts when members join, leave, or make contributions
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant={notificationsData.member_activity_alerts ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleToggle('member_activity_alerts')}
              >
                {notificationsData.member_activity_alerts ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            {/* Payment Verification Alerts */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 mt-0.5 text-gray-600" />
                <div>
                  <Label className="text-base font-medium">Payment Verification Alerts</Label>
                  <p className="text-sm text-gray-500">
                    Notifications when payment verification is required or completed
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant={
                  notificationsData.payment_verification_alerts ? 'default' : 'outline'
                }
                size="sm"
                onClick={() => handleToggle('payment_verification_alerts')}
              >
                {notificationsData.payment_verification_alerts ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            {/* Reminder Frequency */}
            <div className="space-y-2">
              <Label htmlFor="reminder-frequency">Reminder Frequency</Label>
              <Select
                value={notificationsData.reminder_frequency}
                onValueChange={(value: 'daily' | 'weekly' | 'monthly') =>
                  setNotificationsData({ ...notificationsData, reminder_frequency: value })
                }
              >
                <SelectTrigger id="reminder-frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                How often to send contribution reminder notifications
              </p>
            </div>

            <div className="pt-4 border-t">
              <Button type="submit" disabled={updateNotificationSettings.isPending}>
                {updateNotificationSettings.isPending ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-base">Notification Delivery</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-700">
          <p>
            Notifications will be sent according to your global notification preferences
            (email, push, frequency). You can configure global preferences in your Account Settings.
          </p>
        </CardContent>
      </Card>

      {/* Current Settings Summary */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-base">Active Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Contribution Reminders:</span>
            <span
              className={`font-medium ${
                notificationsData.contribution_reminders ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              {notificationsData.contribution_reminders ? '✓ Enabled' : '✗ Disabled'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Payout Notifications:</span>
            <span
              className={`font-medium ${
                notificationsData.payout_notifications ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              {notificationsData.payout_notifications ? '✓ Enabled' : '✗ Disabled'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Member Activity:</span>
            <span
              className={`font-medium ${
                notificationsData.member_activity_alerts ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              {notificationsData.member_activity_alerts ? '✓ Enabled' : '✗ Disabled'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Payment Verification:</span>
            <span
              className={`font-medium ${
                notificationsData.payment_verification_alerts ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              {notificationsData.payment_verification_alerts ? '✓ Enabled' : '✗ Disabled'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Reminder Frequency:</span>
            <span className="font-medium capitalize">
              {notificationsData.reminder_frequency}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
