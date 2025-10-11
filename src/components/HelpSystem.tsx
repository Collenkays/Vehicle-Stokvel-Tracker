import { useState } from 'react'
import { X, HelpCircle, Book, MessageCircle, ExternalLink, ChevronDown, ChevronRight, Search } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface HelpTopic {
  id: string
  title: string
  content: string
  category: 'getting-started' | 'contributions' | 'payouts' | 'members' | 'settings' | 'fairness'
  keywords: string[]
}

const helpTopics: HelpTopic[] = [
  {
    id: 'what-is-stokvel',
    title: 'What is a Stokvel?',
    category: 'getting-started',
    keywords: ['stokvel', 'definition', 'basics', 'introduction'],
    content: `A stokvel is a South African savings club where members pool money together for a common purpose. Members contribute regularly (usually monthly), and funds are distributed according to agreed-upon rules. Stokvels are built on trust, community, and mutual support.`
  },
  {
    id: 'create-stokvel',
    title: 'How do I create a stokvel?',
    category: 'getting-started',
    keywords: ['create', 'new', 'start', 'setup'],
    content: `1. Click "Browse Stokvel Types" from My Stokvels page
2. Choose a stokvel type that matches your goal
3. Fill in basic information (name, description)
4. Set financial details (contribution amount, target)
5. Add initial members with their roles
6. Review and create

Your stokvel will be active immediately, and members will receive invitations.`
  },
  {
    id: 'record-contribution',
    title: 'How do I record a contribution?',
    category: 'contributions',
    keywords: ['contribution', 'payment', 'record', 'pay'],
    content: `1. Go to Contributions page
2. Click "Record Contribution"
3. Select the member who paid
4. Enter month, amount, and date paid
5. Upload proof of payment (recommended)
6. Add any notes
7. Save

The contribution will be recorded as "Unverified" until an admin verifies it by checking the proof of payment.`
  },
  {
    id: 'verify-contribution',
    title: 'How do I verify contributions?',
    category: 'contributions',
    keywords: ['verify', 'approve', 'confirm', 'check'],
    content: `Admins can verify contributions by:

1. Going to Contributions page
2. Filtering by "Unverified" status
3. Reviewing each contribution and proof of payment
4. Cross-checking with bank statements
5. Clicking "Verify" if correct, or "Reject" if issues found

Only verified contributions count toward the stokvel balance and payout triggers.`
  },
  {
    id: 'process-payout',
    title: 'How do I process a payout?',
    category: 'payouts',
    keywords: ['payout', 'distribute', 'pay', 'disburse'],
    content: `1. Go to Payouts page
2. System shows when payout is ready based on rules
3. Review next eligible member and amount
4. Click "Process Payout"
5. Execute payment (bank transfer, cash, etc.)
6. Record payout in system with proof
7. Member status updates automatically

The next eligible member is determined by rotation order and who hasn't received yet.`
  },
  {
    id: 'rotation-order',
    title: 'How does rotation order work?',
    category: 'members',
    keywords: ['rotation', 'order', 'turn', 'queue'],
    content: `Rotation order determines who receives payouts in sequence:

- Members are assigned numbers (1, 2, 3, etc.)
- Member #1 receives first payout
- After receiving, they're skipped in future cycles
- Next eligible member (lowest number who hasn't received) is next
- Inactive members are skipped automatically

Rotation order can be changed with group agreement before payouts begin.`
  },
  {
    id: 'fairness-calculation',
    title: 'What is fairness calculation?',
    category: 'fairness',
    keywords: ['fairness', 'adjustment', 'equitable', 'balance'],
    content: `Fairness calculation ensures all members pay the same total amount despite timing differences:

**The Problem**: Early receivers pay more total (longer time at higher rate), late receivers pay less (shorter time).

**The Solution**: After all receive payouts, calculate each member's net position:
- Net Position = Vehicle Value - Total Paid
- Average Net Position = Average of all members
- Adjustment = Average - Member's Net Position

Members with positive adjustments receive refunds. Members with negative adjustments pay in. This equalizes everyone's total cost.`
  },
  {
    id: 'add-member',
    title: 'How do I add a new member?',
    category: 'members',
    keywords: ['add', 'invite', 'new member', 'join'],
    content: `Admins can add members:

1. Go to Members page
2. Click "Add New Member"
3. Enter full name, email, contact number
4. Select role (Admin or Member)
5. Assign rotation order (next available number)
6. Set join date
7. Save

New members joining mid-cycle typically go to end of rotation queue and may need catch-up contributions.`
  },
  {
    id: 'change-contribution-amount',
    title: 'Can I change the monthly contribution amount?',
    category: 'settings',
    keywords: ['change', 'contribution', 'amount', 'increase'],
    content: `Yes, but with important considerations:

1. Requires group agreement/vote
2. Changes apply to future contributions only (not retroactive)
3. Document reason for change
4. Update in Settings → Financial Settings
5. Notify all members of the change

Increases are more common than decreases. Decreasing may extend cycle duration significantly.`
  },
  {
    id: 'missed-payment',
    title: 'What happens if someone misses a payment?',
    category: 'contributions',
    keywords: ['late', 'missed', 'skip', 'overdue'],
    content: `Handling missed payments:

1. **Communication**: Contact member immediately
2. **Grace Period**: Most stokvels have 3-7 day grace period
3. **Options**:
   - Extension with or without late fee
   - Partial payment arrangement
   - Skip their turn in rotation
   - Temporary inactive status
4. **Document**: Record all agreements
5. **Group Decision**: Persistent non-payment may require group intervention

Prevention: Send reminders before due date, align due dates with pay cycles.`
  },
  {
    id: 'payout-ready',
    title: 'When is a payout ready?',
    category: 'payouts',
    keywords: ['ready', 'trigger', 'eligible', 'due'],
    content: `Payouts are ready when trigger conditions are met:

**Vehicle Stokvel**: Balance reaches target amount (e.g., R100,000)
**Grocery Stokvel**: All members have contributed for the month
**Christmas Stokvel**: Designated payout month arrives (e.g., December)
**Burial Society**: Qualifying event occurs (needs manual trigger)
**Investment Club**: Profits are available for distribution
**Education Fund**: Member applies and is approved

The system automatically detects when conditions are met and shows "Ready for Payout" indicator.`
  },
  {
    id: 'reports',
    title: 'What reports are available?',
    category: 'settings',
    keywords: ['reports', 'analytics', 'export', 'download'],
    content: `Available reports:

**Dashboard**: Real-time overview with key metrics
**Contributions**: Monthly summaries, member history, outstanding payments
**Payouts**: Payout history, rotation status, distribution analysis
**Financial**: Balance sheet, cash flow, member financial summary
**Performance**: Member participation, compliance rates, stokvel health

Reports can be exported in PDF, Excel, or CSV formats for further analysis or record-keeping.`
  }
]

