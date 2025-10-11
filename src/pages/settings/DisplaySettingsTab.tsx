import { useState, useEffect } from 'react'
import { useUpdateUserPreferences } from '@/hooks/useUserPreferences'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Monitor, Calendar, DollarSign, Globe, CheckCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DisplaySettingsTabProps {
  preferences: any
}

export const DisplaySettingsTab = ({ preferences }: DisplaySettingsTabProps) => {
  const updatePreferences = useUpdateUserPreferences()

  const [displayData, setDisplayData] = useState({
    date_format: preferences?.date_format ?? 'DD/MM/YYYY',
    currency_display: preferences?.currency_display ?? 'ZAR',
    theme: preferences?.theme ?? 'light',
    dashboard_default_view: preferences?.dashboard_default_view ?? 'overview',
    language: preferences?.language ?? 'en',
  })

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (preferences) {
      setDisplayData({
        date_format: preferences.date_format ?? 'DD/MM/YYYY',
        currency_display: preferences.currency_display ?? 'ZAR',
        theme: preferences.theme ?? 'light',
        dashboard_default_view: preferences.dashboard_default_view ?? 'overview',
        language: preferences.language ?? 'en',
      })
    }
  }, [preferences])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    try {
      await updatePreferences.mutateAsync(displayData)
      setMessage({
        type: 'success',
        text: 'Display settings updated successfully!',
      })
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to update display settings',
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Monitor className="h-5 w-5" />
            <span>Display Preferences</span>
          </CardTitle>
          <CardDescription>
            Customize how information is displayed throughout the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            {/* Date Format */}
            <div className="space-y-2">
              <Label htmlFor="date-format" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Date Format</span>
              </Label>
              <Select
                value={displayData.date_format}
                onValueChange={(value) =>
                  setDisplayData({ ...displayData, date_format: value })
                }
              >
                <SelectTrigger id="date-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2025)</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2025)</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2025-12-31)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                Current date: {new Date().toLocaleDateString('en-ZA')}
              </p>
            </div>

            {/* Currency Display */}
            <div className="space-y-2">
              <Label htmlFor="currency" className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>Default Currency</span>
              </Label>
              <Select
                value={displayData.currency_display}
                onValueChange={(value) =>
                  setDisplayData({ ...displayData, currency_display: value })
                }
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ZAR">ZAR (South African Rand)</SelectItem>
                  <SelectItem value="USD">USD (US Dollar)</SelectItem>
                  <SelectItem value="EUR">EUR (Euro)</SelectItem>
                  <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                Default currency for new stokvels
              </p>
            </div>

            {/* Theme */}
            <div className="space-y-2">
              <Label htmlFor="theme" className="flex items-center space-x-2">
                <Monitor className="h-4 w-4" />
                <span>Theme</span>
              </Label>
              <Select
                value={displayData.theme}
                onValueChange={(value) => setDisplayData({ ...displayData, theme: value })}
              >
                <SelectTrigger id="theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light (Default)</SelectItem>
                  <SelectItem value="dark">Dark (Coming Soon)</SelectItem>
                  <SelectItem value="system">System (Coming Soon)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                Choose your preferred color theme
              </p>
            </div>

            {/* Dashboard Default View */}
            <div className="space-y-2">
              <Label htmlFor="dashboard-view">Default Dashboard View</Label>
              <Select
                value={displayData.dashboard_default_view}
                onValueChange={(value) =>
                  setDisplayData({ ...displayData, dashboard_default_view: value })
                }
              >
                <SelectTrigger id="dashboard-view">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="contributions">Contributions</SelectItem>
                  <SelectItem value="members">Members</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                The default view when opening the dashboard
              </p>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label htmlFor="language" className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span>Language</span>
              </Label>
              <Select
                value={displayData.language}
                onValueChange={(value) => setDisplayData({ ...displayData, language: value })}
              >
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English (Default)</SelectItem>
                  <SelectItem value="af">Afrikaans (Coming Soon)</SelectItem>
                  <SelectItem value="zu">isiZulu (Coming Soon)</SelectItem>
                  <SelectItem value="xh">isiXhosa (Coming Soon)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                Multi-language support coming soon
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
    </div>
  )
}
