import { PublicHeader } from '../components/PublicHeader'
import { useNavigate } from 'react-router-dom'
import { blogPosts } from '../data/blogPosts'
import { Calendar, Clock, Tag, ArrowRight } from 'lucide-react'
import { Button } from '../components/ui/button'

export const Blog = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <PublicHeader />

      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Stokvel Insights & Guides
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Learn everything about stokvels, from basics to advanced management strategies.
              Expert advice to help your savings club succeed.
            </p>
          </div>

          {/* Featured Post */}
          {blogPosts.length > 0 && (
            <div className="mb-16">
              <div
                className="relative bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl overflow-hidden border border-gray-200 cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => navigate(`/blog/${blogPosts[0].slug}`)}
              >
                <div className="p-8 md:p-12">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="px-3 py-1 bg-primary text-white text-sm font-semibold rounded-full">
                      Featured
                    </span>
                    <span className="px-3 py-1 bg-white text-primary text-sm font-semibold rounded-full">
                      {blogPosts[0].category}
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    {blogPosts[0].title}
                  </h2>
                  <p className="text-lg text-gray-600 mb-6">
                    {blogPosts[0].excerpt}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(blogPosts[0].date).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{blogPosts[0].readTime}</span>
                    </div>
                  </div>
                  <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                    Read Article
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* All Posts Grid */}
          <div>
            <h2 className="text-2xl font-bold mb-8">All Articles</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                  onClick={() => navigate(`/blog/${post.slug}`)}
                >
                  {/* Image placeholder */}
                  <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                    <Tag className="w-16 h-16 text-primary/20" />
                  </div>

                  <div className="p-6">
                    {/* Category badge */}
                    <div className="mb-3">
                      <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                        {post.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(post.date).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>

                    {/* Read more */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <span className="text-primary font-semibold text-sm flex items-center gap-2 hover:gap-3 transition-all">
                        Read More
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center bg-gradient-to-r from-primary to-accent rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Start Your Stokvel Journey?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Use Vikoba to manage your stokvel with confidence and transparency
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
