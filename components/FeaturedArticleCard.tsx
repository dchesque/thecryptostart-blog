import Link from 'next/link'
import Image from 'next/image'
import { BlogPost } from '@/types/blog'
import { getCategoryName } from '@/lib/constants'

interface FeaturedArticleCardProps {
  post: BlogPost
  className?: string
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

/**
 * Editorial lead card. Light, magazine-style: image + content side by side
 * on desktop, stacked on mobile. No dark gradient overlays.
 */
export default function FeaturedArticleCard({
  post,
  className = '',
}: FeaturedArticleCardProps) {
  const categoryName = getCategoryName(post.category)

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-center ${className}`}
    >
      {post.featuredImage?.url && (
        <div className="md:col-span-7 relative aspect-[16/10] md:aspect-[5/3] rounded-2xl overflow-hidden bg-cream">
          <Image
            src={post.featuredImage.url}
            alt={post.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
        </div>
      )}

      <div className={post.featuredImage?.url ? 'md:col-span-5' : 'md:col-span-12'}>
        <div className="flex items-center gap-3 mb-4">
          <span className="eyebrow">{categoryName}</span>
          <span className="text-ink-faint text-xs">·</span>
          <span className="text-xs text-ink-mute font-medium">
            {post.readingTime} min read
          </span>
        </div>

        <h2 className="font-heading font-bold text-ink leading-[1.05] tracking-tight text-balance text-3xl md:text-4xl lg:text-[2.75rem] group-hover:text-accent-deep transition-colors">
          {post.title}
        </h2>

        <p className="mt-5 text-lg text-ink-soft leading-relaxed line-clamp-3 max-w-prose">
          {post.description}
        </p>

        <div className="mt-7 flex items-center gap-3">
          {post.author.image ? (
            <div className="relative w-10 h-10 rounded-full overflow-hidden ring-1 ring-line">
              <Image
                src={post.author.image}
                alt={post.author.name}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-cream border border-line flex items-center justify-center text-ink font-semibold">
              {post.author.name.charAt(0)}
            </div>
          )}
          <div>
            <span className="block text-sm font-semibold text-ink leading-tight">
              {post.author.name}
            </span>
            <span className="block text-xs text-ink-mute">
              {formatDate(post.publishedAt)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
