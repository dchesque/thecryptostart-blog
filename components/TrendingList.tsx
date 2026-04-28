'use client'

import Link from 'next/link'
import { BlogPost } from '@/types/blog'
import { getCategoryName } from '@/lib/constants'

interface TrendingListProps {
  posts: BlogPost[]
  limit?: number
  className?: string
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })

/**
 * Numbered "trending" list, editorial-style. The numbers are the visual
 * anchor; everything else is restrained.
 */
export default function TrendingList({
  posts,
  limit = 5,
  className = '',
}: TrendingListProps) {
  if (!posts || posts.length === 0) return null
  const list = posts.slice(0, limit)

  return (
    <ol className={`divide-y divide-line ${className}`}>
      {list.map((post, index) => (
        <li key={post.id}>
          <Link
            href={`/blog/${post.slug}`}
            className="group grid grid-cols-[auto_1fr] gap-5 py-5 items-start"
          >
            <span
              className="font-heading font-bold text-2xl md:text-3xl text-ink-faint tabular-nums tracking-tight leading-none pt-0.5 group-hover:text-accent transition-colors"
              aria-hidden
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <div>
              <span className="eyebrow">{getCategoryName(post.category)}</span>
              <h4 className="mt-2 font-heading text-lg leading-snug text-ink group-hover:text-accent-deep transition-colors line-clamp-2 text-balance">
                {post.title}
              </h4>
              <div className="mt-2 flex items-center gap-3 text-xs text-ink-mute">
                <span>{post.readingTime} min read</span>
                <span aria-hidden className="w-1 h-1 rounded-full bg-line" />
                <span>{formatDate(post.publishedAt)}</span>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ol>
  )
}
