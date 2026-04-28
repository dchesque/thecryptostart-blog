'use client'

import Link from 'next/link'
import Image from 'next/image'

import type { BlogPost } from '@/types/blog'
import { getCategoryName } from '@/lib/constants'
import NewsletterForm from './NewsletterForm'

interface SidebarProps {
  recentPosts?: BlogPost[]
  popularPosts?: BlogPost[]
  categories?: { slug: string; name: string; icon?: string }[]
  className?: string
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

/**
 * Editorial sidebar — light, restrained, designed to *complement* a
 * reading column rather than compete with it.
 */
export default function Sidebar({
  recentPosts = [],
  popularPosts = [],
  categories,
  className = '',
}: SidebarProps) {
  const cats = categories && categories.length > 0
    ? categories
    : [
        { slug: 'bitcoin', name: getCategoryName('bitcoin') },
        { slug: 'ethereum', name: getCategoryName('ethereum') },
        { slug: 'defi', name: getCategoryName('defi') },
        { slug: 'crypto-basics', name: getCategoryName('crypto-basics') },
        { slug: 'investing-and-strategy', name: getCategoryName('investing-and-strategy') },
        { slug: 'crypto-security', name: getCategoryName('crypto-security') },
      ]

  const list = (popularPosts.length ? popularPosts : recentPosts).slice(0, 5)

  return (
    <aside className={`space-y-10 ${className}`}>
      {/* Latest / Popular */}
      {list.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-5">
            <span className="eyebrow-mute">{popularPosts.length ? 'Most read' : 'Latest'}</span>
            <div className="flex-1 h-px bg-line" />
          </div>
          <ol className="space-y-5">
            {list.map((post, index) => (
              <li key={post.id}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group grid grid-cols-[auto_1fr] gap-3 items-start"
                >
                  <span
                    className="font-heading font-semibold text-sm text-ink-faint tabular-nums pt-0.5 group-hover:text-accent transition-colors"
                    aria-hidden
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-heading text-sm font-semibold leading-snug text-ink group-hover:text-accent-deep transition-colors line-clamp-3">
                      {post.title}
                    </h4>
                    <div className="mt-1 text-xs text-ink-mute">
                      {getCategoryName(post.category)} · {formatDate(post.publishedAt)}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Topics */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <span className="eyebrow-mute">Topics</span>
          <div className="flex-1 h-px bg-line" />
        </div>
        <div className="flex flex-wrap gap-2">
          {cats.map((cat) => (
            <Link
              key={cat.slug}
              href={`/blog?category=${cat.slug}`}
              className="tag"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="rounded-2xl bg-cream border border-line p-6">
        <h3 className="font-heading text-base font-bold text-ink leading-snug">
          One email a week.
        </h3>
        <p className="mt-1.5 text-sm text-ink-mute leading-relaxed">
          Our best articles for crypto beginners — straight to your inbox.
        </p>
        <div className="mt-4">
          <NewsletterForm />
        </div>
      </section>
    </aside>
  )
}
