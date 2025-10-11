import { useState, useEffect } from 'react'
import { useUpdateStokvelRuleSettings, getStokvelRuleSettings } from '@/hooks/useStokvelSettings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, AlertTriangle, TrendingUp, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatCurrency } from '@/utils/currency'

interface PayoutConfigTabProps {
  stokvel: any
  stokvelId: string
}

export const PayoutConfigTab = ({ stokvel, stokvelId }: PayoutConfigTabProps) => {
  const updateRuleSettings = useUpdateStokvelRuleSettings()
  const ruleSettings = getStokvelRuleSettings(stokvel)

  const [payoutData, setPayoutData] = useState(ruleSettings)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (stokvel) {
      setPayoutData(getStokvelRuleSettings(stokvel))
    }
  }, [stokvel])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    try {
      await updateRuleSettings.mutateAsync({
        stokvelId,
        settings: {
          allow_emergency_withdrawals: payoutData.allow_emergency_withdrawals,
          emergency_withdrawal_limit: payoutData.emergency_withdrawal_limit,
          minimum_rollover_balance: payoutData.minimum_rollover_balance,
        },
      })
      setMessage({
        type: 'success',
        text: 'Payout configuration updated successfully!',
      })
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to update payout configuration',
      })
    }
  }

  const handleToggle = () => {
    setPayoutData((prev) => ({
      ...prev,
      allow_emergency_withdrawals: !prev.allow_emergency_withdrawals,
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
            <Wallet className="h-5 w-5" />
            <span>Payout Configuration</span>
          </CardTitle>
          <CardDescription>
            Configure payout triggers and distribution rules for this stokvel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            {/* Payout Trigger Info (Read-only from stokvel type) */}
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-base">Payout Trigger Rules</CardTitle>
                <CardDescription className="text-xs">
                  These rules are defined by the stokvel type and cannot be changed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Trigger Type:</span>
                  <span className="font-medium">{stokvel.rules?.payout_trigger || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Distribution Type:</span>
                  <span className="font-medium">{stokvel.rules?.distribution_type || 'N/A'}</span>
                </div>
                {stokvel.target_amount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Target Amount:</span>
                    <span className="font-medium">
                      {formatCurrency(stokvel.target_amount, stokvel.currency)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Rotation Based:</span>
                  <span className="font-medium">
                    {stokvel.rules?.rotation_based ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Allow Rollover:</span>
                  <span className="font-medium">
                    {stokvel.rules?.allow_rollover ? 'Yes' : 'No'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Minimum Rollover Balance */}
            <div className="space-y-2">
              <Label htmlFor="min-rollover" className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Minimum Rollover Balance</span>
              </Label>
              <Input
                id="min-rollover"
                type="number"
                min="0"
                step="0.01"
                value={payoutData.minimum_rollover_balance}
                onChange={(e) =>
                  setPayoutData({
                    ...payoutData,
                    minimum_rollover_balance: parseFloat(e.target.value) || 0,
                  })
                }
              />
              <p className="text-sm text-gray-500">
                Minimum balance to maintain in the stokvel after payouts
              </p>
            </div>

            {/* Emergency Withdrawals Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 mt-0.5 text-orange-600" />
                <div>
                  <Label className="text-base font-medium">Allow Emergency Withdrawals</Label>
                  <p className="text-sm text-gray-500">
                    Enable members to request emergency withdrawals from the fund
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant={payoutData.allow_emergency_withdrawals ? 'default' : 'outline'}
                size="sm"
                onClick={handleToggle}
              >
                {payoutData.allow_emergency_withdrawals ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            {/* Emergency Withdrawal Limit (shown only if enabled) */}
            {payoutData.allow_emergency_withdrawals && (
              <div className="space-y-2 ml-8">
                <Label htmlFor="emergency-limit" className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Emergency Withdrawal Limit</span>
                </Label>
                <Input
                  id="emergency-limit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={payoutData.emergency_withdrawal_limit}
                  onChange={(e) =>
                    setPayoutData({
                      ...payoutData,
                      emergency_withdrawal_limit: parseFloat(e.target.value) || 0,
                    })
                  }
                />
                <p className="text-sm text-gray-500">
                  Maximum amount allowed for emergency withdrawals
                </p>
              </div>
            )}

            <div className="pt-4 border-t">
              <Button type="submit" disabled={updateRuleSettings.isPending}>
                {updateRuleSettings.isPending ? 'Saving...' : 'Save Configuration'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Current Configuration Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base">Current Payout Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Minimum Rollover:</span>
            <span className="font-medium">
              {formatCurrency(payoutData.minimum_rollover_balance, stokvel.currency)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Emergency Withdrawals:</span>
            <span className="font-medium">
              {payoutData.allow_emergency_withdrawals ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          {payoutData.allow_emergency_withdrawals && (
            <div className="flex justify-between">
              <span className="text-gray-600">Emergency Limit:</span>
              <span className="font-medium">
                {formatCurrency(payoutData.emergency_withdrawal_limit, stokvel.currency)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
