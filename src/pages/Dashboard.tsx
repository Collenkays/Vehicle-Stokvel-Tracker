import { CreditCard, TrendingUp, AlertCircle, CheckCircle, Calculator, Users, Wallet, Eye, ArrowRight, Grid3X3 } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDashboardStats, useMonthlyContributionTrends, usePayoutHistory } from '../hooks/useDashboard'
import { useUserStokvel, useUserStokvelMemberships, useStokvelSummaries } from '../hooks/useUserStokvels'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { formatCurrency } from '../utils/currency'
import { formatDate } from '../utils/date'
import { getStokvelCardContent, getStokvelTypeDisplayName } from '../utils/stokvelCardContent'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { HelpTooltip } from '../components/HelpTooltip'
import { AdDisplay } from '../components/AdBanner'

// Multi-Stokvel Overview Component
const MultiStokvelOverview = () => {
  const navigate = useNavigate()
  const { data: stokvels = [], isLoading: stokvelsLoading } = useUserStokvelMemberships()
  const { data: summaries = [] } = useStokvelSummaries()

  if (stokvelsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If no stokvels, redirect to My Stokvels
  if (stokvels.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Grid3X3 className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Vehicle Stokvel Tracker</h2>
          <p className="text-gray-600 mb-6">
            You're not part of any stokvels yet. Create your first stokvel or join an existing one to get started.
          </p>
          <Button onClick={() => navigate('/create-stokvel')}>
            Create Your First Stokvel
          </Button>
        </div>
      </div>
    )
  }

  // Calculate aggregate statistics
  const totalMembers = summaries.reduce((sum, s) => sum + s.member_count, 0)
  const totalContributions = summaries.reduce((sum, s) => sum + s.total_verified_contributions, 0)
  const totalPayouts = summaries.reduce((sum, s) => sum + s.total_payouts, 0)
  const totalBalance = totalContributions - totalPayouts

  // Get user's personal contribution stats (assuming we can query this)
  // For now, we'll show aggregate data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Overview of all your stokvel memberships and contributions
        </p>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stokvels</CardTitle>
            <Grid3X3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stokvels.length}</div>
            <p className="text-xs text-muted-foreground">
              {stokvels.filter(s => s.membership_role === 'admin').length} as admin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
            <p className="text-xs text-muted-foreground">
              Across all stokvels
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalContributions)}</div>
            <p className="text-xs text-muted-foreground">
              Verified payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              Across all stokvels
            </p>
          </CardContent>
        </Card>
      </div>

      {/* My Stokvels List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Stokvels</CardTitle>
              <CardDescription>Quick access to all your stokvel memberships</CardDescription>
            </div>
            <Button variant="outline" onClick={() => navigate('/my-stokvels')}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stokvels.map((stokvel) => {
              const summary = summaries.find(s => s.id === stokvel.id)
              const balance = summary
                ? summary.total_verified_contributions - summary.total_payouts
                : 0
              const progress = stokvel.target_amount
                ? (balance / stokvel.target_amount) * 100
                : 0

              return (
                <div
                  key={stokvel.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/stokvel/${stokvel.id}/dashboard`)}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="text-3xl">{stokvel.stokvel_type?.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{stokvel.name}</h3>
                        <Badge variant={stokvel.membership_role === 'admin' ? 'default' : 'secondary'}>
                          {stokvel.membership_role}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{stokvel.stokvel_type?.name}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="flex items-center text-gray-600">
                          <Users className="h-4 w-4 mr-1" />
                          {summary?.member_count || 0} members
                        </span>
                        <span className="flex items-center text-gray-600">
                          <Wallet className="h-4 w-4 mr-1" />
                          {formatCurrency(balance, stokvel.currency)}
                        </span>
                        {stokvel.membership_rotation_order && (
                          <span className="text-gray-600">
                            Position #{stokvel.membership_rotation_order}
                          </span>
                        )}
                      </div>
                      {stokvel.target_amount && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {progress.toFixed(1)}% to target
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Ad Placement */}
      <AdDisplay slot="YOUR_AD_SLOT_1" />
    </div>
  )
}

export const Dashboard = () => {
  const { stokvelId } = useParams<{ stokvelId?: string }>()
  const navigate = useNavigate()
  const { data: stokvel } = useUserStokvel(stokvelId || '')
  const { data: stats, isLoading: statsLoading } = useDashboardStats(stokvelId)
  const { data: monthlyTrends, isLoading: trendsLoading } = useMonthlyContributionTrends(stokvelId)
  const { data: payoutHistory, isLoading: payoutLoading } = usePayoutHistory(stokvelId)

  // If no stokvelId, show multi-stokvel overview
  if (!stokvelId) {
    return <MultiStokvelOverview />
  }

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {stokvel ? `${stokvel.name} Dashboard` : 'Dashboard'}
          </h1>
          <p className="text-gray-600">
            {stokvel ? `Overview of your ${stokvelTypeDisplayName} performance` : 'Overview of your stokvel performance'}
          </p>
        </div>
        {stokvelId && stokvel?.rules.distribution_type === 'vehicle' && (
          <Button
            onClick={() => navigate(`/stokvel/${stokvelId}/fairness`)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Calculator className="h-4 w-4" />
            Fairness Dashboard
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <HelpTooltip content="Total verified contributions minus payouts. Only verified contributions count toward this balance and payout triggers." />
            </div>
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
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">{cardContent.pendingMembersLabel}</CardTitle>
              <HelpTooltip content="Active members who haven't received their payout yet. They're waiting in the rotation queue." />
            </div>
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

      {/* Ad Placement - Above Charts */}
      <AdDisplay slot="YOUR_AD_SLOT_1" />

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