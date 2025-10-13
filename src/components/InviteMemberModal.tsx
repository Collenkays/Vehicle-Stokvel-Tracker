import { useState } from 'react'
import { Check, Copy, Mail, MessageCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Alert, AlertDescription } from './ui/alert'
import {
  useCreateInvitation,
  copyInvitationUrl,
  getInvitationUrl,
  getWhatsAppShareUrl,
} from '../hooks/useInvitations'
import { CreateInvitationData } from '../types/multi-stokvel'

interface InviteMemberModalProps {
  open: boolean
  onClose: () => void
  stokvelId: string
  stokvelName: string
  nextRotationOrder: number
}

export const InviteMemberModal = ({
  open,
  onClose,
  stokvelId,
  stokvelName,
  nextRotationOrder,
}: InviteMemberModalProps) => {
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [copiedSuccess, setCopiedSuccess] = useState(false)
  const [generatedToken, setGeneratedToken] = useState<string | null>(null)

  const [formData, setFormData] = useState<CreateInvitationData>({
    stokvel_id: stokvelId,
    full_name: '',
    email: '',
    contact_number: '',
    role: 'member',
    rotation_order: nextRotationOrder,
  })

  const createInvitation = useCreateInvitation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const invitation = await createInvitation.mutateAsync(formData)
      setGeneratedToken(invitation.token)
      setStep('success')
    } catch (error) {
      console.error('Error creating invitation:', error)
      alert('Failed to create invitation. Please try again.')
    }
  }

  const handleCopyLink = async () => {
    if (!generatedToken) return

    const success = await copyInvitationUrl(generatedToken)
    if (success) {
      setCopiedSuccess(true)
      setTimeout(() => setCopiedSuccess(false), 2000)
    }
  }

  const handleWhatsAppShare = () => {
    if (!generatedToken) return

    const whatsappUrl = getWhatsAppShareUrl(generatedToken, stokvelName)
    window.open(whatsappUrl, '_blank')
  }

  const handleClose = () => {
    setStep('form')
    setGeneratedToken(null)
    setCopiedSuccess(false)
    setFormData({
      stokvel_id: stokvelId,
      full_name: '',
      email: '',
      contact_number: '',
      role: 'member',
      rotation_order: nextRotationOrder,
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {step === 'form' ? (
          <>
            <DialogHeader>
              <DialogTitle>Invite New Member</DialogTitle>
              <DialogDescription>
                Generate a unique invitation link for a new member to join {stokvelName}.
                The link will be valid for 7 days.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  placeholder="e.g. John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="e.g. john@example.com"
                  required
                />
                <p className="text-xs text-gray-500">
                  The member must register/login with this email to accept the invitation
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_number">
                  Contact Number (Optional)
                </Label>
                <Input
                  id="contact_number"
                  type="tel"
                  value={formData.contact_number}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_number: e.target.value })
                  }
                  placeholder="e.g. 0821234567"
                />
                <p className="text-xs text-gray-500">
                  If provided, member can also verify with phone number
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: 'admin' | 'member') =>
                      setFormData({ ...formData, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
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
                    value={formData.rotation_order || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rotation_order: parseInt(e.target.value) || undefined,
                      })
                    }
                    placeholder="e.g. 1"
                  />
                </div>
              </div>

              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  <strong>Security Note:</strong> The invitation link is single-use
                  and expires in 7 days. The member must verify their email/phone
                  matches the invitation.
                </AlertDescription>
              </Alert>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createInvitation.isPending}
                >
                  {createInvitation.isPending
                    ? 'Generating...'
                    : 'Generate Invitation'}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <Check className="h-5 w-5" />
                Invitation Created Successfully!
              </DialogTitle>
              <DialogDescription>
                Share this invitation link with {formData.full_name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Invitation Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={getInvitationUrl(generatedToken!)}
                    readOnly
                    className="bg-gray-50"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                    className="shrink-0"
                  >
                    {copiedSuccess ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {copiedSuccess && (
                  <p className="text-xs text-green-600">
                    Link copied to clipboard!
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Share via</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleWhatsAppShare}
                    className="w-full"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      window.location.href = `mailto:${formData.email}?subject=Invitation to join ${stokvelName}&body=You've been invited to join ${stokvelName}! Click this link to accept: ${getInvitationUrl(generatedToken!)}`
                    }}
                    className="w-full"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-sm space-y-1">
                  <p><strong>Invitation Details:</strong></p>
                  <ul className="list-disc list-inside text-xs space-y-1 text-gray-700">
                    <li>Valid for 7 days from now</li>
                    <li>Single-use only</li>
                    <li>Member must register/login with: {formData.email}</li>
                    <li>Role: {formData.role}</li>
                    {formData.rotation_order && (
                      <li>Rotation order: #{formData.rotation_order}</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter>
              <Button type="button" onClick={handleClose}>
                Done
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
