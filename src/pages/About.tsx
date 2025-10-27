import { PublicHeader } from '../components/PublicHeader'
import { Button } from '../components/ui/button'
import { useNavigate } from 'react-router-dom'
import { Heart, Target, Users, TrendingUp } from 'lucide-react'

export const About = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <PublicHeader />

      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              About Vikoba
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Empowering South African stokvels with modern technology while preserving traditional values of community and trust.
            </p>
          </div>

          {/* Mission Section */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-gray-600 text-lg mb-4">
                To modernize stokvel management in South Africa by providing transparent, secure, and efficient digital tools that respect and enhance the traditional spirit of community savings.
              </p>
              <p className="text-gray-600 text-lg">
                We believe that stokvels are more than just financial arrangements – they're about community, trust, and collective prosperity. Our platform honors these values while eliminating the administrative burden.
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 aspect-square flex items-center justify-center">
              <Target className="w-48 h-48 text-primary/20" />
            </div>
          </div>

          {/* Story Section */}
          <div className="bg-white rounded-2xl p-8 md:p-12 border border-gray-200 mb-20">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-600 text-lg">
              <p>
                Vikoba was born from a simple observation: South African stokvels, despite moving billions of rands annually, were still being managed with spreadsheets, WhatsApp groups, and paper records.
              </p>
              <p>
                After witnessing the challenges faced by stokvel administrators – tracking contributions, calculating fairness adjustments, managing rotation orders, and ensuring transparency – we knew there had to be a better way.
              </p>
              <p>
                We built Vikoba specifically for the South African market, understanding the unique rules, traditions, and challenges of stokvel management. Our platform automates the tedious administrative work while preserving the human elements that make stokvels special.
              </p>
              <p>
                Today, hundreds of stokvels trust Vikoba to manage their operations, from small community groups to large federations managing millions of rands.
              </p>
            </div>
          </div>

          {/* Values Section */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Community First</h3>
                <p className="text-gray-600">
                  We prioritize the needs of stokvel communities and honor traditional values of trust and cooperation.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Transparency</h3>
                <p className="text-gray-600">
                  Complete visibility into all financial transactions and decisions builds trust among members.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Innovation</h3>
                <p className="text-gray-600">
                  We continuously improve our platform with feedback from real stokvel administrators and members.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Accessibility</h3>
                <p className="text-gray-600">
                  Our platform is designed to be user-friendly for people of all technical skill levels.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-gradient-to-r from-primary to-accent rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Join the Vikoba Community
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Start managing your stokvel the modern way
            </p>
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-gray-100 text-lg px-8"
              onClick={() => navigate('/login')}
            >
              Get Started for Free
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
