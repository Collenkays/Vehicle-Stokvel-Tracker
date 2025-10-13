import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Check, X, Filter, FileText, Upload } from 'lucide-react'
import { useContributions, useCreateContribution, useUpdateContribution, useDeleteContribution } from '../hooks/useContributions'
import { useStokvelMembers } from '../hooks/useMembers'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Contribution } from '../types'
import { formatCurrency } from '../utils/currency'
import { formatDate, getCurrentMonth } from '../utils/date'
import { uploadProofOfPayment, deleteProofOfPayment } from '../lib/storage'
import { supabase } from '../lib/supabase'

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
  const { stokvelId } = useParams<{ stokvelId: string }>()
  const [showForm, setShowForm] = useState(false)
  const [editingContribution, setEditingContribution] = useState<Contribution | null>(null)
  const [formData, setFormData] = useState<ContributionFormData>(initialFormData)
  const [filterMonth, setFilterMonth] = useState('')

  const { data: contributions, isLoading } = useContributions(stokvelId, filterMonth)
  const { data: members } = useStokvelMembers(stokvelId)
  const createContribution = useCreateContribution()
  const updateContribution = useUpdateContribution()
  const deleteContribution = useDeleteContribution()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stokvelId) {
      alert('No stokvel selected')
      return
    }

    // Validate member_id exists
    if (!formData.member_id) {
      alert('Please select a member')
      return
    }

    // Validate that the selected member exists in the members list
    const memberExists = members?.some(m => m.id === formData.member_id)
    if (!memberExists) {
      alert('Invalid member selected. Please refresh the page and try again.')
      console.error('Member ID not found in members list:', formData.member_id)
      console.log('Available members:', members)
      return
    }

    // CRITICAL: Verify the member exists in the database before proceeding
    try {
      const { data: verifyMember, error: verifyError } = await supabase
        .from('user_stokvel_members')
        .select('id, full_name, stokvel_id')
        .eq('id', formData.member_id)
        .eq('stokvel_id', stokvelId)
        .single()

      if (verifyError || !verifyMember) {
        console.error('Database verification failed:', verifyError)
        console.error('Looking for member ID:', formData.member_id, 'in stokvel:', stokvelId)
        alert('Error: The selected member could not be verified in the database. This member may have been deleted. Please refresh the page and try again.')
        return
      }

      console.log('Member verified in database:', verifyMember)
    } catch (verifyError) {
      console.error('Verification query failed:', verifyError)
      alert('Error: Could not verify member in database. Please try again.')
      return
    }

    // Validate that either proof_of_payment URL or proof_file is provided
    if (!formData.proof_of_payment && !formData.proof_file) {
      alert('Please provide proof of payment either as a URL or by uploading a file.')
      return
    }

    // Check for duplicate contribution (same member + month)
    if (!editingContribution) {
      const isDuplicate = contributions?.some(
        c => c.member_id === formData.member_id && c.month === formData.month
      )

      if (isDuplicate) {
        const memberName = members?.find(m => m.id === formData.member_id)?.full_name
        alert(`A contribution for ${memberName} already exists for ${formData.month}. Please edit the existing contribution instead of creating a new one.`)
        return
      }
    }

    try {
      let proofUrl = formData.proof_of_payment
      let uploadedFileUrl: string | null = null

      // If a file is uploaded, upload it to Supabase Storage
      if (formData.proof_file) {
        try {
          console.log('Uploading file:', formData.proof_file.name)
          uploadedFileUrl = await uploadProofOfPayment(
            formData.proof_file,
            stokvelId,
            formData.member_id
          )
          proofUrl = uploadedFileUrl
          console.log('File uploaded successfully:', proofUrl)
        } catch (uploadError: any) {
          console.error('File upload failed:', uploadError)
          alert(`Failed to upload file: ${uploadError.message}`)
          return
        }
      }

      const submitData = {
        stokvel_id: stokvelId,
        member_id: formData.member_id,
        month: formData.month,
        amount: formData.amount,
        date_paid: formData.date_paid,
        proof_of_payment: proofUrl,
      }

      console.log('=== CONTRIBUTION SAVE DEBUG ===')
      console.log('Stokvel ID:', stokvelId)
      console.log('Member ID being saved:', formData.member_id)
      console.log('Selected member name:', members?.find(m => m.id === formData.member_id)?.full_name)
      console.log('All available members:', members?.map(m => ({
        id: m.id,
        name: m.full_name,
        member_id: m.member_id,
        email: m.email
      })))
      console.log('Submit data:', submitData)

      // Additional validation - verify the member exists in the current stokvel
      const selectedMember = members?.find(m => m.id === formData.member_id)
      if (!selectedMember) {
        console.error('CRITICAL: Selected member not found in members list!')
        console.error('Looking for ID:', formData.member_id)
        console.error('Available IDs:', members?.map(m => m.id))
        alert('Error: The selected member could not be found. Please refresh the page and try again.')
        return
      }
      console.log('Selected member details:', selectedMember)
      console.log('=== END DEBUG ===')

      try {
        if (editingContribution) {
          await updateContribution.mutateAsync({
            id: editingContribution.id,
            ...submitData,
          })
        } else {
          await createContribution.mutateAsync(submitData)
        }

        // Success - clear form and close
        setShowForm(false)
        setEditingContribution(null)
        setFormData(initialFormData)

        // Clear file input
        const fileInput = document.getElementById('proof_file') as HTMLInputElement
        if (fileInput) {
          fileInput.value = ''
        }
      } catch (dbError: any) {
        // If contribution insert fails but file was uploaded, clean up the file
        if (uploadedFileUrl) {
          try {
            await deleteProofOfPayment(uploadedFileUrl)
            console.log('Cleaned up uploaded file after database error')
          } catch (cleanupError) {
            console.error('Failed to clean up uploaded file:', cleanupError)
          }
        }

        // Re-throw the error to be handled by outer catch
        throw dbError
      }
    } catch (error: any) {
      console.error('Error saving contribution:', error)

      // Handle specific error messages
      if (error?.code === '23505' || error?.message?.includes('duplicate') || error?.message?.includes('409')) {
        const memberName = members?.find(m => m.id === formData.member_id)?.full_name
        alert(`A contribution for ${memberName} already exists for ${formData.month}. Please edit the existing contribution instead.`)
      } else if (error?.code === '23503' || error?.message?.includes('foreign key') || error?.message?.includes('fkey')) {
        const memberName = members?.find(m => m.id === formData.member_id)?.full_name || 'selected member'
        alert(`Database error: The ${memberName} record is invalid or has been deleted. Please refresh the page and try again.`)
      } else {
        alert(`Failed to save contribution: ${error?.message || 'Unknown error'}`)
      }
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
                    {members && members.length > 0 ? (
                      members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.full_name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No members found - please add members first</option>
                    )}
                  </select>
                  {members && members.length === 0 && (
                    <p className="text-sm text-red-600">
                      No members in this stokvel. Please add members in the Members page before recording contributions.
                    </p>
                  )}
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