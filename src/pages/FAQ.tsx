import { useState } from 'react'
import { ChevronDown, ChevronRight, Search, HelpCircle, Book, Users, CreditCard, TrendingUp, Settings, Calculator } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface FAQItem {
  id: string
  question: string
  answer: string | React.ReactNode
  category: 'general' | 'getting-started' | 'contributions' | 'payouts' | 'members' | 'fairness' | 'technical'
  keywords: string[]
}

const faqData: FAQItem[] = [
  // General
  {
    id: 'what-is-stokvel',
    category: 'general',
    question: 'What is a stokvel?',
    keywords: ['stokvel', 'definition', 'basics', 'what'],
    answer: 'A stokvel is a South African savings club where members pool money together for a common purpose. Members contribute regularly (usually monthly), and funds are distributed according to agreed-upon rules. Stokvels are built on trust, community, and mutual support.'
  },
  {
    id: 'stokvel-types',
    category: 'general',
    question: 'What types of stokvels are available?',
    keywords: ['types', 'categories', 'kinds'],
    answer: (
      <div className="space-y-2">
        <p>The application supports 8 stokvel types:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Vehicle Purchase Stokvel:</strong> Pool funds to purchase vehicles through rotation</li>
          <li><strong>Grocery Stokvel:</strong> Monthly rotation for grocery shopping funds</li>
          <li><strong>Burial Society (Umgalelo):</strong> Emergency funeral cost coverage</li>
          <li><strong>Investment Club (Metshelo):</strong> Collective investments in property, shares, or business</li>
          <li><strong>Education Fund (Thupa):</strong> Support for children\'s education expenses</li>
          <li><strong>Christmas Stokvel:</strong> Save for holiday season expenses</li>
          <li><strong>Home Improvement Stokvel:</strong> Rotation-based home renovation funds</li>
          <li><strong>Seasonal Farming Stokvel:</strong> Support agricultural activities during planting/harvest</li>
        </ul>
      </div>
    )
  },
  {
    id: 'account-required',
    category: 'general',
    question: 'Do I need to create an account?',
    keywords: ['account', 'signup', 'register'],
    answer: 'Yes, you need to sign up with an email and password to keep your stokvel data secure and private. This ensures only you and your stokvel members can access your data.'
  },
  {
    id: 'multiple-stokvels',
    category: 'general',
    question: 'Can I manage multiple stokvels?',
    keywords: ['multiple', 'several', 'many'],
    answer: 'Yes! You can create, join, and manage multiple stokvels from one account. Use the "My Stokvels" page to switch between them. Many people participate in multiple stokvels (e.g., vehicle stokvel, grocery stokvel, burial society).'
  },
  {
    id: 'data-security',
    category: 'general',
    question: 'Is my data secure?',
    keywords: ['security', 'safe', 'protected', 'privacy'],
    answer: 'Yes, the application uses industry-standard encryption and security practices. Only you and your stokvel members can access your stokvel\'s data. All data is stored securely on Supabase with Row Level Security policies.'
  },
  {
    id: 'mobile-usage',
    category: 'general',
    question: 'Can I use this on my phone?',
    keywords: ['mobile', 'phone', 'app', 'android', 'ios'],
    answer: 'Absolutely! The application is fully mobile-responsive and works on any device. You can also install it as a Progressive Web App (PWA) on your phone for offline access and a native app experience.'
  },

  // Getting Started
  {
    id: 'create-stokvel',
    category: 'getting-started',
    question: 'How do I create a stokvel?',
    keywords: ['create', 'start', 'new', 'setup'],
    answer: (
      <div className="space-y-2">
        <p>Follow these steps:</p>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Click "Browse Stokvel Types" from My Stokvels page</li>
          <li>Choose a stokvel type that matches your goal</li>
          <li>Fill in basic information (name, description)</li>
          <li>Set financial details (contribution amount, target)</li>
          <li>Add initial members with their roles</li>
          <li>Review and create</li>
        </ol>
        <p className="mt-2">Your stokvel will be active immediately, and members will receive invitations.</p>
      </div>
    )
  },
  {
    id: 'minimum-members',
    category: 'getting-started',
    question: 'How many members do I need to start?',
    keywords: ['minimum', 'members', 'size', 'how many'],
    answer: 'You can start with as few as 3 members, but most stokvels work best with 10-15 members. This balances manageable group size with adequate monthly pools and reasonable rotation duration.'
  },
  {
    id: 'change-stokvel-type',
    category: 'getting-started',
    question: 'Can I change the stokvel type after creation?',
    keywords: ['change', 'type', 'modify', 'switch'],
    answer: 'Generally no, because stokvel types have different payout rules and logic. Changing types would disrupt the existing calculations and agreements. You\'d need to create a new stokvel with the correct type instead.'
  },
  {
    id: 'join-mid-cycle',
    category: 'getting-started',
    question: 'What if a member wants to join mid-cycle?',
    keywords: ['join', 'late', 'mid-cycle', 'add member'],
    answer: 'New members can join anytime. Assign them the next available rotation number. They typically join at the end of the queue and may need to make catch-up contributions to equalize their position with existing members.'
  },

  // Contributions
  {
    id: 'record-contribution',
    category: 'contributions',
    question: 'How do I record a contribution?',
    keywords: ['record', 'add', 'payment', 'contribution'],
    answer: (
      <div className="space-y-2">
        <ol className="list-decimal pl-6 space-y-1">
          <li>Go to Contributions page</li>
          <li>Click "Record Contribution"</li>
          <li>Select the member who paid</li>
          <li>Enter month, amount, and date paid</li>
          <li>Upload proof of payment (recommended)</li>
          <li>Add any notes and save</li>
        </ol>
        <p className="mt-2">The contribution will be recorded as "Unverified" until an admin verifies it.</p>
      </div>
    )
  },
  {
    id: 'proof-of-payment',
    category: 'contributions',
    question: 'Do I need proof of payment?',
    keywords: ['proof', 'receipt', 'evidence', 'document'],
    answer: 'It\'s highly recommended but not always required. Proof of payment helps admins verify contributions quickly and reduces disputes. Supported formats include JPG, PNG, and PDF. Examples: bank receipt, deposit slip, mobile money screenshot.'
  },
  {
    id: 'verify-contribution',
    category: 'contributions',
    question: 'How do I verify contributions?',
    keywords: ['verify', 'approve', 'confirm', 'validation'],
    answer: 'Admins can verify contributions by going to the Contributions page, filtering by "Unverified" status, reviewing proof of payment, cross-checking with bank statements, and clicking "Verify" if correct. Only verified contributions count toward the balance and payout triggers.'
  },
  {
    id: 'missed-payment',
    category: 'contributions',
    question: 'What if I miss a payment?',
    keywords: ['missed', 'late', 'overdue', 'skip'],
    answer: 'Communicate with your admin immediately. Most stokvels have a 3-7 day grace period. Persistent non-payment may affect your rotation turn or membership status. Options include: extension with or without late fee, partial payment arrangement, skip turn in rotation, or temporary inactive status.'
  },
  {
    id: 'partial-payment',
    category: 'contributions',
    question: 'Can I make a partial payment?',
    keywords: ['partial', 'split', 'installment'],
    answer: 'Some stokvels allow partial payments, others require full amounts. Check with your admin. If allowed, record the actual amount paid, add a note about it being partial, and create a second contribution entry when the balance is paid.'
  },
  {
    id: 'change-contribution-amount',
    category: 'contributions',
    question: 'Can the monthly contribution amount be changed?',
    keywords: ['change', 'increase', 'decrease', 'amount'],
    answer: 'Yes, but it requires group agreement/vote. Changes apply to future contributions only (not retroactive). Document the reason, update in Settings → Financial Settings, and notify all members. Increases are more common than decreases.'
  },

  // Payouts
  {
    id: 'when-payout',
    category: 'payouts',
    question: 'When will I receive my payout?',
    keywords: ['when', 'receive', 'turn', 'timing'],
    answer: (
      <div className="space-y-2">
        <p>It depends on your stokvel type and rotation position:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Vehicle Stokvel:</strong> When balance reaches target amount (e.g., R100,000) and it\'s your turn in rotation</li>
          <li><strong>Grocery Stokvel:</strong> Your designated month in rotation (when all members have contributed)</li>
          <li><strong>Christmas Stokvel:</strong> Designated payout month (typically December)</li>
          <li><strong>Burial Society:</strong> When a qualifying event occurs (emergency-based)</li>
          <li><strong>Investment Club:</strong> When profits are available for distribution</li>
          <li><strong>Education Fund:</strong> When your application is approved</li>
        </ul>
      </div>
    )
  },
  {
    id: 'process-payout',
    category: 'payouts',
    question: 'How do I process a payout?',
    keywords: ['process', 'distribute', 'pay', 'disburse'],
    answer: 'Go to Payouts page. When the system shows payout is ready, review next eligible member and amount, click "Process Payout", execute payment (bank transfer, cash, etc.), record payout in system with proof. Member status updates automatically.'
  },
  {
    id: 'skip-turn',
    category: 'payouts',
    question: 'Can I skip my turn in rotation?',
    keywords: ['skip', 'postpone', 'delay', 'swap'],
    answer: 'Yes, in most cases. Discuss with your group. You can go to the back of the rotation or swap positions with someone else (with mutual agreement). All changes must be documented and communicated to all members.'
  },
  {
    id: 'contribute-after-receiving',
    category: 'payouts',
    question: 'Do I contribute after receiving my payout?',
    keywords: ['after', 'continue', 'post-receipt'],
    answer: 'Usually yes! In vehicle stokvels, you contribute a higher amount after receiving (e.g., R8,000 vs R3,500) to help others. This is built into the stokvel model to ensure fairness and help remaining members reach their goals faster.'
  },
  {
    id: 'payout-amount-less',
    category: 'payouts',
    question: 'What if payout amount is less than expected?',
    keywords: ['less', 'lower', 'amount', 'calculation'],
    answer: 'Review the payout calculation methodology. Check if rollover from previous cycle reduces current payout. Verify the target amount matches your expectations. If there\'s an error, contact your admin to investigate and correct the records.'
  },

  // Members
  {
    id: 'rotation-order',
    category: 'members',
    question: 'How does rotation order work?',
    keywords: ['rotation', 'order', 'queue', 'sequence'],
    answer: 'Members are assigned numbers (1, 2, 3, etc.). Member #1 receives first payout. After receiving, they\'re skipped in future cycles. The next eligible member (lowest number who hasn\'t received) is next. Inactive members are skipped automatically.'
  },
  {
    id: 'invite-member',
    category: 'members',
    question: 'How do I invite a new member?',
    keywords: ['invite', 'invitation', 'link', 'join', 'add'],
    answer: (
      <div className="space-y-2">
        <p>Use the secure Member Invitation System:</p>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Go to Members page (admins only)</li>
          <li>Click "Invite Member" button</li>
          <li>Fill in member details (name, email, role, rotation order)</li>
          <li>Click "Generate Invitation"</li>
          <li>Share the link via Copy, WhatsApp, or Email</li>
        </ol>
        <p className="mt-2">The invitation link is single-use, expires in 7 days, and requires the member to register/login with the invited email address.</p>
      </div>
    )
  },
  {
    id: 'invitation-security',
    category: 'members',
    question: 'How secure are invitation links?',
    keywords: ['security', 'safe', 'invitation', 'link'],
    answer: (
      <div className="space-y-2">
        <p>Invitation links have multiple security layers:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Single-use:</strong> Each link can only be used once</li>
          <li><strong>Time-limited:</strong> Links expire after 7 days automatically</li>
          <li><strong>Email verification:</strong> Members must register with the exact email from the invitation</li>
          <li><strong>Phone verification:</strong> Optional secondary verification via phone number</li>
          <li><strong>Admin-only creation:</strong> Only stokvel admins can generate invitations</li>
          <li><strong>Revocable:</strong> Admins can cancel pending invitations anytime</li>
        </ul>
      </div>
    )
  },
  {
    id: 'invitation-expired',
    category: 'members',
    question: 'What if my invitation link expired?',
    keywords: ['expired', 'old', 'invalid', 'invitation'],
    answer: 'Contact your stokvel admin to request a new invitation. They can generate a fresh link for you from the Members page. Expired invitations cannot be reused for security reasons. The 7-day expiration ensures invitations remain secure and timely.'
  },
  {
    id: 'pending-invitations',
    category: 'members',
    question: 'How do I see pending invitations?',
    keywords: ['pending', 'waiting', 'invitations', 'manage'],
    answer: 'Admins can view all pending invitations on the Members page in a dedicated "Pending Invitations" section. This shows who has been invited but hasn\'t joined yet, including their email, role, expiration date, and rotation order. Admins can also revoke pending invitations from this section.'
  },
  {
    id: 'add-member',
    category: 'members',
    question: 'Can I add members manually without invitations?',
    keywords: ['add', 'manual', 'direct', 'without invitation'],
    answer: 'Yes! Admins can still add members manually using the "Add Member" button. This is useful for offline scenarios or when you have all member details upfront. However, invitation links are recommended for better security and member verification.'
  },
  {
    id: 'remove-member',
    category: 'members',
    question: 'Can I remove a member?',
    keywords: ['remove', 'delete', 'kick out'],
    answer: 'Yes, but follow proper process: document issues, communicate with member, give opportunity to remedy, bring to group for vote if persistent, settle all financial obligations before removal. Consider marking inactive instead of removing for temporary situations.'
  },
  {
    id: 'member-roles',
    category: 'members',
    question: 'What are the different member roles?',
    keywords: ['roles', 'admin', 'permissions'],
    answer: (
      <div className="space-y-2">
        <p><strong>Admin Role:</strong> Can add/remove members, verify contributions, approve/process payouts, modify settings, access all reports, mark members inactive.</p>
        <p><strong>Member Role:</strong> Can view their contribution history, see current balance and reports, view payout schedule, upload proof of payment, view other members (names only).</p>
        <p className="mt-2">Recommended: Have 2-3 admins for accountability and availability.</p>
      </div>
    )
  },

  // Fairness
  {
    id: 'fairness-calculation',
    category: 'fairness',
    question: 'What is fairness calculation?',
    keywords: ['fairness', 'adjustment', 'equitable', 'balance'],
    answer: (
      <div className="space-y-2">
        <p>Fairness calculation ensures all members pay the same total amount despite timing differences in rotation:</p>
        <p><strong>The Problem:</strong> Early receivers pay more total (longer time at higher rate), late receivers pay less (shorter time).</p>
        <p><strong>The Solution:</strong> After all receive payouts, calculate:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Net Position = Vehicle Value - Total Paid</li>
          <li>Average Net Position = Average of all members</li>
          <li>Adjustment = Average - Member\'s Net Position</li>
        </ul>
        <p className="mt-2">Members with positive adjustments receive refunds. Members with negative adjustments pay in. This equalizes everyone\'s total cost.</p>
      </div>
    )
  },
  {
    id: 'when-fairness',
    category: 'fairness',
    question: 'When does fairness calculation happen?',
    keywords: ['when', 'trigger', 'timing'],
    answer: 'Fairness calculation runs automatically after all members have received their payouts (one complete cycle). For a 13-member vehicle stokvel, this happens after the 13th member receives their vehicle. The system tracks this and shows when cycle is complete.'
  },
  {
    id: 'fairness-required',
    category: 'fairness',
    question: 'Do I have to participate in fairness adjustment?',
    keywords: ['required', 'mandatory', 'optional'],
    answer: 'If it was agreed upon in the stokvel rules, yes. Fairness is essential for ethical operation and ensures no one is disadvantaged by their position in rotation. Without fairness adjustment, early members subsidize late members significantly.'
  },

  // Technical
  {
    id: 'install-pwa',
    category: 'technical',
    question: 'How do I install as a mobile app?',
    keywords: ['install', 'pwa', 'app', 'mobile'],
    answer: (
      <div className="space-y-2">
        <p><strong>Android:</strong> Visit site in Chrome, tap the install prompt or browser menu → "Install app"</p>
        <p><strong>iOS:</strong> Visit in Safari, tap Share button → "Add to Home Screen"</p>
        <p className="mt-2">The app will appear on your home screen like a native app and can work offline with limited functionality.</p>
      </div>
    )
  },
  {
    id: 'forgot-password',
    category: 'technical',
    question: 'What if I lose my password?',
    keywords: ['forgot', 'password', 'reset', 'lost'],
    answer: 'Click "Forgot Password" on the login page. You\'ll receive a password reset link via email (check spam folder). Create a new secure password. If you don\'t receive the email within 5 minutes, try again or contact support.'
  },
  {
    id: 'export-data',
    category: 'technical',
    question: 'Can I export my data?',
    keywords: ['export', 'download', 'backup'],
    answer: 'Yes, admins can export reports in PDF, Excel, or CSV formats from the Reports page. This includes contribution history, payout records, member information, and financial summaries. Regular exports are recommended for record-keeping.'
  },
  {
    id: 'offline-usage',
    category: 'technical',
    question: 'Can I use this offline?',
    keywords: ['offline', 'no internet', 'connection'],
    answer: 'Limited offline capability is available if you install as a PWA. You can view cached data, but recording contributions and payouts requires internet connection. Changes made offline will sync when you reconnect.'
  },
  {
    id: 'supported-browsers',
    category: 'technical',
    question: 'What browsers are supported?',
    keywords: ['browser', 'compatibility', 'supported'],
    answer: 'Modern browsers are fully supported: Chrome, Firefox, Safari, and Edge (latest versions). Mobile browsers are also supported. For best experience, keep your browser updated to the latest version.'
  }
]

