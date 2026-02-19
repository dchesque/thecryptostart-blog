'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { BlogPost } from '@/types/blog'
import { getCategoryName } from '@/lib/constants'

interface SidebarProps {
  recentPosts?: BlogPost[]
  popularPosts?: BlogPost[]
}

/**
 * Sidebar component for blog pages
 * Shows recent and popular posts
 */
export default function Sidebar({ recentPosts = [], popularPosts = [] }: SidebarProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <aside className="space-y-8">
      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <section>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-crypto-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recent Posts
          </h3>
          <div className="space-y-4">
            {recentPosts.slice(0, 5).map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex gap-3 p-3 rounded-lg bg-crypto-darker border border-crypto-primary/5 hover:border-crypto-primary/20 transition-all duration-300"
              >
                {/* Thumbnail */}
                {post.featuredImage ? (
                  <div className="relative w-20 h-20 flex-shrink-0 rounded overflow-hidden">
                    <Image
                      src={post.featuredImage.url}
                      alt={post.featuredImage.title || post.title}
                      fill
                      loading="lazy"
                      quality={85}
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      sizes="80px"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 flex-shrink-0 rounded bg-gradient-to-br from-crypto-primary/20 to-crypto-accent/20 flex items-center justify-center text-2xl">
                    📰
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-semibold text-crypto-primary uppercase tracking-wide">
                    {getCategoryName(post.category)}
                  </span>
                  <h4 className="text-sm font-semibold text-white group-hover:text-crypto-primary transition-colors line-clamp-2 mt-1">
                    {post.title}
                  </h4>
                  <time className="text-xs text-gray-500 mt-1 block">
                    {formatDate(post.publishedAt)}
                  </time>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Popular Posts */}
      {popularPosts.length > 0 && (
        <section>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-crypto-accent" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            Popular
          </h3>
          <div className="space-y-3">
            {popularPosts.slice(0, 5).map((post, index) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex items-center gap-3 p-2 rounded-lg hover:bg-crypto-darker/50 transition-all duration-300"
              >
                {/* Rank Badge */}
                <div className={`flex-shrink-0 w-8 h-8 rounded flex items-center justify-center font-bold text-sm ${index === 0
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                  : index === 1
                    ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800'
                    : index === 2
                      ? 'bg-gradient-to-br from-orange-300 to-orange-400 text-white'
                      : 'bg-crypto-primary/10 text-crypto-primary'
                  }`}>
                  {index + 1}
                </div>

                {/* Title & Stats */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors line-clamp-1">
                    {post.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                    <span>{post.readingTime} min</span>
                    <span>·</span>
                    <span>{getCategoryName(post.category)}</span>
                  </div>
                </div>

                {/* Trending Indicator */}
                {index < 3 && (
                  <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 14l5-5 5 5" />
                  </svg>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Categories Widget */}
      <section>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-crypto-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          Categories
        </h3>
        <div className="flex flex-wrap gap-2">
          {['bitcoin', 'ethereum', 'defi', 'crypto-basics', 'investing-and-strategy', 'crypto-security'].map((category) => (
            <Link
              key={category}
              href={`/blog?category=${category}`}
              className="px-4 py-2 rounded-full text-sm font-medium bg-crypto-darker border border-crypto-primary/10 text-gray-300 hover:border-crypto-primary hover:text-white transition-all duration-300"
            >
              {getCategoryName(category as any)}
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-gradient-to-br from-crypto-primary/10 to-crypto-accent/10 rounded-xl p-6 border border-crypto-primary/20">
        <h3 className="text-xl font-bold text-white mb-2">Stay Updated 🚀</h3>
        <p className="text-sm text-gray-400 mb-4">
          Get the latest crypto insights delivered to your inbox weekly.
        </p>
        <form className="space-y-3">
          <input
            type="email"
            placeholder="your@email.com"
            className="w-full px-4 py-2.5 rounded-lg bg-crypto-darker border border-crypto-primary/20 text-white placeholder-gray-500 focus:border-crypto-primary focus:outline-none focus:ring-2 focus:ring-crypto-primary/20 transition-all"
            required
          />
          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-crypto-primary hover:bg-crypto-accent text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-crypto-primary/20"
          >
            Subscribe
          </button>
        </form>
      </section>
    </aside>
  )
}
