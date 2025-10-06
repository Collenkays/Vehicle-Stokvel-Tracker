import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Plus, Users, TrendingUp, Calendar, Eye, Settings, Archive, Trash2, MoreVertical } from 'lucide-react'
import { useUserStokvels, useDeleteStokvel } from '../hooks/useUserStokvels'
import { useStokvelSummaries } from '../hooks/useUserStokvels'
import { StokvelWithType, StokvelSummary } from '../types/multi-stokvel'
import { formatCurrency } from '../utils/currency'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog'

const StokvelCard = ({ 
  stokvel, 
  summary, 
  onView,
  onDelete,
  onSettings
}: { 
  stokvel: StokvelWithType
  summary?: StokvelSummary
  onView: (id: string) => void 
  onDelete: (id: string, name: string) => void
  onSettings: (id: string) => void
}) => {
  const balance = summary 
    ? summary.total_verified_contributions - summary.total_payouts
    : 0

  const progress = stokvel.target_amount 
    ? (balance / stokvel.target_amount) * 100 
    : 0

  const getStatusColor = () => {
    if (!stokvel.is_active) return 'bg-gray-500'
    if (stokvel.target_amount && balance >= stokvel.target_amount) return 'bg-green-500'
    if (progress > 75) return 'bg-blue-500'
    if (progress > 50) return 'bg-yellow-500'
    return 'bg-orange-500'
  }

  const getStatusText = () => {
    if (!stokvel.is_active) return 'Inactive'
    if (stokvel.target_amount && balance >= stokvel.target_amount) return 'Target Reached'
    if (progress > 75) return 'Nearly There'
    if (progress > 50) return 'On Track'
    return 'Building Up'
  }

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{stokvel.stokvel_type?.icon}</span>
            <div>
              <CardTitle className="text-lg">{stokvel.name}</CardTitle>
              <CardDescription className="text-sm">
                {stokvel.stokvel_type?.name}
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className={`text-white ${getStatusColor()}`}>
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 line-clamp-2">
          {stokvel.description || stokvel.stokvel_type?.description}
        </p>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="flex items-center space-x-1 text-gray-500">
              <Users className="h-4 w-4" />
              <span>Members</span>
            </div>
            <div className="font-semibold">{summary?.member_count || 0}</div>
          </div>
          <div>
            <div className="flex items-center space-x-1 text-gray-500">
              <TrendingUp className="h-4 w-4" />
              <span>Balance</span>
            </div>
            <div className="font-semibold">
              {formatCurrency(balance, stokvel.currency)}
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1 text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>Monthly</span>
            </div>
            <div className="font-semibold">
              {formatCurrency(stokvel.monthly_contribution, stokvel.currency)}
            </div>
          </div>
          {stokvel.target_amount && (
            <div>
              <div className="flex items-center space-x-1 text-gray-500">
                <span>Target</span>
              </div>
              <div className="font-semibold">
                {formatCurrency(stokvel.target_amount, stokvel.currency)}
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar for target-based stokvels */}
        {stokvel.target_amount && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to target</span>
              <span>{Math.min(progress, 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${getStatusColor()}`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Frequency Badge */}
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {stokvel.rules.frequency}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {stokvel.rules.distribution_type.replace('_', ' ')}
          </Badge>
          {stokvel.rules.rotation_based && (
            <Badge variant="outline" className="text-xs">
              rotation-based
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => onView(stokvel.id)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-1" />
            View Dashboard
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onSettings(stokvel.id)}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onSettings(stokvel.id)}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem 
                    className="text-red-600 focus:text-red-600"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Stokvel
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Stokvel</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{stokvel.name}"? This action will deactivate the stokvel and cannot be undone. All data will be preserved but the stokvel will no longer be active.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(stokvel.id, stokvel.name)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete Stokvel
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}

export const MyStokvels = () => {
  const navigate = useNavigate()
  const { data: stokvels = [], isLoading } = useUserStokvels()
  const { data: summaries = [] } = useStokvelSummaries()
  const deleteStokvel = useDeleteStokvel()
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const filteredStokvels = stokvels.filter(stokvel => {
    if (filter === 'active') return stokvel.is_active
    if (filter === 'inactive') return !stokvel.is_active
    return true
  })

  const getSummaryForStokvel = (stokvelId: string) => {
    return summaries.find(s => s.id === stokvelId)
  }

  const handleViewStokvel = (stokvelId: string) => {
    navigate(`/stokvel/${stokvelId}/dashboard`)
  }

  const handleDeleteStokvel = async (stokvelId: string, _stokvelName: string) => {
    try {
      await deleteStokvel.mutateAsync(stokvelId)
      // Success feedback would be handled by the mutation onSuccess
    } catch (error) {
      console.error('Error deleting stokvel:', error)
      // Error feedback would be handled by the mutation onError
    }
  }

  const handleStokvelSettings = (stokvelId: string) => {
    navigate(`/stokvel/${stokvelId}/settings`)
  }

  const totalBalance = summaries.reduce((sum, summary) => 
    sum + (summary.total_verified_contributions - summary.total_payouts), 0
  )

  const totalMembers = summaries.reduce((sum, summary) => sum + summary.member_count, 0)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Stokvels</h1>
            <p className="text-gray-600 mt-1">
              Manage all your stokvel memberships and track your progress
            </p>
          </div>
          <Button onClick={() => navigate('/create-stokvel')}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Stokvel
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            className="px-4 py-2 rounded-md text-sm font-medium bg-white text-gray-900 shadow-sm"
          >
            Owned Stokvels ({stokvels.length})
          </button>
          <button
            onClick={() => navigate('/members')}
            className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            My Memberships
          </button>
        </div>

        {/* Summary Cards */}
        {stokvels.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Stokvels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stokvels.length}</div>
                <p className="text-xs text-gray-600">
                  {stokvels.filter(s => s.is_active).length} active
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalBalance, 'ZAR')}
                </div>
                <p className="text-xs text-gray-600">
                  Across all stokvels
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalMembers}</div>
                <p className="text-xs text-gray-600">
                  Combined membership
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { key: 'all', label: 'All Stokvels', count: stokvels.length },
            { key: 'active', label: 'Active', count: stokvels.filter(s => s.is_active).length },
            { key: 'inactive', label: 'Inactive', count: stokvels.filter(s => !s.is_active).length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Stokvels Grid */}
        {filteredStokvels.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {filter === 'all' 
                  ? "No stokvels yet" 
                  : `No ${filter} stokvels`
                }
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all'
                  ? "Start your savings journey by creating your first stokvel or joining an existing one."
                  : `You don't have any ${filter} stokvels at the moment.`
                }
              </p>
              {filter === 'all' && (
                <Button onClick={() => navigate('/create-stokvel')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Stokvel
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredStokvels.map((stokvel) => (
              <StokvelCard
                key={stokvel.id}
                stokvel={stokvel}
                summary={getSummaryForStokvel(stokvel.id)}
                onView={handleViewStokvel}
                onDelete={handleDeleteStokvel}
                onSettings={handleStokvelSettings}
              />
            ))}
          </div>
        )}

        {/* Quick Actions Footer */}
        {stokvels.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>
                Common tasks you might want to perform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button variant="outline" onClick={() => navigate('/browse-stokvel-types')}>
                  Browse Stokvel Types
                </Button>
                <Button variant="outline" onClick={() => navigate('/stokvel-reports')}>
                  View All Reports
                </Button>
                <Button variant="outline">
                  <Archive className="h-4 w-4 mr-2" />
                  Archived Stokvels
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}