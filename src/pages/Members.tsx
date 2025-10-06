import { useState } from 'react'
import { Plus, Edit, Trash2, Car } from 'lucide-react'
import { useMembers, useCreateMember, useUpdateMember, useDeleteMember } from '../hooks/useMembers'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Member } from '../types'
import { formatDate } from '../utils/date'

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

export const Members = () => {
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