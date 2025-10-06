import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Save, Settings as SettingsIcon, ArrowLeft, Trash2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { useUserStokvel, useUpdateStokvel, useDeleteStokvel } from '../hooks/useUserStokvels'
import { formatCurrency } from '../utils/currency'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog'

export const Settings = () => {
  const { stokvelId } = useParams<{ stokvelId: string }>()
  const navigate = useNavigate()
  const updateStokvel = useUpdateStokvel()
  const deleteStokvel = useDeleteStokvel()
  
  // Use the new multi-stokvel hooks
  const { data: stokvel, isLoading } = useUserStokvel(stokvelId!)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    monthly_contribution: 0,
    target_amount: 0,
    currency: 'ZAR',
  })

  useEffect(() => {
    if (stokvel) {
      setFormData({
        name: stokvel.name,
        description: stokvel.description || '',
        monthly_contribution: stokvel.monthly_contribution,
        target_amount: stokvel.target_amount || 0,
        currency: stokvel.currency,
      })
    }
  }, [stokvel])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stokvelId) return

    try {
      await updateStokvel.mutateAsync({
        id: stokvelId,
        updates: formData
      })
      // Success feedback would be handled by the mutation onSuccess
    } catch (error) {
      console.error('Error updating stokvel:', error)
      // Error feedback would be handled by the mutation onError
    }
  }

  const handleDelete = async () => {
    if (!stokvelId) return

    try {
      await deleteStokvel.mutateAsync(stokvelId)
      navigate('/my-stokvels')
    } catch (error) {
      console.error('Error deleting stokvel:', error)
    }
  }

  // Show error if stokvelId is required but not provided
  if (!stokvelId) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Stokvel Settings</h1>
          <p className="text-gray-600 mb-6">No stokvel ID provided in the URL.</p>
          <Button onClick={() => navigate('/my-stokvels')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Stokvels
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!stokvel) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Stokvel Not Found</h1>
          <p className="text-gray-600 mb-6">The requested stokvel could not be found or you don't have access to it.</p>
          <Button onClick={() => navigate('/my-stokvels')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Stokvels
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/my-stokvels')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Stokvel Settings</h1>
            <p className="text-gray-600">Configure settings for "{stokvel.name}"</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-xs">
            {stokvel.stokvel_type?.name}
          </Badge>
          <Badge variant={stokvel.is_active ? "default" : "secondary"}>
            {stokvel.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      {/* Main Settings Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SettingsIcon className="h-5 w-5" />
            <span>Basic Information</span>
          </CardTitle>
          <CardDescription>
            Update the basic settings for your stokvel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Stokvel Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthly_contribution">Monthly Contribution</Label>
                <Input
                  id="monthly_contribution"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.monthly_contribution}
                  onChange={(e) => setFormData({ ...formData, monthly_contribution: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_amount">Target Amount (Optional)</Label>
                <Input
                  id="target_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.target_amount}
                  onChange={(e) => setFormData({ ...formData, target_amount: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of your stokvel"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button type="submit" disabled={updateStokvel.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {updateStokvel.isPending ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Current Configuration Display */}
      <Card>
        <CardHeader>
          <CardTitle>Current Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Monthly Contribution</p>
              <p className="text-lg font-semibold">
                {formatCurrency(stokvel.monthly_contribution, stokvel.currency)}
              </p>
            </div>
            {stokvel.target_amount && (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Target Amount</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(stokvel.target_amount, stokvel.currency)}
                </p>
              </div>
            )}
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Start Date</p>
              <p className="text-lg font-semibold">
                {new Date(stokvel.start_date).toLocaleDateString()}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Type</p>
              <p className="text-lg font-semibold">{stokvel.stokvel_type?.name}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Created</p>
              <p className="text-lg font-semibold">
                {new Date(stokvel.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="text-lg font-semibold">
                {new Date(stokvel.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-900">Danger Zone</CardTitle>
          <CardDescription className="text-red-700">
            Irreversible actions that affect your stokvel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Stokvel
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Stokvel</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{stokvel.name}"? This action will deactivate the stokvel and cannot be undone. 
                  All data will be preserved but the stokvel will no longer be active.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete Stokvel
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}