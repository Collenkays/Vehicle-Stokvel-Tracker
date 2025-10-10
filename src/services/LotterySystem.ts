/**
 * Lottery System for Stokvel Rotation Order Generation
 *
 * Provides cryptographically secure lottery generation with multiple strategies:
 * - Random Draw: Pure random selection
 * - Weighted: Based on tenure and contribution history
 * - Manual: Allow admin override
 */

import { StokvelMember } from '../types/multi-stokvel'

export type LotteryMethod = 'random' | 'weighted' | 'manual'

export interface LotteryConfig {
  method: LotteryMethod
  excludeVehicleRecipients?: boolean
  weightingFactors?: {
    tenureWeight: number      // Weight based on join date (0-1)
    contributionWeight: number // Weight based on payment consistency (0-1)
  }
}

export interface LotteryResult {
  memberId: string
  memberName: string
  rotationOrder: number
  drawTimestamp: string
  randomSeed: string
  weightScore?: number
}

export interface LotteryDrawResult {
  stokvelId: string
  method: LotteryMethod
  results: LotteryResult[]
  conductedAt: string
  conductedBy: string
  totalParticipants: number
  excludedMembers: string[]
}

/**
 * Cryptographically secure random number generator
 */
const secureRandom = (): number => {
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  return array[0] / (0xffffffff + 1)
}

/**
 * Generate a random seed for audit trail
 */
const generateRandomSeed = (): string => {
  const array = new Uint32Array(4)
  crypto.getRandomValues(array)
  return Array.from(array).map(n => n.toString(16).padStart(8, '0')).join('-')
}

/**
 * Fisher-Yates shuffle algorithm with cryptographic randomness
 */
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(secureRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Calculate member tenure in months
 */
const calculateTenureMonths = (joinDate: string): number => {
  const join = new Date(joinDate)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - join.getTime())
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30))
  return diffMonths
}

/**
 * Calculate weighted score for a member
 */
const calculateWeightedScore = (
  member: StokvelMember,
  config: LotteryConfig
): number => {
  const { tenureWeight = 0.5, contributionWeight = 0.5 } = config.weightingFactors || {}

  // Tenure score (normalized to 0-1, max 24 months)
  const tenureMonths = calculateTenureMonths(member.join_date)
  const tenureScore = Math.min(tenureMonths / 24, 1)

  // Contribution score (based on total_paid, normalized)
  // Assuming average monthly contribution is reflected in total_paid
  const contributionScore = Math.min(member.total_paid / 50000, 1) // Normalize to R50k max

  // Combined weighted score
  const weightedScore = (tenureScore * tenureWeight) + (contributionScore * contributionWeight)

  return weightedScore
}

/**
 * Weighted random selection using cumulative weights
 */
const weightedRandomSelection = (
  members: StokvelMember[],
  weights: number[]
): StokvelMember[] => {
  const selected: StokvelMember[] = []
  const availableMembers = [...members]
  const availableWeights = [...weights]

  while (availableMembers.length > 0) {
    // Calculate cumulative weights
    const cumulativeWeights: number[] = []
    let sum = 0
    for (const weight of availableWeights) {
      sum += weight
      cumulativeWeights.push(sum)
    }

    // Random selection based on weights
    const random = secureRandom() * sum
    let selectedIndex = 0
    for (let i = 0; i < cumulativeWeights.length; i++) {
      if (random <= cumulativeWeights[i]) {
        selectedIndex = i
        break
      }
    }

    // Add selected member and remove from available pool
    selected.push(availableMembers[selectedIndex])
    availableMembers.splice(selectedIndex, 1)
    availableWeights.splice(selectedIndex, 1)
  }

  return selected
}

/**
 * Generate lottery draw using random method
 */
const generateRandomLottery = (
  members: StokvelMember[],
  _conductedBy: string
): LotteryResult[] => {
  const shuffled = shuffleArray(members)
  const timestamp = new Date().toISOString()
  const seed = generateRandomSeed()

  return shuffled.map((member, index) => ({
    memberId: member.id,
    memberName: member.full_name,
    rotationOrder: index + 1,
    drawTimestamp: timestamp,
    randomSeed: seed,
  }))
}

/**
 * Generate lottery draw using weighted method
 */
