import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Save, Settings as SettingsIcon, ArrowLeft, Trash2, Plus, Edit, Users, Crown } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { useUserStokvel, useUpdateStokvel, useDeleteStokvel } from '../hooks/useUserStokvels'
import { useStokvelMembers, useAddStokvelMember, useUpdateStokvelMember, useDeleteStokvelMember } from '../hooks/useMembers'
import { formatCurrency } from '../utils/currency'
import { formatDate } from '../utils/date'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'

export const Settings = () => {
  const { stokvelId } = useParams<{ stokvelId: string }>()
  const navigate = useNavigate()
  const updateStokvel = useUpdateStokvel()
  const deleteStokvel = useDeleteStokvel()

  // Use the new multi-stokvel hooks
  const { data: stokvel, isLoading } = useUserStokvel(stokvelId!)
  const { data: members = [], isLoading: membersLoading } = useStokvelMembers(stokvelId)
  const addMember = useAddStokvelMember()
  const updateMember = useUpdateStokvelMember()
  const deleteMember = useDeleteStokvelMember()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    monthly_contribution: 0,
    target_amount: 0,
    currency: 'ZAR',
  })

  const [memberDialogOpen, setMemberDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<any>(null)
  const [memberFormData, setMemberFormData] = useState({
    full_name: '',
    email: '',
    contact_number: '',
    role: 'member' as 'admin' | 'member',
    rotation_order: 1,
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

  const handleOpenMemberDialog = (member?: any) => {
    if (member) {
      setEditingMember(member)
      setMemberFormData({
        full_name: member.full_name,
        email: member.email,
        contact_number: member.contact_number || '',
        role: member.role,
        rotation_order: member.rotation_order,
      })
    } else {
      setEditingMember(null)
      setMemberFormData({
        full_name: '',
        email: '',
        contact_number: '',
        role: 'member',
        rotation_order: members.length + 1,
      })
    }
    setMemberDialogOpen(true)
  }

  const handleSaveMember = async () => {
    if (!stokvelId) {
      console.error('No stokvelId provided')
      return
    }

    // Validate required fields
    if (!memberFormData.full_name || !memberFormData.email) {
      console.error('Missing required fields')
      alert('Please fill in all required fields (Full Name and Email)')
      return
    }

    try {
      console.log('Saving member:', { stokvelId, memberFormData, editingMember })

      if (editingMember) {
        const result = await updateMember.mutateAsync({
          id: editingMember.id,
          stokvel_id: stokvelId,
          updates: memberFormData,
        })
        console.log('Member updated:', result)
      } else {
        const result = await addMember.mutateAsync({
          stokvel_id: stokvelId,
          ...memberFormData,
        })
        console.log('Member added:', result)
      }
      setMemberDialogOpen(false)
    } catch (error: any) {
      console.error('Error saving member:', error)
      alert(`Failed to save member: ${error.message || 'Unknown error'}`)
    }
  }

  const handleDeleteMember = async (memberId: string) => {
    if (!stokvelId) return

    try {
      await deleteMember.mutateAsync({ id: memberId, stokvel_id: stokvelId })
    } catch (error) {
      console.error('Error deleting member:', error)
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

      {/* Member Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Stokvel Members</span>
              </CardTitle>
              <CardDescription>
                Manage members of your stokvel and their roles
              </CardDescription>
            </div>
            <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenMemberDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{editingMember ? 'Edit Member' : 'Add New Member'}</DialogTitle>
                  <DialogDescription>
                    {editingMember ? 'Update member information' : 'Add a new member to your stokvel'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="member_name">Full Name</Label>
                    <Input
                      id="member_name"
                      value={memberFormData.full_name}
                      onChange={(e) => setMemberFormData({ ...memberFormData, full_name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="member_email">Email</Label>
                    <Input
                      id="member_email"
                      type="email"
                      value={memberFormData.email}
                      onChange={(e) => setMemberFormData({ ...memberFormData, email: e.target.value })}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="member_contact">Contact Number</Label>
                    <Input
                      id="member_contact"
                      value={memberFormData.contact_number}
                      onChange={(e) => setMemberFormData({ ...memberFormData, contact_number: e.target.value })}
                      placeholder="+27 12 345 6789"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="member_role">Role</Label>
                      <Select
                        value={memberFormData.role}
                        onValueChange={(value: 'admin' | 'member') => setMemberFormData({ ...memberFormData, role: value })}
                      >
                        <SelectTrigger id="member_role">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rotation_order">Rotation Order</Label>
                      <Input
                        id="rotation_order"
                        type="number"
                        min="1"
                        value={memberFormData.rotation_order}
                        onChange={(e) => setMemberFormData({ ...memberFormData, rotation_order: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setMemberDialogOpen(false)}
                    disabled={addMember.isPending || updateMember.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveMember}
                    disabled={addMember.isPending || updateMember.isPending || !memberFormData.full_name || !memberFormData.email}
                  >
                    {addMember.isPending || updateMember.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : 'Save'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {membersLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No members yet. Add your first member to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      {member.role === 'admin' ? (
                        <Crown className="h-4 w-4 text-yellow-600" />
                      ) : (
                        <span className="h-4 w-4 flex items-center justify-center text-xs font-semibold text-primary">
                          {member.rotation_order}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{member.full_name}</h4>
                        <Badge variant={member.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                          {member.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{member.email}</p>
                      {member.contact_number && (
                        <p className="text-xs text-gray-500">{member.contact_number}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        Joined: {formatDate(member.join_date)} • Position: #{member.rotation_order}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenMemberDialog(member)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Member</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove {member.full_name} from this stokvel?
                            This will deactivate their membership but preserve all historical data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteMember(member.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Remove Member
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
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