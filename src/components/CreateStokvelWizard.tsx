import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { ArrowLeft, ArrowRight, Check, Plus, X } from 'lucide-react'
import { useStokvelTypes } from '../hooks/useStokvelTypes'
import { useCreateStokvel } from '../hooks/useUserStokvels'
import { CreateStokvelData, StokvelType } from '../types/multi-stokvel'

const WIZARD_STEPS = [
  { id: 1, title: 'Choose Type', description: 'Select the type of stokvel' },
  { id: 2, title: 'Basic Info', description: 'Name and describe your stokvel' },
  { id: 3, title: 'Contribution Rules', description: 'Set contribution and payout rules' },
  { id: 4, title: 'Members (Optional)', description: 'Add initial members' },
  { id: 5, title: 'Review & Create', description: 'Review and create your stokvel' },
]

interface WizardMember {
  full_name: string
  email: string
  contact_number?: string
  role: 'admin' | 'member'
}

export const CreateStokvelWizard = () => {
  const navigate = useNavigate()
  const { data: stokvelTypes = [] } = useStokvelTypes()
  const createStokvel = useCreateStokvel()

  const [currentStep, setCurrentStep] = useState(1)
  const [selectedType, setSelectedType] = useState<StokvelType | null>(null)
  const [formData, setFormData] = useState<Partial<CreateStokvelData>>({
    currency: 'ZAR',
    start_date: new Date().toISOString().split('T')[0],
    initial_members: [],
  })
  const [newMember, setNewMember] = useState<WizardMember>({
    full_name: '',
    email: '',
    contact_number: '',
    role: 'member',
  })

  const progressPercentage = (currentStep / WIZARD_STEPS.length) * 100

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleTypeSelection = (type: StokvelType) => {
    setSelectedType(type)
    setFormData(prev => ({
      ...prev,
      stokvel_type_id: type.id,
      rules: type.rules_template,
      target_amount: type.rules_template.target_amount,
    }))
  }

  const handleFormChange = (field: keyof CreateStokvelData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addMember = () => {
    if (newMember.full_name && newMember.email) {
      setFormData(prev => ({
        ...prev,
        initial_members: [...(prev.initial_members || []), newMember],
      }))
      setNewMember({ full_name: '', email: '', contact_number: '', role: 'member' })
    }
  }

  const removeMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      initial_members: prev.initial_members?.filter((_, i) => i !== index) || [],
    }))
  }

  const handleSubmit = async () => {
    if (!selectedType || !formData.name || !formData.monthly_contribution) {
      return
    }

    try {
      await createStokvel.mutateAsync({
        stokvel_type_id: selectedType.id,
        name: formData.name!,
        description: formData.description,
        monthly_contribution: formData.monthly_contribution!,
        target_amount: formData.target_amount,
        currency: formData.currency!,
        start_date: formData.start_date!,
        rules: formData.rules!,
        initial_members: formData.initial_members,
      })
      navigate('/my-stokvels')
    } catch (error) {
      console.error('Error creating stokvel:', error)
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return !!selectedType
      case 2:
        return !!(formData.name && formData.description)
      case 3:
        return !!(formData.monthly_contribution && formData.start_date)
      case 4:
        return true // Optional step
      case 5:
        return true
      default:
        return false
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Choose Your Stokvel Type</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {stokvelTypes.map((type) => (
                <Card
                  key={type.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedType?.id === type.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleTypeSelection(type)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{type.icon}</span>
                      <CardTitle className="text-base">{type.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">
                      {type.description}
                    </CardDescription>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {type.rules_template.frequency}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {type.rules_template.distribution_type}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Stokvel Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="e.g., Family Vehicle Fund"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="Describe the purpose and goals of your stokvel"
                  rows={3}
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contribution Rules</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="monthly_contribution">Monthly Contribution (ZAR) *</Label>
                <Input
                  id="monthly_contribution"
                  type="number"
                  value={formData.monthly_contribution || ''}
                  onChange={(e) => handleFormChange('monthly_contribution', parseFloat(e.target.value))}
                  placeholder="3500"
                />
              </div>
              {selectedType?.rules_template.target_amount && (
                <div>
                  <Label htmlFor="target_amount">Target Amount (ZAR)</Label>
                  <Input
                    id="target_amount"
                    type="number"
                    value={formData.target_amount || ''}
                    onChange={(e) => handleFormChange('target_amount', parseFloat(e.target.value))}
                    placeholder="100000"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date || ''}
                  onChange={(e) => handleFormChange('start_date', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  value={formData.currency || 'ZAR'}
                  onChange={(e) => handleFormChange('currency', e.target.value)}
                  placeholder="ZAR"
                />
              </div>
            </div>
            {selectedType && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Rules for {selectedType.name}:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Payout trigger: {selectedType.rules_template.payout_trigger.replace('_', ' ')}</li>
                  <li>• Distribution type: {selectedType.rules_template.distribution_type.replace('_', ' ')}</li>
                  <li>• Frequency: {selectedType.rules_template.frequency}</li>
                  {selectedType.rules_template.rotation_based && (
                    <li>• Rotation-based payouts</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Add Initial Members (Optional)</h3>
            
            {/* Add Member Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Add New Member</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="member_name">Full Name</Label>
                    <Input
                      id="member_name"
                      value={newMember.full_name}
                      onChange={(e) => setNewMember(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Member's full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="member_email">Email</Label>
                    <Input
                      id="member_email"
                      type="email"
                      value={newMember.email}
                      onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="member@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="member_phone">Phone (Optional)</Label>
                    <Input
                      id="member_phone"
                      value={newMember.contact_number}
                      onChange={(e) => setNewMember(prev => ({ ...prev, contact_number: e.target.value }))}
                      placeholder="+27 123 456 789"
                    />
                  </div>
                  <div>
                    <Label htmlFor="member_role">Role</Label>
                    <select
                      id="member_role"
                      value={newMember.role}
                      onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value as 'admin' | 'member' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <Button onClick={addMember} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </CardContent>
            </Card>

            {/* Members List */}
            {formData.initial_members && formData.initial_members.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Added Members ({formData.initial_members.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {formData.initial_members.map((member, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{member.full_name}</div>
                          <div className="text-sm text-gray-600">{member.email}</div>
                          <Badge variant={member.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                            {member.role}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMember(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Review & Create</h3>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>{selectedType?.icon}</span>
                  <span>{formData.name}</span>
                </CardTitle>
                <CardDescription>{formData.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="font-medium">Type</Label>
                    <p className="text-sm text-gray-600">{selectedType?.name}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Monthly Contribution</Label>
                    <p className="text-sm text-gray-600">{formData.currency} {formData.monthly_contribution?.toLocaleString()}</p>
                  </div>
                  {formData.target_amount && (
                    <div>
                      <Label className="font-medium">Target Amount</Label>
                      <p className="text-sm text-gray-600">{formData.currency} {formData.target_amount?.toLocaleString()}</p>
                    </div>
                  )}
                  <div>
                    <Label className="font-medium">Start Date</Label>
                    <p className="text-sm text-gray-600">{formData.start_date}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Initial Members</Label>
                    <p className="text-sm text-gray-600">{formData.initial_members?.length || 0} members</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/my-stokvels')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Stokvels
          </Button>
          <h1 className="text-3xl font-bold">Create New Stokvel</h1>
          <p className="text-gray-600 mt-2">Follow the steps below to set up your stokvel</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            {WIZARD_STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    currentStep > step.id
                      ? 'bg-green-500 text-white'
                      : currentStep === step.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    step.id
                  )}
                </div>
                {index < WIZARD_STEPS.length - 1 && (
                  <div className="w-12 h-0.5 bg-gray-200 mx-2" />
                )}
              </div>
            ))}
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="mt-2 text-sm text-gray-600">
            Step {currentStep} of {WIZARD_STEPS.length}: {WIZARD_STEPS[currentStep - 1]?.title}
          </div>
        </div>

        {/* Content */}
        <Card className="mb-8">
          <CardContent className="p-6">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          {currentStep === WIZARD_STEPS.length ? (
            <Button
              onClick={handleSubmit}
              disabled={!isStepValid() || createStokvel.isPending}
            >
              {createStokvel.isPending ? 'Creating...' : 'Create Stokvel'}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}