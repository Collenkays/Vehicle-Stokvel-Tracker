import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { StokvelLogicEngine, FairnessSummary } from '../services/StokvelLogicEngine'
import { StokvelMember, StokvelContribution, UserStokvel } from '../types/multi-stokvel'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog'
import { formatCurrency } from '../utils/currency'
import { Calculator, TrendingUp, Users, DollarSign, CheckCircle, AlertCircle } from 'lucide-react'

export default function FairnessDashboard() {
  const { stokvelId } = useParams<{ stokvelId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [stokvel, setStokvel] = useState<UserStokvel | null>(null)
  const [members, setMembers] = useState<StokvelMember[]>([])
  const [contributions, setContributions] = useState<StokvelContribution[]>([])
  const [fairnessSummary, setFairnessSummary] = useState<FairnessSummary | null>(null)

  useEffect(() => {
    if (stokvelId) {
      loadStokvelData()
    }
  }, [stokvelId])

  const loadStokvelData = async () => {
    try {
      setLoading(true)
      console.log('Loading fairness data for stokvel:', stokvelId)

      // Load stokvel
      const { data: stokvelData, error: stokvelError } = await supabase
        .from('user_stokvels')
        .select('*')
        .eq('id', stokvelId)
        .single()

      if (stokvelError) {
        console.error('Error loading stokvel:', stokvelError)
        throw stokvelError
      }
      console.log('Loaded stokvel:', stokvelData)
      setStokvel(stokvelData)

      // Load members
      const { data: membersData, error: membersError } = await supabase
        .from('user_stokvel_members')
        .select('*')
        .eq('stokvel_id', stokvelId)
        .order('rotation_order', { ascending: true })

      if (membersError) {
        console.error('Error loading members:', membersError)
        throw membersError
      }
      console.log('Loaded members:', membersData)
      setMembers(membersData || [])

      // Load contributions
      const { data: contributionsData, error: contributionsError } = await supabase
        .from('stokvel_contributions')
        .select('*')
        .eq('stokvel_id', stokvelId)

      if (contributionsError) {
        console.error('Error loading contributions:', contributionsError)
        throw contributionsError
      }
      console.log('Loaded contributions:', contributionsData)
      setContributions(contributionsData || [])

      // Calculate fairness
      if (membersData && contributionsData) {
        console.log('Calculating fairness...')
        const summary = StokvelLogicEngine.calculateFairness(
          membersData,
          contributionsData,
          stokvelData?.target_amount || 100000
        )
        console.log('Fairness summary:', summary)
        setFairnessSummary(summary)
      }
    } catch (error) {
      console.error('Error loading stokvel data:', error)
      alert(`Error loading fairness data: ${error}`)
    } finally {
      console.log('Finished loading, setting loading to false')
      setLoading(false)
    }
  }

  const handleRecalculateFairness = async () => {
    if (!stokvel) return

    setCalculating(true)
    try {
      const summary = StokvelLogicEngine.calculateFairness(
        members,
        contributions,
        stokvel.target_amount || 100000
      )
      setFairnessSummary(summary)

      // Update member records with fairness calculations
      for (const calc of summary.member_calculations) {
        await supabase
          .from('user_stokvel_members')
          .update({
            total_paid: calc.total_paid,
            net_position: calc.net_position,
            adjustment: calc.adjustment
          })
          .eq('id', calc.member_id)
      }

      alert('Fairness calculations updated successfully!')
    } catch (error) {
      console.error('Error recalculating fairness:', error)
      alert('Failed to recalculate fairness')
    } finally {
      setCalculating(false)
    }
  }

  const handleSettleNow = async () => {
    if (!fairnessSummary) return

    setCalculating(true)
    try {
      // Update all member records with final fairness adjustments
      for (const calc of fairnessSummary.member_calculations) {
        await supabase
          .from('user_stokvel_members')
          .update({
            total_paid: calc.total_paid,
            net_position: calc.net_position,
            adjustment: calc.adjustment
          })
          .eq('id', calc.member_id)
      }

      alert('Settlement complete! All members have been updated with their fairness adjustments.')
      loadStokvelData()
    } catch (error) {
      console.error('Error settling fairness:', error)
      alert('Failed to complete settlement')
    } finally {
      setCalculating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading fairness data...</p>
        </div>
      </div>
    )
  }

  if (!stokvel || !fairnessSummary) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-600">No fairness data available</p>
            <Button onClick={() => navigate('/my-stokvels')} className="mt-4 mx-auto block">
              Back to Stokvels
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{stokvel.name} - Fairness Dashboard</h1>
          <p className="text-gray-600 mt-1">Actuarial fairness calculation and settlement</p>
        </div>
        <Button onClick={() => navigate(`/stokvel/${stokvelId}/dashboard`)} variant="outline">
          Back to Dashboard
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pool Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(fairnessSummary.total_pool_collected, stokvel.currency)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vehicles Distributed</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {fairnessSummary.total_vehicles_distributed} / {members.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Net Position</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(fairnessSummary.average_net_position, stokvel.currency)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leftover Pot</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(fairnessSummary.leftover_pot, stokvel.currency)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cycle Status */}
      <Card>
        <CardHeader>
          <CardTitle>Cycle Status</CardTitle>
          <CardDescription>
            {fairnessSummary.cycle_complete
              ? 'All members have received their vehicles. Fairness settlement can be processed.'
              : `${fairnessSummary.total_vehicles_distributed} of ${members.length} members have received vehicles.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fairnessSummary.cycle_complete ? (
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">
                Cycle Complete - Ready for Settlement
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <span className="text-yellow-800 font-medium">
                Cycle In Progress - Settlement available after all members receive vehicles
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Member Fairness Table */}
      <Card>
        <CardHeader>
          <CardTitle>Member Fairness Calculations</CardTitle>
          <CardDescription>
            Actuarial fairness adjustments based on total contributions and payout timing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Member</th>
                  <th className="text-right p-3 font-medium">Month Received</th>
                  <th className="text-right p-3 font-medium">Total Paid</th>
                  <th className="text-right p-3 font-medium">Net Position</th>
                  <th className="text-right p-3 font-medium">Adjustment</th>
                  <th className="text-center p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {fairnessSummary.member_calculations.map((calc) => (
                  <tr key={calc.member_id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{calc.member_name}</td>
                    <td className="p-3 text-right">{calc.month_received || '-'}</td>
                    <td className="p-3 text-right">
                      {formatCurrency(calc.total_paid, stokvel.currency)}
                    </td>
                    <td className="p-3 text-right">
                      <span className={calc.net_position >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(calc.net_position, stokvel.currency)}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className={calc.adjustment >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                        {calc.adjustment >= 0 ? '+' : ''}
                        {formatCurrency(calc.adjustment, stokvel.currency)}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {calc.adjustment >= 0 ? (
                        <Badge variant="default" className="bg-green-600">
                          Receive
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Pay</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Understanding Adjustments</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                <strong>Net Position:</strong> Vehicle value (
                {formatCurrency(stokvel.target_amount || 100000, stokvel.currency)}) minus total
                paid
              </li>
              <li>
                <strong>Positive Adjustment:</strong> Member should receive this amount from the
                fairness pool
              </li>
              <li>
                <strong>Negative Adjustment:</strong> Member should pay this amount into the
                fairness pool
              </li>
              <li>
                <strong>Formula:</strong> Adjustment = Average Net Position - Member Net Position
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Settlement Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Settlement Actions</CardTitle>
          <CardDescription>
            Process fairness adjustments and finalize the stokvel cycle
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button onClick={handleRecalculateFairness} disabled={calculating} variant="outline">
              <Calculator className="mr-2 h-4 w-4" />
              Recalculate Fairness
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={!fairnessSummary.cycle_complete || calculating}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Settle Now
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Settlement</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will finalize fairness adjustments for all members. Members with positive
                    adjustments will receive payments, and members with negative adjustments will
                    need to make payments. Are you sure you want to proceed?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSettleNow}>
                    Confirm Settlement
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {!fairnessSummary.cycle_complete && (
            <p className="text-sm text-gray-600">
              Settlement will be available once all members have received their vehicles.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
