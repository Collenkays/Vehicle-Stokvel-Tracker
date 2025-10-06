import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Eye, Settings, Users, TrendingUp, Calendar, Crown, UserCircle, Plus, Edit, Trash2, Car } from 'lucide-react'
import { useUserStokvelMemberships } from '../hooks/useUserStokvels'
import { useStokvelSummaries } from '../hooks/useUserStokvels'
import { useMembers, useCreateMember, useUpdateMember, useDeleteMember } from '../hooks/useMembers'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { StokvelWithType, StokvelSummary } from '../types/multi-stokvel'
import { Member } from '../types'
import { formatDate } from '../utils/date'
import { formatCurrency } from '../utils/currency'

interface MembershipCardProps {
  stokvel: StokvelWithType
  summary?: StokvelSummary
  onView: (stokvelId: string) => void
  onSettings: (stokvelId: string) => void
}

const MembershipCard = ({ stokvel, summary, onView, onSettings }: MembershipCardProps) => {
  const balance = summary 
    ? summary.total_verified_contributions - summary.total_payouts
    : 0

  const progress = stokvel.target_amount 
    ? (balance / stokvel.target_amount) * 100 
    : 0

  const getStatusColor = () => {
    if (!stokvel.is_active) return 'bg-gray-500'
    if (stokvel.target_amount && balance >= stokvel.target_amount) return 'bg-green-500'
    if (progress > 75) return 'bg-blue-500'
    if (progress > 50) return 'bg-yellow-500'
    return 'bg-orange-500'
  }

  const getStatusText = () => {
    if (!stokvel.is_active) return 'Inactive'
    if (stokvel.target_amount && balance >= stokvel.target_amount) return 'Target Reached'
    if (progress > 75) return 'Nearly There'
    if (progress > 50) return 'On Track'
    return 'Building Up'
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{stokvel.stokvel_type?.icon}</span>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {stokvel.name}
                {stokvel.membership_role === 'admin' && (
                  <Crown className="h-4 w-4 text-yellow-500" />
                )}
              </CardTitle>
              <CardDescription className="text-sm">
                {stokvel.stokvel_type?.name} • {stokvel.membership_role}
              </CardDescription>
              {stokvel.membership_join_date && (
                <p className="text-xs text-gray-500">
                  Joined: {formatDate(stokvel.membership_join_date)}
                </p>
              )}
            </div>
          </div>
          <Badge variant="secondary" className={`text-white ${getStatusColor()}`}>
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 line-clamp-2">
          {stokvel.description || stokvel.stokvel_type?.description}
        </p>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="flex items-center space-x-1 text-gray-500">
              <Users className="h-4 w-4" />
              <span>Members</span>
            </div>
            <div className="font-semibold">{summary?.member_count || 0}</div>
          </div>
          <div>
            <div className="flex items-center space-x-1 text-gray-500">
              <TrendingUp className="h-4 w-4" />
              <span>Balance</span>
            </div>
            <div className="font-semibold">
              {formatCurrency(balance, stokvel.currency)}
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1 text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>Monthly</span>
            </div>
            <div className="font-semibold">
              {formatCurrency(stokvel.monthly_contribution, stokvel.currency)}
            </div>
          </div>
          {stokvel.membership_rotation_order && (
            <div>
              <div className="flex items-center space-x-1 text-gray-500">
                <span>Position</span>
              </div>
              <div className="font-semibold">#{stokvel.membership_rotation_order}</div>
            </div>
          )}
        </div>

        {/* Progress Bar for target-based stokvels */}
        {stokvel.target_amount && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to target</span>
              <span>{Math.min(progress, 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${getStatusColor()}`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Frequency Badge */}
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {stokvel.rules.frequency}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {stokvel.rules.distribution_type.replace('_', ' ')}
          </Badge>
          {stokvel.rules.rotation_based && (
            <Badge variant="outline" className="text-xs">
              rotation-based
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => onView(stokvel.id)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-1" />
            View Dashboard
          </Button>
          {stokvel.membership_role === 'admin' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onSettings(stokvel.id)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Form data interface for member management
interface MemberFormData {
  full_name: string
  email: string
  contact_number: string
  join_date: string
  rotation_order: number
}

const initialFormData: MemberFormData = {
  full_name: '',
  email: '',
  contact_number: '',
  join_date: new Date().toISOString().split('T')[0],
  rotation_order: 1,
}

// Legacy Member Management Component (for specific stokvel context)
const StokvelMembersManagement = () => {
  const [showForm, setShowForm] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [formData, setFormData] = useState<MemberFormData>(initialFormData)

  const { data: members, isLoading } = useMembers()
  const createMember = useCreateMember()
  const updateMember = useUpdateMember()
  const deleteMember = useDeleteMember()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingMember) {
        await updateMember.mutateAsync({
          id: editingMember.id,
          ...formData,
        })
      } else {
        await createMember.mutateAsync(formData)
      }
      
      setShowForm(false)
      setEditingMember(null)
      setFormData(initialFormData)
    } catch (error) {
      console.error('Error saving member:', error)
    }
  }

  const handleEdit = (member: Member) => {
    setEditingMember(member)
    setFormData({
      full_name: member.full_name,
      email: member.email,
      contact_number: member.contact_number,
      join_date: member.join_date,
      rotation_order: member.rotation_order,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      await deleteMember.mutateAsync(id)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingMember(null)
    setFormData(initialFormData)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Members</h1>
          <p className="text-gray-600">Manage stokvel members and rotation order</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingMember ? 'Edit Member' : 'Add New Member'}</CardTitle>
            <CardDescription>
              {editingMember ? 'Update member information' : 'Enter member details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_number">Contact Number</Label>
                  <Input
                    id="contact_number"
                    value={formData.contact_number}
                    onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="join_date">Join Date</Label>
                  <Input
                    id="join_date"
                    type="date"
                    value={formData.join_date}
                    onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rotation_order">Rotation Order</Label>
                  <Input
                    id="rotation_order"
                    type="number"
                    min="1"
                    value={formData.rotation_order}
                    onChange={(e) => setFormData({ ...formData, rotation_order: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createMember.isPending || updateMember.isPending}>
                  {createMember.isPending || updateMember.isPending ? 'Saving...' : 'Save'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {members?.map((member) => (
          <Card key={member.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    {member.vehicle_received ? (
                      <Car className="h-6 w-6 text-green-600" />
                    ) : (
                      <span className="h-6 w-6 flex items-center justify-center text-sm font-semibold text-primary">
                        {member.rotation_order}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {member.full_name}
                    </h3>
                    <p className="text-gray-600">{member.email}</p>
                    <p className="text-sm text-gray-500">
                      Joined: {formatDate(member.join_date)} • Order: {member.rotation_order}
                    </p>
                    {member.vehicle_received && member.month_received && (
                      <p className="text-sm text-green-600 font-medium">
                        Vehicle received in {member.month_received}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(member)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(member.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {members?.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">No members found. Add your first member to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// User Memberships Component (for global context)
const UserStokvelMemberships = () => {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<'all' | 'admin' | 'member'>('all')

  const { data: memberships = [], isLoading } = useUserStokvelMemberships()
  const { data: summaries = [] } = useStokvelSummaries()

  const filteredMemberships = memberships.filter(stokvel => {
    if (filter === 'admin') return stokvel.membership_role === 'admin'
    if (filter === 'member') return stokvel.membership_role === 'member'
    return true
  })

  const getSummaryForStokvel = (stokvelId: string) => {
    return summaries.find(s => s.id === stokvelId)
  }

  const handleViewStokvel = (stokvelId: string) => {
    navigate(`/stokvel/${stokvelId}/dashboard`)
  }

  const handleStokvelSettings = (stokvelId: string) => {
    navigate(`/stokvel/${stokvelId}/settings`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Stokvel Memberships</h1>
            <p className="text-gray-600 mt-1">
              View all stokvels you are a member of and track your participation
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <UserCircle className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-600">{memberships.length} memberships</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => navigate('/my-stokvels')}
            className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Owned Stokvels
          </button>
          <button
            className="px-4 py-2 rounded-md text-sm font-medium bg-white text-gray-900 shadow-sm"
          >
            My Memberships ({memberships.length})
          </button>
        </div>

        {/* Summary Cards */}
        {memberships.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Memberships
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{memberships.length}</div>
                <p className="text-xs text-gray-600">
                  {memberships.filter(s => s.membership_role === 'admin').length} as admin
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Active Stokvels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {memberships.filter(s => s.is_active).length}
                </div>
                <p className="text-xs text-gray-600">
                  Currently active
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summaries.reduce((sum, summary) => sum + summary.member_count, 0)}
                </div>
                <p className="text-xs text-gray-600">
                  Across all stokvels
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { key: 'all', label: 'All Memberships', count: memberships.length },
            { key: 'admin', label: 'Admin Roles', count: memberships.filter(s => s.membership_role === 'admin').length },
            { key: 'member', label: 'Member Roles', count: memberships.filter(s => s.membership_role === 'member').length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Stokvels Grid */}
        {filteredMemberships.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {filter === 'all' 
                  ? "No stokvel memberships yet" 
                  : `No ${filter} roles`
                }
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all'
                  ? "You haven't been added to any stokvels yet. Create your first stokvel or ask an admin to add you to an existing one."
                  : `You don't have any ${filter} roles at the moment.`
                }
              </p>
              {filter === 'all' && (
                <Button onClick={() => navigate('/create-stokvel')}>
                  Create Your First Stokvel
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMemberships.map((stokvel) => (
              <MembershipCard
                key={stokvel.id}
                stokvel={stokvel}
                summary={getSummaryForStokvel(stokvel.id)}
                onView={handleViewStokvel}
                onSettings={handleStokvelSettings}
              />
            ))}
          </div>
        )}

        {/* Quick Actions Footer */}
        {memberships.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>
                Common tasks for your stokvel memberships
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button variant="outline" onClick={() => navigate('/create-stokvel')}>
                  Create New Stokvel
                </Button>
                <Button variant="outline" onClick={() => navigate('/browse-stokvel-types')}>
                  Browse Stokvel Types
                </Button>
                <Button variant="outline" onClick={() => navigate('/my-stokvels')}>
                  View Owned Stokvels
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Main Members component that determines which view to show based on context
export const Members = () => {
  const params = useParams()
  
  // If we have a stokvelId in the URL, show the stokvel-specific members management
  // Otherwise, show the user's stokvel memberships
  if (params.stokvelId) {
    return <StokvelMembersManagement />
  }
  
  return <UserStokvelMemberships />
}