const faqItems = [
  {
    question: 'Do I need to create an account?',
    answer: 'Yes, you need to sign up with an email and password to keep your stokvel data secure and private.'
  },
  {
    question: 'Can I manage multiple stokvels?',
    answer: 'Yes! You can create, join, and manage multiple stokvels from one account. Use "My Stokvels" to switch between them.'
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes, the application uses industry-standard encryption and security practices. Only you and your stokvel members can access your data.'
  },
  {
    question: 'Can I use this on my phone?',
    answer: 'Absolutely! The application is fully mobile-responsive. You can also install it as a Progressive Web App (PWA) for offline access.'
  },
  {
    question: 'How many members do I need to start?',
    answer: 'You can start with as few as 3 members, but most stokvels work best with 10-15 members for balanced group size and adequate monthly pools.'
  },
  {
    question: 'Do I need proof of payment?',
    answer: 'It\'s highly recommended but not always required. Proof helps admins verify quickly and reduces disputes.'
  },
  {
    question: 'What if I miss a payment?',
    answer: 'Communicate with your admin. Most stokvels have a 3-7 day grace period. Persistent non-payment may affect your rotation turn or membership.'
  },
  {
    question: 'Can I skip my turn in rotation?',
    answer: 'Yes, in most cases. Discuss with your group. You\'d go to the back of the rotation or swap positions with someone else (with agreement).'
  },
  {
    question: 'When do I receive my payout?',
    answer: 'It depends on your stokvel type and rotation position. Vehicle stokvels: when balance reaches target and it\'s your turn. Grocery stokvels: your designated month.'
  },
  {
    question: 'Do I contribute after receiving my payout?',
    answer: 'Usually yes! In vehicle stokvels, you contribute a higher amount after receiving (e.g., R8,000 vs R3,500) to help others.'
  }
]

