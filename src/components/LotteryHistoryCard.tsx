import { History, Dices, Trophy, Calendar, User, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { useLotteryHistory } from '../hooks/useLottery'
import { formatDate } from '../utils/date'
import { useState } from 'react'

interface LotteryHistoryCardProps {
  stokvelId: string
}

export const LotteryHistoryCard = ({ stokvelId }: LotteryHistoryCardProps) => {
  const { data: history = [], isLoading } = useLotteryHistory(stokvelId, 10)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const getMethodBadgeColor = (method: string) => {
    switch (method) {
      case 'random':
        return 'bg-blue-500'
      case 'weighted':
        return 'bg-purple-500'
      case 'manual':
        return 'bg-gray-500'
      default:
        return 'bg-gray-400'
    }
  }

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'random':
        return 'Random Draw'
      case 'weighted':
        return 'Weighted Lottery'
      case 'manual':
        return 'Manual Assignment'
      default:
        return method
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Lottery History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Lottery History
          </CardTitle>
          <CardDescription>Track all lottery draws conducted for this stokvel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Dices className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No lottery draws conducted yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Conduct your first lottery to establish rotation order
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Lottery History
        </CardTitle>
        <CardDescription>
          {history.length} lottery draw{history.length !== 1 ? 's' : ''} conducted
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {history.map((lottery: any) => {
          const isExpanded = expandedId === lottery.id
          const results = lottery.lottery_results || []

          return (
            <div
              key={lottery.id}
              className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4 bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`text-white ${getMethodBadgeColor(lottery.lottery_method)}`}>
                        {getMethodLabel(lottery.lottery_method)}
                      </Badge>
                      {lottery.is_active && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(lottery.conducted_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Conducted by: {lottery.conductor_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        <span>{lottery.total_participants} participants</span>
                      </div>
                      {lottery.excluded_members && lottery.excluded_members.length > 0 && (
                        <div className="text-xs text-orange-600">
                          {lottery.excluded_members.length} member(s) excluded
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpand(lottery.id)}
                  >
                    {isExpanded ? 'Hide' : 'View'} Results
                  </Button>
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 space-y-2 border-t">
                  <h4 className="font-semibold text-sm mb-3">Draw Results:</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {results.map((result: any, index: number) => (
                      <div
                        key={result.memberId || index}
                        className="flex items-center gap-3 p-2 bg-gray-50 rounded"
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          {index < 3 ? (
                            <Trophy className={`h-4 w-4 ${
                              index === 0 ? 'text-yellow-500' :
                              index === 1 ? 'text-gray-400' :
                              'text-orange-400'
                            }`} />
                          ) : (
                            <span className="text-xs font-bold text-primary">
                              {result.rotationOrder || result.rotationorder || index + 1}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {result.memberName || result.membername || 'Unknown'}
                          </p>
                          {result.weightScore && (
                            <p className="text-xs text-gray-500">
                              Weight: {(result.weightScore * 100).toFixed(1)}%
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          #{result.rotationOrder || result.rotationorder || index + 1}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
