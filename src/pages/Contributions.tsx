import { useState } from 'react'
import { Plus, Check, X, Filter, FileText, Upload } from 'lucide-react'
import { useContributions, useCreateContribution, useUpdateContribution, useDeleteContribution } from '../hooks/useContributions'
import { useMembers } from '../hooks/useMembers'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Contribution } from '../types'
import { formatCurrency } from '../utils/currency'
import { formatDate, getCurrentMonth } from '../utils/date'

interface ContributionFormData {
  member_id: string
  month: string
  amount: number
  date_paid: string
  proof_of_payment?: string
  proof_file?: File
}

const initialFormData: ContributionFormData = {
  member_id: '',
  month: getCurrentMonth(),
  amount: 3500,
  date_paid: new Date().toISOString().split('T')[0],
  proof_of_payment: '',
}

export const Contributions = () => {
  const [showForm, setShowForm] = useState(false)
  const [editingContribution, setEditingContribution] = useState<Contribution | null>(null)
  const [formData, setFormData] = useState<ContributionFormData>(initialFormData)
  const [filterMonth, setFilterMonth] = useState('')

  const { data: contributions, isLoading } = useContributions(filterMonth)
  const { data: members } = useMembers()
  const createContribution = useCreateContribution()
  const updateContribution = useUpdateContribution()
  const deleteContribution = useDeleteContribution()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate that either proof_of_payment URL or proof_file is provided
    if (!formData.proof_of_payment && !formData.proof_file) {
      alert('Please provide proof of payment either as a URL or by uploading a file.')
      return
    }
    
    try {
      let proofUrl = formData.proof_of_payment
      
      // If a file is uploaded, you would typically upload it to a cloud storage service here
      // For now, we'll use a placeholder URL or the actual URL if provided
      if (formData.proof_file && !proofUrl) {
        // In a real implementation, you would upload the file to cloud storage (e.g., AWS S3, Cloudinary)
        // and get back a URL. For now, we'll create a temporary object URL
        proofUrl = URL.createObjectURL(formData.proof_file)
        console.log('File selected:', formData.proof_file.name)
        console.log('Note: In production, this file should be uploaded to cloud storage')
      }
      
      const submitData = {
        member_id: formData.member_id,
        month: formData.month,
        amount: formData.amount,
        date_paid: formData.date_paid,
        proof_of_payment: proofUrl,
      }
      
      if (editingContribution) {
        await updateContribution.mutateAsync({
          id: editingContribution.id,
          ...submitData,
        })
      } else {
        await createContribution.mutateAsync(submitData)
      }
      
      setShowForm(false)
      setEditingContribution(null)
      setFormData(initialFormData)
    } catch (error) {
      console.error('Error saving contribution:', error)
    }
  }

  const handleEdit = (contribution: Contribution) => {
    setEditingContribution(contribution)
    setFormData({
      member_id: contribution.member_id,
      month: contribution.month,
      amount: contribution.amount,
      date_paid: contribution.date_paid,
      proof_of_payment: contribution.proof_of_payment || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this contribution?')) {
      await deleteContribution.mutateAsync(id)
    }
  }

  const handleVerify = async (contribution: Contribution) => {
    await updateContribution.mutateAsync({
      id: contribution.id,
      verified: !contribution.verified,
    })
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingContribution(null)
    setFormData(initialFormData)
    // Clear any file input
    const fileInput = document.getElementById('proof_file') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const getStatusColor = (verified: boolean) => {
    return verified ? 'text-green-600' : 'text-yellow-600'
  }

  const getStatusIcon = (verified: boolean) => {
    return verified ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />
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
          <h1 className="text-3xl font-bold text-gray-900">Contributions</h1>
          <p className="text-gray-600">Track monthly member contributions</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Contribution
          </Button>
        )}
      </div>

      {/* Filter Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Filter className="h-4 w-4 text-gray-500" />
            <div className="flex-1">
              <Label htmlFor="filter-month" className="sr-only">Filter by month</Label>
              <Input
                id="filter-month"
                placeholder="Filter by month (e.g., January 2025)"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => setFilterMonth('')}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingContribution ? 'Edit Contribution' : 'Add New Contribution'}</CardTitle>
            <CardDescription>
              {editingContribution ? 'Update contribution information' : 'Record a new member contribution'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="member_id">Member</Label>
                  <select
                    id="member_id"
                    value={formData.member_id}
                    onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                  >
                    <option value="">Select a member</option>
                    {members?.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.full_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="month">Month</Label>
                  <Input
                    id="month"
                    placeholder="e.g., January 2025"
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (ZAR)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_paid">Date Paid</Label>
                  <Input
                    id="date_paid"
                    type="date"
                    value={formData.date_paid}
                    onChange={(e) => setFormData({ ...formData, date_paid: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-4 md:col-span-2">
                  <Label className="text-base font-medium">Proof of Payment *</Label>
                  <p className="text-sm text-gray-600">
                    Please provide proof of payment by either uploading a file or providing a URL
                  </p>
                  
                  {/* File Upload Option */}
                  <div className="space-y-2">
                    <Label htmlFor="proof_file" className="text-sm">Upload File (PDF, JPG, PNG)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="proof_file"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          setFormData({ ...formData, proof_file: file })
                        }}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                      />
                      {formData.proof_file && (
                        <div className="flex items-center text-green-600">
                          <Upload className="h-4 w-4 mr-1" />
                          <span className="text-sm">{formData.proof_file.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* URL Option */}
                  <div className="space-y-2">
                    <Label htmlFor="proof_of_payment" className="text-sm">Or provide URL</Label>
                    <Input
                      id="proof_of_payment"
                      placeholder="URL to proof of payment document"
                      value={formData.proof_of_payment}
                      onChange={(e) => setFormData({ ...formData, proof_of_payment: e.target.value })}
                    />
                  </div>

                  {/* Validation Message */}
                  {!formData.proof_of_payment && !formData.proof_file && (
                    <p className="text-sm text-red-600 flex items-center">
                      <X className="h-4 w-4 mr-1" />
                      Proof of payment is required
                    </p>
                  )}
                  {(formData.proof_of_payment || formData.proof_file) && (
                    <p className="text-sm text-green-600 flex items-center">
                      <Check className="h-4 w-4 mr-1" />
                      Proof of payment provided
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={
                    createContribution.isPending || 
                    updateContribution.isPending || 
                    (!formData.proof_of_payment && !formData.proof_file)
                  }
                >
                  {createContribution.isPending || updateContribution.isPending ? 'Saving...' : 'Save'}
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
        {contributions?.map((contribution) => (
          <Card key={contribution.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${contribution.verified ? 'bg-green-100' : 'bg-yellow-100'}`}>
                    <span className={getStatusColor(contribution.verified)}>
                      {getStatusIcon(contribution.verified)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {contribution.member?.full_name || 'Unknown Member'}
                    </h3>
                    <p className="text-gray-600">{contribution.month}</p>
                    <p className="text-sm text-gray-500">
                      Paid: {formatDate(contribution.date_paid)} • {formatCurrency(contribution.amount)}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-sm ${getStatusColor(contribution.verified)}`}>
                        {contribution.verified ? 'Verified' : 'Pending'}
                      </span>
                      {contribution.proof_of_payment && (
                        <a
                          href={contribution.proof_of_payment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Proof
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={contribution.verified ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleVerify(contribution)}
                    disabled={updateContribution.isPending}
                  >
                    {contribution.verified ? 'Unverify' : 'Verify'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(contribution)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(contribution.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {contributions?.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">
              {filterMonth 
                ? `No contributions found for "${filterMonth}"`
                : 'No contributions found. Add the first contribution to get started.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}