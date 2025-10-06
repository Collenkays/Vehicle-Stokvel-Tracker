import { useState, useEffect } from 'react'
import { Save, Settings as SettingsIcon } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { supabase } from '../lib/supabase'
import { StokveilSettings } from '../types'

export const Settings = () => {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<StokveilSettings | null>(null)
  const [formData, setFormData] = useState({
    stokvel_name: '',
    monthly_contribution: 3500,
    vehicle_target: 100000,
    total_members: 13,
    start_date: '2025-01-01',
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setSettings(data)
        setFormData({
          stokvel_name: data.stokvel_name,
          monthly_contribution: data.monthly_contribution,
          vehicle_target: data.vehicle_target,
          total_members: data.total_members,
          start_date: data.start_date,
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
    setLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (settings) {
        // Update existing settings
        const { error } = await supabase
          .from('settings')
          .update(formData)
          .eq('id', settings.id)

        if (error) throw error
      } else {
        // Create new settings
        const { error } = await supabase
          .from('settings')
          .insert([formData])

        if (error) throw error
      }

      await fetchSettings() // Refresh settings
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Configure your stokvel parameters</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SettingsIcon className="h-5 w-5" />
            <span>Stokvel Configuration</span>
          </CardTitle>
          <CardDescription>
            Update the basic settings for your stokvel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="stokvel_name">Stokvel Name</Label>
                <Input
                  id="stokvel_name"
                  value={formData.stokvel_name}
                  onChange={(e) => setFormData({ ...formData, stokvel_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_members">Total Members</Label>
                <Input
                  id="total_members"
                  type="number"
                  min="1"
                  value={formData.total_members}
                  onChange={(e) => setFormData({ ...formData, total_members: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthly_contribution">Monthly Contribution (ZAR)</Label>
                <Input
                  id="monthly_contribution"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.monthly_contribution}
                  onChange={(e) => setFormData({ ...formData, monthly_contribution: parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicle_target">Vehicle Target Amount (ZAR)</Label>
                <Input
                  id="vehicle_target"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.vehicle_target}
                  onChange={(e) => setFormData({ ...formData, vehicle_target: parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="start_date">Stokvel Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button type="submit" disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Important Information</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700">
          <ul className="space-y-2">
            <li>• These settings affect how payouts are calculated and triggered</li>
            <li>• Changes to the vehicle target amount will affect future payout calculations</li>
            <li>• Monthly contribution amount is used as the default for new contributions</li>
            <li>• Start date is used for reporting and analytics calculations</li>
          </ul>
        </CardContent>
      </Card>

      {/* Current Values Display */}
      {settings && (
        <Card>
          <CardHeader>
            <CardTitle>Current Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Stokvel Name</p>
                <p className="text-lg font-semibold">{settings.stokvel_name}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-lg font-semibold">{settings.total_members}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Monthly Contribution</p>
                <p className="text-lg font-semibold">
                  R{settings.monthly_contribution.toLocaleString()}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Vehicle Target</p>
                <p className="text-lg font-semibold">
                  R{settings.vehicle_target.toLocaleString()}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="text-lg font-semibold">
                  {new Date(settings.start_date).toLocaleDateString()}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="text-lg font-semibold">
                  {new Date(settings.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}