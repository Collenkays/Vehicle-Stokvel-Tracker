import { CreditCard, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { useDashboardStats, useMonthlyContributionTrends, usePayoutHistory } from '../hooks/useDashboard'
import { useUserStokvel } from '../hooks/useUserStokvels'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { formatCurrency } from '../utils/currency'
import { formatDate } from '../utils/date'
import { getStokvelCardContent, getStokvelTypeDisplayName } from '../utils/stokvelCardContent'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

export const Dashboard = () => {
  const { stokvelId } = useParams<{ stokvelId?: string }>()
  const { data: stokvel } = useUserStokvel(stokvelId || '')
  const { data: stats, isLoading: statsLoading } = useDashboardStats(stokvelId)
  const { data: monthlyTrends, isLoading: trendsLoading } = useMonthlyContributionTrends(stokvelId)
  const { data: payoutHistory, isLoading: payoutLoading } = usePayoutHistory(stokvelId)

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Use stokvel's target amount or fallback to 100000 for legacy/no stokvel
  const targetAmount = stokvel?.target_amount || 100000
  const progressToTarget = stats ? (stats.totalBalance / targetAmount) * 100 : 0
  const isTargetReached = stats ? stats.totalBalance >= targetAmount : false

  // Get dynamic card content based on stokvel type
  const cardContent = getStokvelCardContent(stokvel?.rules)
  const stokvelTypeDisplayName = getStokvelTypeDisplayName(stokvel?.rules)
  
  // Extract icon components for JSX
  const PendingMembersIcon = cardContent.pendingMembersIcon
  const CompletedPayoutsIcon = cardContent.completedPayoutsIcon

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {stokvel ? `${stokvel.name} Dashboard` : 'Dashboard'}
        </h1>
        <p className="text-gray-600">
          {stokvel ? `Overview of your ${stokvelTypeDisplayName} performance` : 'Overview of your stokvel performance'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? formatCurrency(stats.totalBalance) : 'Loading...'}
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isTargetReached ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(progressToTarget, 100)}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 whitespace-nowrap">
                {progressToTarget.toFixed(1)}%
              </span>
            </div>
            {targetAmount && (
              <p className="text-xs text-muted-foreground mt-1">
                Target: {formatCurrency(targetAmount)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? formatCurrency(stats.currentMonthContributions) : 'Loading...'}
            </div>
            <p className="text-xs text-muted-foreground">
              Contributions received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{cardContent.pendingMembersLabel}</CardTitle>
            <PendingMembersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? stats.membersWithoutVehicle : 'Loading...'}
            </div>
            <p className="text-xs text-muted-foreground">
              {cardContent.pendingMembersDescription}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{cardContent.completedPayoutsLabel}</CardTitle>
            <CompletedPayoutsIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? stats.completedPayouts : 'Loading...'}
            </div>
            <p className="text-xs text-muted-foreground">
              {cardContent.completedPayoutsDescription}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Next Payout Alert */}
      {stats?.nextPayoutRecipient && (
        <Card className={`${isTargetReached ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}`}>
          <CardHeader>
            <CardTitle className={`flex items-center space-x-2 ${isTargetReached ? 'text-green-900' : 'text-blue-900'}`}>
              {isTargetReached ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span>
                {isTargetReached ? 'Payout Ready!' : cardContent.nextPayoutDescription}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-lg font-semibold ${isTargetReached ? 'text-green-900' : 'text-blue-900'}`}>
                  {stats.nextPayoutRecipient.full_name}
                </h3>
                <p className={`${isTargetReached ? 'text-green-700' : 'text-blue-700'}`}>
                  Rotation Order: {stats.nextPayoutRecipient.rotation_order}
                </p>
                <p className={`text-sm ${isTargetReached ? 'text-green-600' : 'text-blue-600'}`}>
                  Joined: {formatDate(stats.nextPayoutRecipient.join_date)}
                </p>
              </div>
              <div className={`text-right ${isTargetReached ? 'text-green-700' : 'text-blue-700'}`}>
                {isTargetReached ? (
                  <div>
                    <p className="text-sm">Ready for payout</p>
                    <p className="font-semibold">{formatCurrency(targetAmount)}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm">Still needed</p>
                    <p className="font-semibold">
                      {formatCurrency(targetAmount - stats.totalBalance)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Contributions Alert */}
      {stats && stats.pendingContributions > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-yellow-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">
                {stats.pendingContributions} contribution{stats.pendingContributions !== 1 ? 's' : ''} 
                {' '}pending verification
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Contribution Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Contribution Trends</CardTitle>
            <CardDescription>
              Track contribution patterns over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {trendsLoading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    fontSize={12}
                    tickFormatter={(value) => `R${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Amount']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Payout History */}
        <Card>
          <CardHeader>
            <CardTitle>Payout History</CardTitle>
            <CardDescription>
              Recent {cardContent.distributionUnit}s
            </CardDescription>
          </CardHeader>
          <CardContent>
            {payoutLoading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : payoutHistory && payoutHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={payoutHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="memberName" 
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    fontSize={12}
                    tickFormatter={(value) => `R${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Amount']}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <CompletedPayoutsIcon className="h-8 w-8 mx-auto mb-2" />
                  <p>No {cardContent.distributionUnit}s completed yet</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}