export function HelpSystem() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const filteredTopics = helpTopics.filter(topic => {
    const query = searchQuery.toLowerCase()
    return (
      topic.title.toLowerCase().includes(query) ||
      topic.content.toLowerCase().includes(query) ||
      topic.keywords.some(keyword => keyword.includes(query))
    )
  })

  const filteredFaqs = faqItems.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const topicsByCategory = {
    'getting-started': filteredTopics.filter(t => t.category === 'getting-started'),
    'contributions': filteredTopics.filter(t => t.category === 'contributions'),
    'payouts': filteredTopics.filter(t => t.category === 'payouts'),
    'members': filteredTopics.filter(t => t.category === 'members'),
    'settings': filteredTopics.filter(t => t.category === 'settings'),
    'fairness': filteredTopics.filter(t => t.category === 'fairness')
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 z-50"
        aria-label="Help"
      >
        <HelpCircle className="h-6 w-6" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <HelpCircle className="h-6 w-6" />
                Help & Support
              </DialogTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search help topics, FAQs, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </DialogHeader>

          <Tabs defaultValue="help" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b px-6">
              <TabsTrigger value="help" className="gap-2">
                <Book className="h-4 w-4" />
                Help Topics
              </TabsTrigger>
              <TabsTrigger value="faq" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                FAQ
              </TabsTrigger>
              <TabsTrigger value="guide" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Full Guide
              </TabsTrigger>
            </TabsList>

            <div className="h-[calc(85vh-200px)] overflow-y-auto">
              <TabsContent value="help" className="p-6 space-y-6 m-0">
                {searchQuery && filteredTopics.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No help topics found for "{searchQuery}"</p>
                    <p className="text-sm mt-2">Try different keywords or browse categories below</p>
                  </div>
                )}

                {!searchQuery || filteredTopics.length > 0 ? (
                  <>
                    {Object.entries(topicsByCategory).map(([category, topics]) => {
                      if (topics.length === 0 && searchQuery) return null
                      return (
                        <div key={category}>
                          <h3 className="text-lg font-semibold mb-3 capitalize flex items-center gap-2 text-primary">
                            {category === 'getting-started' && '🚀 Getting Started'}
                            {category === 'contributions' && '💰 Contributions'}
                            {category === 'payouts' && '💳 Payouts'}
                            {category === 'members' && '👥 Members'}
                            {category === 'settings' && '⚙️ Settings'}
                            {category === 'fairness' && '⚖️ Fairness'}
                          </h3>
                          <div className="space-y-3">
                            {topics.map(topic => (
                              <div
                                key={topic.id}
                                className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                              >
                                <h4 className="font-medium mb-2">{topic.title}</h4>
                                <p className="text-sm text-muted-foreground whitespace-pre-line">
                                  {topic.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </>
                ) : null}
              </TabsContent>

              <TabsContent value="faq" className="p-6 space-y-3 m-0">
                {searchQuery && filteredFaqs.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No FAQs found for "{searchQuery}"</p>
                  </div>
                )}

                {filteredFaqs.map((faq, index) => (
                  <div
                    key={index}
                    className="border rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      className="w-full p-4 text-left hover:bg-accent/50 transition-colors flex items-start justify-between gap-3"
                    >
                      <span className="font-medium flex-1">{faq.question}</span>
                      {expandedFaq === index ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      )}
                    </button>
                    {expandedFaq === index && (
                      <div className="p-4 pt-0 text-sm text-muted-foreground border-t bg-accent/20">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="guide" className="p-6 m-0">
                <div className="space-y-4">
                  <div className="bg-accent/50 border rounded-lg p-6">
                    <Book className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Complete User Guide</h3>
                    <p className="text-muted-foreground mb-4">
                      Access the comprehensive user guide for detailed information on all features,
                      workflows, best practices, and troubleshooting tips.
                    </p>
                    <Button asChild className="w-full sm:w-auto" onClick={() => setIsOpen(false)}>
                      <a
                        href="/user-guide"
                        className="flex items-center gap-2"
                      >
                        <Book className="h-4 w-4" />
                        Open Full User Guide
                      </a>
                    </Button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">📖 What's Included</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Complete feature documentation</li>
                        <li>• Step-by-step tutorials</li>
                        <li>• All 8 stokvel types explained</li>
                        <li>• Fairness calculations in detail</li>
                        <li>• Best practices and tips</li>
                      </ul>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">🎯 Quick Sections</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Getting Started</li>
                        <li>• Creating Your First Stokvel</li>
                        <li>• Managing Members</li>
                        <li>• Recording Contributions</li>
                        <li>• Processing Payouts</li>
                        <li>• Troubleshooting</li>
                      </ul>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                    <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
                      💡 Quick Reference Card
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      The user guide includes a printable quick reference card with common tasks,
                      navigation shortcuts, and emergency contacts.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <div className="border-t p-4 bg-muted/30">
            <p className="text-sm text-muted-foreground text-center">
              Need more help? Contact your stokvel administrator or check the full user guide
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
