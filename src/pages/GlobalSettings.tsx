import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Bell, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import { AccountSettingsTab } from './settings/AccountSettingsTab'
import { NotificationSettingsTab } from './settings/NotificationSettingsTab'
import { DisplaySettingsTab } from './settings/DisplaySettingsTab'

export const GlobalSettings = () => {
  const navigate = useNavigate()
  const { data: preferences, isLoading } = useUserPreferences()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/my-stokvels')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
              <p className="text-gray-600">Manage your account preferences and settings</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
            <TabsTrigger value="account" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Account</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="display" className="flex items-center space-x-2">
              <Monitor className="h-4 w-4" />
              <span>Display</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="mt-6">
            <AccountSettingsTab preferences={preferences} />
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <NotificationSettingsTab preferences={preferences} />
          </TabsContent>

          <TabsContent value="display" className="mt-6">
            <DisplaySettingsTab preferences={preferences} />
          </TabsContent>
        </Tabs>

        {/* Help Section */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Need Help?</h3>
          <p className="text-sm text-blue-700">
            For stokvel-specific settings (contribution rules, payout configuration, member notifications),
            navigate to the individual stokvel's settings page from your stokvel list.
          </p>
        </div>
      </div>
    </div>
  )
}
