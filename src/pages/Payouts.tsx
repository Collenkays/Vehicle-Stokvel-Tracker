import { useState, useEffect } from 'react'
import { Car, AlertCircle, CheckCircle, Plus, Calendar, Calculator } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePayouts, useGeneratePayout, useCompletePayout, useDeletePayout } from '../hooks/usePayouts'
import { useNextPayoutRecipient } from '../hooks/useMembers'
import { supabase } from '../lib/supabase'
import { StokvelMember } from '../types/multi-stokvel'
import { StokvelLogicEngine } from '../services/StokvelLogicEngine'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { formatCurrency } from '../utils/currency'
import { formatDate } from '../utils/date'

export const Payouts = () => {
  const { stokvelId } = useParams<{ stokvelId?: string }>()
  const navigate = useNavigate()
  const [isGenerating, setIsGenerating] = useState(false)
  const [members, setMembers] = useState<StokvelMember[]>([])

  const { data: payouts, isLoading } = usePayouts()
  const { data: nextRecipient } = useNextPayoutRecipient()
  const generatePayout = useGeneratePayout()
  const completePayout = useCompletePayout()
  const deletePayout = useDeletePayout()

  // Fetch members for the stokvel if stokvelId is provided
  useEffect(() => {
    if (stokvelId) {
      supabase
        .from('user_stokvel_members')
        .select('*')
        .eq('stokvel_id', stokvelId)
        .then(({ data }) => {
          if (data) setMembers(data)
        })
    }
  }, [stokvelId])

  // Check if fairness calculation should be triggered
  const shouldShowFairnessAlert = members.length > 0 && StokvelLogicEngine.shouldTriggerFairnessCalculation(members)

  const handleGeneratePayout = async () => {
    if (!window.confirm('Are you sure you want to generate a new payout? This will create a payout for the next member in rotation.')) {
      return
    }

    setIsGenerating(true)
    try {
      await generatePayout.mutateAsync()
    } catch (error: any) {
      alert(error.message || 'Failed to generate payout')
    }
    setIsGenerating(false)
  }

  const handleCompletePayout = async (payoutId: string) => {
    if (!window.confirm('Are you sure you want to complete this payout? This will mark the member as having received their vehicle.')) {
      return
    }

    try {
      await completePayout.mutateAsync(payoutId)
    } catch (error: any) {
      alert(error.message || 'Failed to complete payout')
    }
  }

  const handleDeletePayout = async (payoutId: string) => {
    if (!window.confirm('Are you sure you want to delete this payout? This action cannot be undone.')) {
      return
    }

    try {
      await deletePayout.mutateAsync(payoutId)
    } catch (error: any) {
      alert(error.message || 'Failed to delete payout')
    }
  }

  const getStatusColor = (status: string) => {
    return status === 'completed' ? 'text-green-600' : 'text-yellow-600'
  }

  const getStatusIcon = (status: string) => {
    return status === 'completed' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />
  }

  const getStatusBg = (status: string) => {
    return status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
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
          <h1 className="text-3xl font-bold text-gray-900">Payouts</h1>
          <p className="text-gray-600">Manage vehicle payouts and rotations</p>
        </div>
        <Button 
          onClick={handleGeneratePayout}
          disabled={isGenerating || generatePayout.isPending}
        >
          <Plus className="mr-2 h-4 w-4" />
          {isGenerating || generatePayout.isPending ? 'Generating...' : 'Generate Payout'}
        </Button>
      </div>

      {/* Fairness Calculation Alert */}
      {shouldShowFairnessAlert && stokvelId && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-green-900 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Cycle Complete - Fairness Settlement Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-800 mb-2">
                  All members have received their vehicles! You can now calculate and process fairness adjustments.
                </p>
                <p className="text-sm text-green-700">
                  Fairness calculation ensures that members who contributed more (early recipients) receive compensation from those who contributed less (late recipients).
                </p>
              </div>
              <Button
                onClick={() => navigate(`/stokvel/${stokvelId}/fairness`)}
                className="ml-4 flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Calculator className="h-4 w-4" />
                View Fairness Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Recipient Card */}
      {nextRecipient && !shouldShowFairnessAlert && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-blue-900">Next Payout Recipient</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="bg-blue-200 p-3 rounded-full">
                <Car className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900">
                  {nextRecipient.full_name}
                </h3>
                <p className="text-blue-700">
                  Rotation Order: {nextRecipient.rotation_order}
                </p>
                <p className="text-sm text-blue-600">
                  Joined: {formatDate(nextRecipient.join_date)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payouts List */}
      <div className="grid gap-4">
        {payouts?.map((payout) => (
          <Card key={payout.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${getStatusBg(payout.status)}`}>
                    <span className={getStatusColor(payout.status)}>
                      {getStatusIcon(payout.status)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {payout.member?.full_name || 'Unknown Member'}
                    </h3>
                    <p className="text-gray-600 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {payout.month_paid}
                    </p>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-500">
                        Payout Amount: <span className="font-medium text-gray-900">
                          {formatCurrency(payout.amount_paid)}
                        </span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Vehicle Value: <span className="font-medium text-gray-900">
                          {formatCurrency(payout.vehicle_value)}
                        </span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Rollover Balance: <span className="font-medium text-gray-900">
                          {formatCurrency(payout.rollover_balance)}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center mt-2">
                      <span className={`text-sm font-medium ${getStatusColor(payout.status)}`}>
                        {payout.status === 'completed' ? 'Completed' : 'Pending'}
                      </span>
                      <span className="text-gray-400 mx-2">•</span>
                      <span className="text-sm text-gray-500">
                        Created: {formatDate(payout.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {payout.status === 'pending' && (
                    <Button
                      onClick={() => handleCompletePayout(payout.id)}
                      disabled={completePayout.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Complete Payout
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => handleDeletePayout(payout.id)}
                    disabled={deletePayout.isPending}
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

      {payouts?.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Payouts Yet</h3>
            <p className="text-gray-500 mb-4">
              No payouts have been generated yet. Click "Generate Payout" when the balance reaches R100,000.
            </p>
            {nextRecipient && (
              <p className="text-sm text-gray-600">
                Next recipient: <span className="font-medium">{nextRecipient.full_name}</span>
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {generatePayout.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">
                {(generatePayout.error as Error).message}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}