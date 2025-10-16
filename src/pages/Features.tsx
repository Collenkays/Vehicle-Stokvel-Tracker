import { PublicHeader } from '../components/PublicHeader'
import { Button } from '../components/ui/button'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  DollarSign,
  Shield,
  TrendingUp,
  Bell,
  FileText,
  Calculator,
  Clock,
  Lock,
  Smartphone,
  BarChart3,
  UserCheck
} from 'lucide-react'

export const Features = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: Users,
      title: 'Member Management',
      description: 'Track members, rotation orders, and vehicle recipients. Invite members securely with invitation links and manage participation throughout the stokvel lifecycle.'
    },
    {
      icon: DollarSign,
      title: 'Contribution Tracking',
      description: 'Record monthly contributions with proof of payment uploads. Automatic balance calculations and verification workflows ensure accuracy.'
    },
    {
      icon: Shield,
      title: 'Fairness Calculator',
      description: 'Automated fairness calculations ensure equitable treatment. Track net positions and distribute leftover funds after cycle completion.'
    },
    {
      icon: TrendingUp,
      title: 'Real-time Analytics',
      description: 'Monitor stokvel health with comprehensive dashboards. Track contribution trends, payout forecasts, and member activity in real-time.'
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Never miss important dates with automated reminders for contributions, payouts, meetings, and upcoming member rotations.'
    },
    {
      icon: FileText,
      title: 'Comprehensive Reports',
      description: 'Generate detailed financial reports, member statements, contribution histories, and audit trails for complete transparency.'
    },
    {
      icon: Calculator,
      title: 'Automatic Calculations',
      description: 'Eliminate spreadsheet errors with automatic balance calculations, payout eligibility checks, and rotation order management.'
    },
    {
      icon: Clock,
      title: 'Payment History',
      description: 'Complete audit trail of all contributions and payouts. Track who paid what, when, and view proof of payment documents.'
    },
    {
      icon: Lock,
      title: 'Bank-Level Security',
      description: 'Your data is protected with encryption, automatic backups, and role-based access controls. Only authorized members can view sensitive information.'
    },
    {
      icon: Smartphone,
      title: 'Mobile Responsive',
      description: 'Manage your stokvel on any device. Progressive Web App (PWA) support allows installation on mobile devices for native app experience.'
    },
    {
      icon: BarChart3,
      title: 'Financial Insights',
      description: 'Visualize contribution patterns, forecast payout dates, and identify potential issues before they become problems.'
    },
    {
      icon: UserCheck,
      title: 'Role-Based Access',
      description: 'Assign different permission levels to administrators, treasurers, and members. Control who can add contributions, approve payouts, and view reports.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <PublicHeader />

      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Powerful Features for Modern Stokvels
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage your stokvel efficiently, transparently, and securely.
              Built specifically for South African savings clubs.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow bg-white"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center bg-gradient-to-r from-primary to-accent rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join hundreds of stokvels already using Vikoba
            </p>
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-gray-100 text-lg px-8"
              onClick={() => navigate('/login')}
            >
              Start Free Trial
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
