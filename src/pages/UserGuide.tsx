import { ArrowLeft, Book, Users, CreditCard, TrendingUp, Settings, HelpCircle, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function UserGuide() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <Book className="w-6 h-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Vikoba User Guide</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Vikoba</h2>
          <p className="text-lg text-gray-600 mb-6">
            Your digital companion for managing stokvels easily and transparently.
          </p>
          <p className="text-gray-700 mb-4">
            Vikoba is a web-based tool designed to help South African communities organize, track, and grow their group savings.
            Whether your stokvel is for vehicle purchases, groceries, burial societies, or investments, Vikoba gives you the tools
            to record contributions, manage members, process payouts, and ensure fairness across all participants.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">What is a Stokvel?</h3>
            <p className="text-blue-800">
              A stokvel is a community savings group where members pool money together for a shared goal. Members contribute
              regularly (usually monthly), and funds are distributed according to agreed-upon rules. Stokvels thrive on trust,
              community, and mutual support — and Vikoba helps you digitize these values with accuracy and transparency.
            </p>
          </div>

          {/* Key Features Grid */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Multi-Stokvel Management',
                'Pre-Configured Stokvel Types',
                'Automated Payout Logic',
                'Contribution Tracking',
                'Fairness Calculations',
                'Member Management',
                'Comprehensive Reports',
                'Mobile Friendly',
                'PWA Support'
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Getting Started */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Book className="w-6 h-6 text-blue-600" />
            Getting Started
          </h2>
          <ol className="space-y-4">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                1
              </span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Sign Up or Log In</h3>
                <p className="text-gray-600">Go to the Vikoba website or app. Create an account or log in with your existing credentials.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                2
              </span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Create Your First Stokvel</h3>
                <p className="text-gray-600">Choose a stokvel type (Vehicle, Grocery, Burial, Investment, or Custom). Enter your stokvel name, contribution details, and goals.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                3
              </span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Invite Members</h3>
                <p className="text-gray-600">Send invitations by email or share your stokvel's join link. Members can register and start contributing once they join.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                4
              </span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Set Contribution Rules</h3>
                <p className="text-gray-600">Define how much each member contributes and how often. Vikoba will automatically track and calculate each member's progress.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* Understanding Stokvels */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Understanding Stokvels</h2>
          <p className="text-gray-700 mb-4">
            Each stokvel can have its own goals, structure, and rules. Vikoba supports several stokvel types:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">🚗 Vehicle Purchase Stokvels</h3>
              <p className="text-gray-600 text-sm">Save collectively to buy vehicles.</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">🛒 Grocery Stokvels</h3>
              <p className="text-gray-600 text-sm">Pool funds to purchase groceries in bulk.</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">⚰️ Burial Societies</h3>
              <p className="text-gray-600 text-sm">Support members in times of loss through quick, managed payouts.</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">📈 Investment Clubs</h3>
              <p className="text-gray-600 text-sm">Grow collective funds through savings and investments.</p>
            </div>
          </div>
        </section>

        {/* Managing Members */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Managing Members
          </h2>
          <p className="text-gray-700 mb-4">Vikoba makes it easy to add, organize, and monitor members.</p>
          <ul className="space-y-3">
            <li className="flex gap-3">
              <span className="text-green-600">•</span>
              <div>
                <strong className="text-gray-900">Adding Members:</strong>
                <span className="text-gray-700"> Invite members via email or share your join link.</span>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-green-600">•</span>
              <div>
                <strong className="text-gray-900">Roles:</strong>
                <span className="text-gray-700"> Assign roles such as Admin, Treasurer, or Member.</span>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-green-600">•</span>
              <div>
                <strong className="text-gray-900">Member Profiles:</strong>
                <span className="text-gray-700"> View contact details, contribution history, and payout status.</span>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-green-600">•</span>
              <div>
                <strong className="text-gray-900">Member Status:</strong>
                <span className="text-gray-700"> Track who is active, pending, or inactive.</span>
              </div>
            </li>
          </ul>
          <p className="text-gray-600 mt-4 text-sm">
            Admins can manage permissions and remove or reinstate members at any time.
          </p>
        </section>

        {/* Recording Contributions */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-600" />
            Recording Contributions
          </h2>
          <p className="text-gray-700 mb-4">Every stokvel thrives on accurate contribution tracking.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Automatic Records</h3>
              <p className="text-gray-600 text-sm">Contributions made through linked payment channels are auto-recorded.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Manual Entries</h3>
              <p className="text-gray-600 text-sm">Admins can log contributions manually and upload proof of payment.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Notifications</h3>
              <p className="text-gray-600 text-sm">Members receive reminders and confirmation messages for payments.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Contribution Reports</h3>
              <p className="text-gray-600 text-sm">View total contributions, balances, and missed payments.</p>
            </div>
          </div>
        </section>

        {/* Managing Payouts */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            Managing Payouts
          </h2>
          <p className="text-gray-700 mb-4">Vikoba automates the payout process using your stokvel's defined rules.</p>
          <ul className="space-y-3">
            <li className="flex gap-3">
              <span className="text-green-600">•</span>
              <div>
                <strong className="text-gray-900">Rotation System:</strong>
                <span className="text-gray-700"> Members receive payouts in the order you specify.</span>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-green-600">•</span>
              <div>
                <strong className="text-gray-900">Equal Share System:</strong>
                <span className="text-gray-700"> Payouts are split equally after each cycle.</span>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-green-600">•</span>
              <div>
                <strong className="text-gray-900">Automated Triggers:</strong>
                <span className="text-gray-700"> Payouts can be set to release once all contributions are complete.</span>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-green-600">•</span>
              <div>
                <strong className="text-gray-900">Manual Control:</strong>
                <span className="text-gray-700"> Admins can review and approve payouts before they're processed.</span>
              </div>
            </li>
          </ul>
          <p className="text-gray-600 mt-4 text-sm">
            All payouts are recorded for transparency and auditing.
          </p>
        </section>

        {/* Fairness Calculations */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Understanding Fairness Calculations
          </h2>
          <p className="text-gray-700 mb-4">
            Fairness is at the heart of every stokvel. Vikoba's fairness engine ensures:
          </p>
          <ul className="space-y-3">
            <li className="flex gap-3">
              <span className="text-green-600">•</span>
              <span className="text-gray-700">Each member's turn or share is calculated based on contributions and rules.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-600">•</span>
              <span className="text-gray-700">Missed or delayed payments adjust the payout order automatically.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-600">•</span>
              <span className="text-gray-700">Rotation cycles are tracked to prevent duplication or skipping.</span>
            </li>
          </ul>
          <p className="text-gray-600 mt-4 text-sm">
            These calculations help maintain trust and equal opportunity within your stokvel.
          </p>
        </section>

        {/* Settings */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            Settings and Configuration
          </h2>
          <p className="text-gray-700 mb-4">Customize Vikoba to match your stokvel's unique needs.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="font-semibold text-gray-900 mb-1">Edit Stokvel Info</h3>
              <p className="text-gray-600 text-sm">Update names, goals, or contribution details.</p>
            </div>
            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="font-semibold text-gray-900 mb-1">Notification Preferences</h3>
              <p className="text-gray-600 text-sm">Choose when and how members are notified.</p>
            </div>
            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="font-semibold text-gray-900 mb-1">Security Settings</h3>
              <p className="text-gray-600 text-sm">Manage login credentials and multi-factor authentication.</p>
            </div>
            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="font-semibold text-gray-900 mb-1">Payment Options</h3>
              <p className="text-gray-600 text-sm">Configure bank details or preferred payment methods.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-blue-600" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Q: Can I run more than one stokvel at the same time?</h3>
              <p className="text-gray-700 pl-4">A: Yes! Vikoba supports multiple stokvels under one account.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Q: Do members need to create accounts?</h3>
              <p className="text-gray-700 pl-4">A: Yes, each member must have a registered profile to contribute and receive payouts.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Q: Can I change contribution amounts later?</h3>
              <p className="text-gray-700 pl-4">A: Absolutely. Admins can update contribution rules at any time.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Q: Is Vikoba secure?</h3>
              <p className="text-gray-700 pl-4">A: Vikoba uses bank-grade encryption and secure authentication to protect all data.</p>
            </div>
          </div>
        </section>

        {/* Troubleshooting */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Troubleshooting</h2>
          <p className="text-gray-700 mb-4">If you encounter an issue:</p>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="font-semibold text-blue-600">1.</span>
              <div>
                <strong className="text-gray-900">Refresh or Re-login:</strong>
                <span className="text-gray-700"> Many minor issues resolve by refreshing or logging back in.</span>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-blue-600">2.</span>
              <div>
                <strong className="text-gray-900">Check Permissions:</strong>
                <span className="text-gray-700"> Ensure your role allows the action you're trying to perform.</span>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-blue-600">3.</span>
              <div>
                <strong className="text-gray-900">Update App:</strong>
                <span className="text-gray-700"> Make sure you're using the latest version of Vikoba.</span>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-blue-600">4.</span>
              <div>
                <strong className="text-gray-900">Contact Support:</strong>
                <span className="text-gray-700"> If the issue persists, reach out through the in-app Help Center or email support@vikoba.app.</span>
              </div>
            </li>
          </ol>
        </section>

        {/* Tip Box */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <p className="text-green-900">
            <strong>✅ Tip:</strong> For the best experience, use Vikoba on Chrome or Safari and enable "Install as App" for offline access.
          </p>
        </div>
      </div>
    </div>
  )
}
