import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Download, FileText, Calendar, DollarSign } from 'lucide-react'
import { useContributions } from '../hooks/useContributions'
import { usePayouts } from '../hooks/usePayouts'
import { useStokvelMembers } from '../hooks/useMembers'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { formatCurrency } from '../utils/currency'
import { getCurrentMonth } from '../utils/date'
import { AdHorizontalBanner } from '../components/AdBanner'

export const Reports = () => {
  const { stokvelId } = useParams<{ stokvelId: string }>()
  const [reportMonth, setReportMonth] = useState(getCurrentMonth())

  const { data: contributions } = useContributions(stokvelId, reportMonth)
  const { data: allContributions } = useContributions(stokvelId)
  const { data: payouts } = usePayouts(stokvelId)
  const { data: members } = useStokvelMembers(stokvelId)

  const generateMonthlyReport = () => {
    if (!contributions || !members) return

    const monthlyData = {
      month: reportMonth,
      totalCollected: contributions
        .filter(c => c.verified)
        .reduce((sum, c) => sum + c.amount, 0),
      pendingVerification: contributions
        .filter(c => !c.verified)
        .reduce((sum, c) => sum + c.amount, 0),
      totalContributions: contributions.length,
      verifiedContributions: contributions.filter(c => c.verified).length,
      membersContributed: new Set(contributions.map(c => c.member_id)).size,
      totalMembers: members.length,
    }

    const csvContent = [
      ['Monthly Report', reportMonth],
      [''],
      ['Summary'],
      ['Total Collected (Verified)', formatCurrency(monthlyData.totalCollected)],
      ['Pending Verification', formatCurrency(monthlyData.pendingVerification)],
      ['Total Contributions', monthlyData.totalContributions],
      ['Verified Contributions', monthlyData.verifiedContributions],
      ['Members Contributed', monthlyData.membersContributed],
      ['Total Members', monthlyData.totalMembers],
      [''],
      ['Detailed Contributions'],
      ['Member Name', 'Amount', 'Date Paid', 'Verified', 'Proof of Payment'],
      ...contributions.map(c => [
        c.member?.full_name || 'Unknown',
        c.amount,
        c.date_paid,
        c.verified ? 'Yes' : 'No',
        c.proof_of_payment || 'None'
      ])
    ]

    downloadCSV(csvContent, `monthly-report-${reportMonth.replace(' ', '-')}.csv`)
  }

  const generateFinancialSummary = () => {
    if (!allContributions || !payouts || !members) return

    const totalContributions = allContributions
      .filter(c => c.verified)
      .reduce((sum, c) => sum + c.amount, 0)
    
    const totalPayouts = payouts
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount_paid, 0)
    
    const currentBalance = totalContributions - totalPayouts

    const summaryData = [
      ['Financial Summary Report'],
      ['Generated on', new Date().toLocaleDateString()],
      [''],
      ['Overview'],
      ['Total Members', members.length],
      ['Members with Vehicles', members.filter(m => m.vehicle_received).length],
      ['Members without Vehicles', members.filter(m => !m.vehicle_received).length],
      [''],
      ['Financial Summary'],
      ['Total Contributions (Verified)', formatCurrency(totalContributions)],
      ['Total Payouts', formatCurrency(totalPayouts)],
      ['Current Balance', formatCurrency(currentBalance)],
      ['Average Contribution per Member', formatCurrency(totalContributions / members.length)],
      [''],
      ['Payout History'],
      ['Member Name', 'Month', 'Amount', 'Vehicle Value', 'Status'],
      ...payouts.map(p => [
        p.member?.full_name || 'Unknown',
        p.month_paid,
        formatCurrency(p.amount_paid),
        formatCurrency(p.vehicle_value),
        p.status
      ])
    ]

    downloadCSV(summaryData, 'financial-summary.csv')
  }

  const generateMemberReport = () => {
    if (!members || !allContributions) return

    const memberData = members.map(member => {
      const memberContributions = allContributions.filter(c => c.member_id === member.id)
      const totalContributed = memberContributions
        .filter(c => c.verified)
        .reduce((sum, c) => sum + c.amount, 0)
      const pendingAmount = memberContributions
        .filter(c => !c.verified)
        .reduce((sum, c) => sum + c.amount, 0)

      return {
        name: member.full_name,
        email: member.email,
        joinDate: member.join_date,
        rotationOrder: member.rotation_order,
        vehicleReceived: member.vehicle_received ? 'Yes' : 'No',
        monthReceived: member.month_received || 'N/A',
        totalContributed,
        pendingAmount,
        contributionCount: memberContributions.length,
      }
    })

    const csvContent = [
      ['Member Report'],
      ['Generated on', new Date().toLocaleDateString()],
      [''],
      ['Member Details'],
      [
        'Full Name', 'Email', 'Join Date', 'Rotation Order', 
        'Vehicle Received', 'Month Received', 'Total Contributed', 
        'Pending Amount', 'Contribution Count'
      ],
      ...memberData.map(m => [
        m.name, m.email, m.joinDate, m.rotationOrder,
        m.vehicleReceived, m.monthReceived, formatCurrency(m.totalContributed),
        formatCurrency(m.pendingAmount), m.contributionCount
      ])
    ]

    downloadCSV(csvContent, 'member-report.csv')
  }

  const downloadCSV = (data: any[][], filename: string) => {
    const csvContent = data.map(row => 
      row.map(cell => 
        typeof cell === 'string' && cell.includes(',') 
          ? `"${cell}"` 
          : cell
      ).join(',')
    ).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600">Generate and download financial reports</p>
      </div>

      {/* Monthly Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Monthly Report</span>
          </CardTitle>
          <CardDescription>
            Generate a detailed report for a specific month
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="report-month">Month</Label>
              <Input
                id="report-month"
                placeholder="e.g., January 2025"
                value={reportMonth}
                onChange={(e) => setReportMonth(e.target.value)}
              />
            </div>
            <Button onClick={generateMonthlyReport} className="w-full md:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Download Monthly Report
            </Button>
          </div>

          {contributions && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Collected</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(
                    contributions
                      .filter(c => c.verified)
                      .reduce((sum, c) => sum + c.amount, 0)
                  )}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Contributions</p>
                <p className="text-lg font-semibold">{contributions.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-lg font-semibold text-green-600">
                  {contributions.filter(c => c.verified).length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-lg font-semibold text-yellow-600">
                  {contributions.filter(c => !c.verified).length}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Financial Summary</span>
          </CardTitle>
          <CardDescription>
            Complete financial overview with all transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={generateFinancialSummary}>
            <Download className="mr-2 h-4 w-4" />
            Download Financial Summary
          </Button>
        </CardContent>
      </Card>

      {/* Member Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Member Report</span>
          </CardTitle>
          <CardDescription>
            Detailed member information and contribution history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={generateMemberReport}>
            <Download className="mr-2 h-4 w-4" />
            Download Member Report
          </Button>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      {allContributions && payouts && members && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-2xl font-bold">{members.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Contributions</p>
                <p className="text-2xl font-bold">{allContributions.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Completed Payouts</p>
                <p className="text-2xl font-bold">
                  {payouts.filter(p => p.status === 'completed').length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Current Balance</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    allContributions
                      .filter(c => c.verified)
                      .reduce((sum, c) => sum + c.amount, 0) -
                    payouts
                      .filter(p => p.status === 'completed')
                      .reduce((sum, p) => sum + p.amount_paid, 0)
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ad Placement - Bottom of page */}
      <AdHorizontalBanner slot="YOUR_AD_SLOT_2" />
    </div>
  )
}