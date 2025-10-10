import { useState } from 'react'
import { Dices, Trophy, Users, AlertCircle, Download, CheckCircle2, Sparkles } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Alert, AlertDescription } from './ui/alert'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'
import { StokvelMember } from '../types/multi-stokvel'
import { conductLottery, LotteryConfig, LotteryDrawResult, validateLotteryResults, exportLotteryToCSV } from '../services/LotterySystem'

interface LotteryDrawDialogProps {
  open: boolean
  onClose: () => void
  stokvelId: string
  members: StokvelMember[]
  onLotteryComplete: (result: LotteryDrawResult) => Promise<void>
  conductedBy: string
}

type LotteryStep = 'config' | 'preview' | 'drawing' | 'results'

export const LotteryDrawDialog = ({
  open,
  onClose,
  stokvelId,
  members,
  onLotteryComplete,
  conductedBy,
}: LotteryDrawDialogProps) => {
  const [step, setStep] = useState<LotteryStep>('config')
  const [lotteryMethod, setLotteryMethod] = useState<'random' | 'weighted'>('random')
  const [excludeVehicleRecipients, setExcludeVehicleRecipients] = useState(true)
  const [lotteryResult, setLotteryResult] = useState<LotteryDrawResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const eligibleMembers = members.filter(m => {
    if (!m.is_active) return false
    if (excludeVehicleRecipients && m.vehicle_received) return false
    return true
  })

  const handleConductLottery = () => {
    setError(null)
    setStep('drawing')

    // Simulate drawing animation
    setTimeout(() => {
      try {
        const config: LotteryConfig = {
          method: lotteryMethod,
          excludeVehicleRecipients,
          weightingFactors: lotteryMethod === 'weighted' ? {
            tenureWeight: 0.4,
            contributionWeight: 0.6,
          } : undefined,
        }

        const result = conductLottery(stokvelId, members, config, conductedBy)

        // Validate results
        const validation = validateLotteryResults(result)
        if (!validation.isValid) {
          throw new Error(`Lottery validation failed: ${validation.issues.join(', ')}`)
        }

        setLotteryResult(result)
        setStep('results')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to conduct lottery')
        setStep('config')
      }
    }, 2000)
  }

  const handleConfirmResults = async () => {
    if (!lotteryResult) return

    setIsProcessing(true)
    setError(null)

    try {
      await onLotteryComplete(lotteryResult)
      onClose()
      // Reset state
      setStep('config')
      setLotteryResult(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save lottery results')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExportCSV = () => {
    if (!lotteryResult) return

    const csv = exportLotteryToCSV(lotteryResult)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lottery-results-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleClose = () => {
    if (step !== 'drawing' && !isProcessing) {
      onClose()
      // Reset state after close
      setTimeout(() => {
        setStep('config')
        setLotteryResult(null)
        setError(null)
      }, 300)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Dices className="h-6 w-6 text-primary" />
            Conduct Lottery Draw
          </DialogTitle>
          <DialogDescription>
            Generate fair and transparent rotation order for all members
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Configuration Step */}
        {step === 'config' && (
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">Lottery Method</Label>
                <RadioGroup value={lotteryMethod} onValueChange={(v) => setLotteryMethod(v as any)}>
                  <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="random" id="random" />
                    <div className="flex-1">
                      <Label htmlFor="random" className="cursor-pointer font-medium">
                        Random Draw
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        Pure random lottery with cryptographic security. Every member has equal chance.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="weighted" id="weighted" />
                    <div className="flex-1">
                      <Label htmlFor="weighted" className="cursor-pointer font-medium">
                        Weighted Lottery
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        Based on tenure (40%) and contribution history (60%). Long-standing, consistent members have higher probability.
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-start space-x-3 p-4 border rounded-lg bg-blue-50">
                <input
                  type="checkbox"
                  id="exclude-recipients"
                  checked={excludeVehicleRecipients}
                  onChange={(e) => setExcludeVehicleRecipients(e.target.checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="exclude-recipients" className="cursor-pointer font-medium">
                    Exclude members who received vehicles
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Only include members who haven't received their vehicle yet
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{eligibleMembers.length}</p>
                      <p className="text-sm text-gray-600">Eligible Members</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-8 w-8 text-orange-500" />
                    <div>
                      <p className="text-2xl font-bold">{members.length - eligibleMembers.length}</p>
                      <p className="text-sm text-gray-600">Excluded Members</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {eligibleMembers.length === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No eligible members for lottery. Please check your filters.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Drawing Step */}
        {step === 'drawing' && (
          <div className="py-12 text-center space-y-6">
            <div className="relative inline-block">
              <Dices className="h-20 w-20 text-primary animate-bounce" />
              <Sparkles className="h-8 w-8 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Conducting Lottery Draw...</h3>
              <p className="text-gray-600">
                Using cryptographic randomness to ensure fairness
              </p>
            </div>
          </div>
        )}

        {/* Results Step */}
        {step === 'results' && lotteryResult && (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 pb-4 border-b">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold">Lottery Draw Complete!</h3>
              <p className="text-sm text-gray-600">
                {lotteryResult.totalParticipants} members assigned rotation order
              </p>
              <Badge variant="secondary">
                Method: {lotteryResult.method}
              </Badge>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {lotteryResult.results.map((result, index) => (
                <div
                  key={result.memberId}
                  className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    {index < 3 ? (
                      <Trophy className={`h-6 w-6 ${
                        index === 0 ? 'text-yellow-500' :
                        index === 1 ? 'text-gray-400' :
                        'text-orange-400'
                      }`} />
                    ) : (
                      <span className="font-bold text-primary">{result.rotationOrder}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{result.memberName}</p>
                    {result.weightScore && (
                      <p className="text-xs text-gray-500">
                        Weight Score: {(result.weightScore * 100).toFixed(1)}%
                      </p>
                    )}
                  </div>
                  <Badge variant="outline">#{result.rotationOrder}</Badge>
                </div>
              ))}
            </div>

            {lotteryResult.excludedMembers.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {lotteryResult.excludedMembers.length} member(s) excluded from lottery
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <DialogFooter>
          {step === 'config' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleConductLottery}
                disabled={eligibleMembers.length === 0}
              >
                <Dices className="h-4 w-4 mr-2" />
                Conduct Lottery
              </Button>
            </>
          )}

          {step === 'results' && (
            <>
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={() => setStep('config')}>
                Re-draw
              </Button>
              <Button
                onClick={handleConfirmResults}
                disabled={isProcessing}
              >
                {isProcessing ? 'Saving...' : 'Confirm & Apply'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
