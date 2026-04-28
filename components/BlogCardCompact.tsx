import Link from 'next/link'
import Image from 'next/image'

import { BlogPost } from '@/types/blog'
import { getCategoryName } from '@/lib/constants'

interface BlogCardCompactProps {
  post: BlogPost
  variant?: 'default' | 'horizontal' | 'minimal'
  className?: string
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export default function BlogCardCompact({
  post,
  variant = 'default',
  className = '',
}: BlogCardCompactProps) {
  const categoryName = getCategoryName(post.category)
  const date = formatDate(post.publishedAt)

  if (variant === 'horizontal') {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className={`group flex gap-5 items-start ${className}`}
      >
        {post.featuredImage?.url && (
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 rounded-xl overflow-hidden bg-cream">
            <Image
              src={post.featuredImage.url}
              alt={post.title}
              fill
              loading="lazy"
              sizes="128px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <span className="eyebrow">{categoryName}</span>
          <h3 className="mt-2 font-heading text-lg leading-snug text-ink group-hover:text-accent-deep transition-colors line-clamp-3">
            {post.title}
          </h3>
          <div className="mt-3 flex items-center gap-3 text-xs text-ink-mute">
            <span className="num">{date}</span>
            <span aria-hidden className="w-1 h-1 rounded-full bg-line" />
            <span className="num">{post.readingTime} min read</span>
          </div>
        </div>
      </Link>
    )
  }

  if (variant === 'minimal') {
    return (
      <Link href={`/blog/${post.slug}`} className={`group block ${className}`}>
        <span className="eyebrow">{categoryName}</span>
        <h3 className="mt-2 font-heading text-lg leading-snug text-ink group-hover:text-accent-deep transition-colors line-clamp-3">
          {post.title}
        </h3>
        <div className="mt-3 flex items-center gap-3 text-xs text-ink-mute">
          <span className="num">{date}</span>
          <span aria-hidden className="w-1 h-1 rounded-full bg-line" />
          <span className="num">{post.readingTime} min read</span>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group flex flex-col ${className}`}
    >
      {post.featuredImage?.url && (
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-cream mb-5">
          <Image
            src={post.featuredImage.url}
            alt={post.title}
            fill
            loading="lazy"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      )}

      <span className="eyebrow">{categoryName}</span>
      <h3 className="mt-3 font-heading text-xl md:text-[1.375rem] leading-[1.25] tracking-tight text-ink group-hover:text-accent-deep transition-colors line-clamp-3 text-balance">
        {post.title}
      </h3>
      <p className="mt-3 text-ink-mute text-[0.95rem] leading-relaxed line-clamp-2">
        {post.description}
      </p>

      <div className="mt-5 flex items-center gap-3 text-xs text-ink-mute">
        <span className="font-medium text-ink-soft">{post.author.name}</span>
        <span aria-hidden className="w-1 h-1 rounded-full bg-line" />
        <span className="num">{date}</span>
        <span aria-hidden className="w-1 h-1 rounded-full bg-line" />
        <span className="num">{post.readingTime} min read</span>
      </div>
    </Link>
  )
}
