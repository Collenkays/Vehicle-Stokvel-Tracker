import { useState, useEffect } from 'react'
import { useUpdateStokvelRuleSettings, getStokvelRuleSettings } from '@/hooks/useStokvelSettings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Clock, AlertCircle, CheckCircle2, Shield } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatCurrency } from '@/utils/currency'

interface ContributionRulesTabProps {
  stokvel: any
  stokvelId: string
}

export const ContributionRulesTab = ({ stokvel, stokvelId }: ContributionRulesTabProps) => {
  const updateRuleSettings = useUpdateStokvelRuleSettings()
  const ruleSettings = getStokvelRuleSettings(stokvel)

  const [rulesData, setRulesData] = useState(ruleSettings)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (stokvel) {
      setRulesData(getStokvelRuleSettings(stokvel))
    }
  }, [stokvel])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    try {
      await updateRuleSettings.mutateAsync({
        stokvelId,
        settings: rulesData,
      })
      setMessage({
        type: 'success',
        text: 'Contribution rules updated successfully!',
      })
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to update contribution rules',
      })
    }
  }

  const handleToggle = (field: keyof typeof rulesData) => {
    setRulesData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Contribution Rules</span>
          </CardTitle>
          <CardDescription>
            Configure payment rules and penalties for this stokvel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            {/* Joining Fee */}
            <div className="space-y-2">
              <Label htmlFor="joining-fee" className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>Joining Fee</span>
              </Label>
              <Input
                id="joining-fee"
                type="number"
                min="0"
                step="0.01"
                value={rulesData.joining_fee}
                onChange={(e) =>
                  setRulesData({ ...rulesData, joining_fee: parseFloat(e.target.value) || 0 })
                }
              />
              <p className="text-sm text-gray-500">
                One-time fee charged when a new member joins (Current:{' '}
                {formatCurrency(rulesData.joining_fee, stokvel.currency)})
              </p>
            </div>

            {/* Grace Period */}
            <div className="space-y-2">
              <Label htmlFor="grace-period" className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Grace Period (Days)</span>
              </Label>
              <Input
                id="grace-period"
                type="number"
                min="0"
                max="30"
                value={rulesData.grace_period_days}
                onChange={(e) =>
                  setRulesData({
                    ...rulesData,
                    grace_period_days: parseInt(e.target.value) || 0,
                  })
                }
              />
              <p className="text-sm text-gray-500">
                Number of days before late payment penalties apply
              </p>
            </div>

            {/* Late Payment Penalty */}
            <div className="space-y-2">
              <Label htmlFor="penalty-rate" className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4" />
                <span>Late Payment Penalty Rate (%)</span>
              </Label>
              <Input
                id="penalty-rate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={rulesData.late_payment_penalty_rate}
                onChange={(e) =>
                  setRulesData({
                    ...rulesData,
                    late_payment_penalty_rate: parseFloat(e.target.value) || 0,
                  })
                }
              />
              <p className="text-sm text-gray-500">
                Percentage penalty applied to late contributions (0-100%)
              </p>
            </div>

            {/* Payment Verification Required */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 mt-0.5 text-gray-600" />
                <div>
                  <Label className="text-base font-medium">Require Payment Verification</Label>
                  <p className="text-sm text-gray-500">
                    Members must upload proof of payment for contributions
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant={rulesData.require_payment_verification ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleToggle('require_payment_verification')}
              >
                {rulesData.require_payment_verification ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className="pt-4 border-t">
              <Button type="submit" disabled={updateRuleSettings.isPending}>
                {updateRuleSettings.isPending ? 'Saving...' : 'Save Rules'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-base">Current Rules Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Joining Fee:</span>
            <span className="font-medium">
              {formatCurrency(rulesData.joining_fee, stokvel.currency)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Grace Period:</span>
            <span className="font-medium">{rulesData.grace_period_days} days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Late Penalty:</span>
            <span className="font-medium">{rulesData.late_payment_penalty_rate}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Payment Verification:</span>
            <span className="font-medium">
              {rulesData.require_payment_verification ? 'Required' : 'Optional'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
