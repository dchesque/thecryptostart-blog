import Link from 'next/link'
import Image from 'next/image'
import type { BlogPost } from '@/types/blog'
import { getCategoryName } from '@/lib/constants'

interface BlogCardProps {
  post: BlogPost
  variant?: 'large' | 'standard'
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

/**
 * Standard / large blog post card.
 * Light, editorial — no dark backdrops or busy badges.
 */
export default function BlogCard({ post, variant = 'standard' }: BlogCardProps) {
  const isLarge = variant === 'large'
  const categoryName = getCategoryName(post.category)
  const date = formatDate(post.publishedAt)

  const rawImage = post.featuredImage?.url
  const imageUrl = rawImage
    ? (rawImage.startsWith('//') ? `https:${rawImage}` : rawImage)
    : null

  return (
    <article className={`group ${isLarge ? 'md:col-span-2' : ''}`}>
      <Link href={`/blog/${post.slug}`} className="block">
        {imageUrl && (
          <div className={`relative ${isLarge ? 'aspect-[16/9]' : 'aspect-[16/10]'} rounded-2xl overflow-hidden bg-cream mb-5`}>
            <Image
              src={imageUrl}
              alt={post.title}
              fill
              loading="lazy"
              sizes={isLarge ? '(max-width: 1024px) 100vw, 800px' : '(max-width: 1024px) 100vw, 400px'}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
        )}

        <span className="eyebrow">{categoryName}</span>
        <h3
          className={`mt-3 font-heading font-bold text-ink tracking-tight text-balance group-hover:text-accent-deep transition-colors ${
            isLarge
              ? 'text-2xl md:text-3xl leading-[1.1]'
              : 'text-xl leading-[1.2]'
          }`}
        >
          {post.title}
        </h3>

        <p className={`mt-3 text-ink-mute leading-relaxed line-clamp-2 ${isLarge ? 'text-base md:text-lg' : 'text-sm'}`}>
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
    </article>
  )
}
