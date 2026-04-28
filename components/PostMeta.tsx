import Image from 'next/image'
import Link from 'next/link'
import { getCategoryName } from '@/lib/constants'

interface PostMetaProps {
  author: {
    name: string
    image?: string
    slug?: string
  }
  publishedAt: string
  readingTime: number
  category: string
  categoryName?: string
  categoryColor?: string
  updatedAt?: string
  variant?: 'inline' | 'stacked'
  className?: string
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

/**
 * PostMeta — author + date + reading time, displayed on the article hero.
 * The category lives separately as a prominent eyebrow above the title;
 * we keep this component focused on byline metadata.
 */
export default function PostMeta({
  author,
  publishedAt,
  readingTime,
  updatedAt,
  variant = 'inline',
  className = '',
}: PostMetaProps) {
  const published = formatDate(publishedAt)
  const updated = updatedAt ? formatDate(updatedAt) : null
  const showUpdate = updated && updated !== published

  if (variant === 'stacked') {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        {author.image ? (
          <div className="relative w-11 h-11 rounded-full overflow-hidden ring-1 ring-line shrink-0">
            <Image src={author.image} alt={author.name} fill sizes="44px" className="object-cover" />
          </div>
        ) : (
          <div className="w-11 h-11 rounded-full bg-cream border border-line flex items-center justify-center text-ink font-semibold shrink-0">
            {author.name.charAt(0)}
          </div>
        )}
        <div className="min-w-0">
          <div className="text-sm font-semibold text-ink leading-tight">{author.name}</div>
          <div className="text-xs text-ink-mute mt-0.5">
            <time dateTime={publishedAt} className="num">{published}</time>
            <span aria-hidden className="mx-2">·</span>
            <span className="num">{readingTime} min read</span>
            {showUpdate && (
              <>
                <span aria-hidden className="mx-2">·</span>
                <span className="text-accent-deep num">Updated {updated}</span>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-ink-mute ${className}`}>
      <div className="flex items-center gap-2.5">
        {author.image ? (
          <div className="relative w-7 h-7 rounded-full overflow-hidden ring-1 ring-line shrink-0">
            <Image src={author.image} alt={author.name} fill sizes="28px" className="object-cover" />
          </div>
        ) : (
          <div className="w-7 h-7 rounded-full bg-cream border border-line flex items-center justify-center text-xs text-ink font-semibold shrink-0">
            {author.name.charAt(0)}
          </div>
        )}
        <span className="text-ink-soft font-medium">{author.name}</span>
      </div>
      <span aria-hidden className="text-ink-faint">·</span>
      <time dateTime={publishedAt} className="num">{published}</time>
      <span aria-hidden className="text-ink-faint">·</span>
      <span className="num">{readingTime} min read</span>
      {showUpdate && (
        <>
          <span aria-hidden className="text-ink-faint">·</span>
          <span className="text-accent-deep num">Updated {updated}</span>
        </>
      )}
    </div>
  )
}