const generateWeightedLottery = (
  members: StokvelMember[],
  config: LotteryConfig,
  _conductedBy: string
): LotteryResult[] => {
  // Calculate weights for each member
  const weights = members.map(member => calculateWeightedScore(member, config))

  // Perform weighted selection
  const ordered = weightedRandomSelection(members, weights)

  const timestamp = new Date().toISOString()
  const seed = generateRandomSeed()

  return ordered.map((member, index) => {
    const weightScore = calculateWeightedScore(member, config)
    return {
      memberId: member.id,
      memberName: member.full_name,
      rotationOrder: index + 1,
      drawTimestamp: timestamp,
      randomSeed: seed,
      weightScore,
    }
  })
}

/**
 * Main lottery generation function
 */
export const conductLottery = (
  stokvelId: string,
  members: StokvelMember[],
  config: LotteryConfig,
  conductedBy: string
): LotteryDrawResult => {
  // Filter members based on configuration
  let eligibleMembers = [...members]
  const excludedMembers: string[] = []

  if (config.excludeVehicleRecipients) {
    eligibleMembers = eligibleMembers.filter(member => {
      if (member.vehicle_received) {
        excludedMembers.push(member.id)
        return false
      }
      return true
    })
  }

  // Only include active members
  eligibleMembers = eligibleMembers.filter(member => {
    if (!member.is_active) {
      excludedMembers.push(member.id)
      return false
    }
    return true
  })

  if (eligibleMembers.length === 0) {
    throw new Error('No eligible members for lottery draw')
  }

  // Generate lottery based on method
  let results: LotteryResult[]

  switch (config.method) {
    case 'random':
      results = generateRandomLottery(eligibleMembers, conductedBy)
      break

    case 'weighted':
      results = generateWeightedLottery(eligibleMembers, config, conductedBy)
      break

    case 'manual':
      // Manual method preserves existing rotation order
      results = eligibleMembers
        .sort((a, b) => (a.rotation_order || 0) - (b.rotation_order || 0))
        .map(member => ({
          memberId: member.id,
          memberName: member.full_name,
          rotationOrder: member.rotation_order || 0,
          drawTimestamp: new Date().toISOString(),
          randomSeed: 'manual',
        }))
      break

    default:
      throw new Error(`Unknown lottery method: ${config.method}`)
  }

  return {
    stokvelId,
    method: config.method,
    results,
    conductedAt: new Date().toISOString(),
    conductedBy,
    totalParticipants: eligibleMembers.length,
    excludedMembers,
  }
}

/**
 * Validate lottery results for fairness
 */
export const validateLotteryResults = (result: LotteryDrawResult): {
  isValid: boolean
  issues: string[]
} => {
  const issues: string[] = []

  // Check for duplicate rotation orders
  const rotationOrders = result.results.map(r => r.rotationOrder)
  const uniqueOrders = new Set(rotationOrders)
  if (uniqueOrders.size !== rotationOrders.length) {
    issues.push('Duplicate rotation orders detected')
  }

  // Check for sequential ordering (1, 2, 3, ...)
  const sortedOrders = [...rotationOrders].sort((a, b) => a - b)
  for (let i = 0; i < sortedOrders.length; i++) {
    if (sortedOrders[i] !== i + 1) {
      issues.push(`Missing rotation order: ${i + 1}`)
    }
  }

  // Check for empty results
  if (result.results.length === 0) {
    issues.push('No lottery results generated')
  }

  // Check timestamp validity
  const conductedTime = new Date(result.conductedAt)
  if (isNaN(conductedTime.getTime())) {
    issues.push('Invalid timestamp')
  }

  return {
    isValid: issues.length === 0,
    issues,
  }
}

/**
 * Export lottery results to CSV format for transparency
 */
export const exportLotteryToCSV = (result: LotteryDrawResult): string => {
  const headers = ['Rotation Order', 'Member Name', 'Member ID', 'Weight Score', 'Draw Timestamp']
  const rows = result.results.map(r => [
    r.rotationOrder.toString(),
    r.memberName,
    r.memberId,
    r.weightScore?.toFixed(3) || 'N/A',
    r.drawTimestamp,
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n')

  return csvContent
}