const categories = [
  { id: 'all', name: 'All Questions', icon: HelpCircle },
  { id: 'general', name: 'General', icon: Book },
  { id: 'getting-started', name: 'Getting Started', icon: Users },
  { id: 'contributions', name: 'Contributions', icon: CreditCard },
  { id: 'payouts', name: 'Payouts', icon: TrendingUp },
  { id: 'members', name: 'Members', icon: Users },
  { id: 'fairness', name: 'Fairness', icon: Calculator },
  { id: 'technical', name: 'Technical', icon: Settings }
]

export function FAQ() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filteredFaqs = faqData.filter(faq => {
    const matchesSearch = searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="bg-primary/10 p-4 rounded-full">
            <HelpCircle className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold">Frequently Asked Questions</h1>
        <p className="text-muted-foreground text-lg">
          Find answers to common questions about using the Vehicle Stokvel Tracker
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search FAQs by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-lg h-12"
            />
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => {
          const Icon = category.icon
          const count = category.id === 'all'
            ? faqData.length
            : faqData.filter(faq => faq.category === category.id).length

          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {category.name}
              <span className="ml-1 text-xs opacity-75">({count})</span>
            </Button>
          )
        })}
      </div>

      {/* FAQ Items */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No FAQs found for "{searchQuery}"</p>
              <p className="text-sm mt-2">Try different keywords or browse categories</p>
            </CardContent>
          </Card>
        ) : (
          filteredFaqs.map(faq => (
            <Card key={faq.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <button
                onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                className="w-full text-left"
              >
                <CardHeader className="hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-lg font-semibold flex-1">
                      {faq.question}
                    </CardTitle>
                    {expandedId === faq.id ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                    )}
                  </div>
                </CardHeader>
              </button>
              {expandedId === faq.id && (
                <CardContent className="border-t bg-accent/20">
                  <div className="text-muted-foreground">
                    {typeof faq.answer === 'string' ? (
                      <p>{faq.answer}</p>
                    ) : (
                      faq.answer
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Help Footer */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            Still need help?
          </CardTitle>
          <CardDescription>
            Check out our comprehensive user guide or contact your stokvel administrator for assistance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <a href="/USER_GUIDE.md" target="_blank" rel="noopener noreferrer">
              View Complete User Guide
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
