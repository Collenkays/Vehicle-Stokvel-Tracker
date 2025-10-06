import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { ArrowLeft, Search, Filter, Plus, Clock, Target, Users, TrendingUp } from 'lucide-react'
import { useStokvelTypes } from '../hooks/useStokvelTypes'
import { StokvelType } from '../types/multi-stokvel'

const StokvelTypeCard = ({ 
  type, 
  onSelect 
}: { 
  type: StokvelType
  onSelect: (type: StokvelType) => void 
}) => {
  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'monthly': return 'bg-blue-100 text-blue-800'
      case 'quarterly': return 'bg-green-100 text-green-800'
      case 'yearly': return 'bg-purple-100 text-purple-800'
      case 'as_needed': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDistributionColor = (type: string) => {
    switch (type) {
      case 'cash': return 'bg-emerald-100 text-emerald-800'
      case 'vehicle': return 'bg-blue-100 text-blue-800'
      case 'goods': return 'bg-amber-100 text-amber-800'
      case 'profit_share': return 'bg-violet-100 text-violet-800'
      case 'educational_support': return 'bg-teal-100 text-teal-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getFeatures = () => {
    const features = []
    
    if (type.rules_template.rotation_based) {
      features.push({ icon: Users, text: 'Rotation-based' })
    }
    
    if (type.rules_template.target_amount) {
      features.push({ icon: Target, text: `Target: R${type.rules_template.target_amount?.toLocaleString()}` })
    }
    
    if (type.rules_template.allow_emergency_withdrawals) {
      features.push({ icon: TrendingUp, text: 'Emergency withdrawals' })
    }
    
    if (type.rules_template.reinvestment_option) {
      features.push({ icon: TrendingUp, text: 'Reinvestment option' })
    }

    return features
  }

  return (
    <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{type.icon}</div>
            <div>
              <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                {type.name}
              </CardTitle>
              <CardDescription className="text-sm text-gray-600">
                {type.description}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Attributes */}
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant="secondary" 
            className={`text-xs ${getFrequencyColor(type.rules_template.frequency)}`}
          >
            <Clock className="h-3 w-3 mr-1" />
            {type.rules_template.frequency.replace('_', ' ')}
          </Badge>
          <Badge 
            variant="secondary" 
            className={`text-xs ${getDistributionColor(type.rules_template.distribution_type)}`}
          >
            {type.rules_template.distribution_type.replace('_', ' ')}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {type.rules_template.payout_trigger.replace('_', ' ')}
          </Badge>
        </div>

        {/* Features */}
        <div className="space-y-2">
          {getFeatures().slice(0, 3).map((feature, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
              <feature.icon className="h-4 w-4" />
              <span>{feature.text}</span>
            </div>
          ))}
        </div>

        {/* Rules Summary */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">How it works:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Payout when: {type.rules_template.payout_trigger.replace('_', ' ')}</li>
            <li>• Payment frequency: {type.rules_template.frequency}</li>
            <li>• Distribution: {type.rules_template.distribution_type.replace('_', ' ')}</li>
            {type.rules_template.allow_rollover && (
              <li>• Allows balance rollover</li>
            )}
          </ul>
        </div>

        {/* Action Button */}
        <Button 
          onClick={() => onSelect(type)}
          className="w-full group-hover:bg-blue-600 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create {type.name}
        </Button>
      </CardContent>
    </Card>
  )
}

export const StokvelTypeCatalog = () => {
  const navigate = useNavigate()
  const { data: stokvelTypes = [], isLoading } = useStokvelTypes()
  const [searchTerm, setSearchTerm] = useState('')
  const [frequencyFilter, setFrequencyFilter] = useState<string>('all')
  const [distributionFilter, setDistributionFilter] = useState<string>('all')

  const filteredTypes = stokvelTypes.filter(type => {
    const matchesSearch = type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         type.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFrequency = frequencyFilter === 'all' || 
                            type.rules_template.frequency === frequencyFilter
    
    const matchesDistribution = distributionFilter === 'all' || 
                               type.rules_template.distribution_type === distributionFilter

    return matchesSearch && matchesFrequency && matchesDistribution
  })

  const handleSelectType = (type: StokvelType) => {
    navigate('/create-stokvel', { state: { selectedType: type } })
  }

  const uniqueFrequencies = Array.from(
    new Set(stokvelTypes.map(type => type.rules_template.frequency))
  )

  const uniqueDistributionTypes = Array.from(
    new Set(stokvelTypes.map(type => type.rules_template.distribution_type))
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
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
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Stokvel Type Catalog</h1>
          <p className="text-gray-600 mt-2">
            Choose from our predefined stokvel types or get inspired to create your own
          </p>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filter & Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search stokvel types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Frequency
                </label>
                <select
                  value={frequencyFilter}
                  onChange={(e) => setFrequencyFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All frequencies</option>
                  {uniqueFrequencies.map(freq => (
                    <option key={freq} value={freq}>
                      {freq.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Distribution Type
                </label>
                <select
                  value={distributionFilter}
                  onChange={(e) => setDistributionFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All distribution types</option>
                  {uniqueDistributionTypes.map(type => (
                    <option key={type} value={type}>
                      {type.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters Summary */}
            {(searchTerm || frequencyFilter !== 'all' || distributionFilter !== 'all') && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-600">Active filters:</span>
                {searchTerm && (
                  <Badge variant="secondary">Search: "{searchTerm}"</Badge>
                )}
                {frequencyFilter !== 'all' && (
                  <Badge variant="secondary">Frequency: {frequencyFilter.replace('_', ' ')}</Badge>
                )}
                {distributionFilter !== 'all' && (
                  <Badge variant="secondary">Type: {distributionFilter.replace('_', ' ')}</Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('')
                    setFrequencyFilter('all')
                    setDistributionFilter('all')
                  }}
                >
                  Clear all
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {filteredTypes.length} {filteredTypes.length === 1 ? 'Type' : 'Types'} Found
          </h2>
          <p className="text-sm text-gray-600">
            Click on any type to start creating your stokvel
          </p>
        </div>

        {/* Stokvel Types Grid */}
        {filteredTypes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No stokvel types found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setFrequencyFilter('all')
                  setDistributionFilter('all')
                }}
              >
                Clear all filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTypes.map((type) => (
              <StokvelTypeCard
                key={type.id}
                type={type}
                onSelect={handleSelectType}
              />
            ))}
          </div>
        )}

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="text-center py-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Don't see what you're looking for?
            </h3>
            <p className="text-gray-600 mb-6">
              You can customize any stokvel type during the creation process to fit your specific needs.
            </p>
            <Button onClick={() => navigate('/create-stokvel')}>
              <Plus className="h-4 w-4 mr-2" />
              Start Creating Custom Stokvel
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}