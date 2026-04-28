import Image from 'next/image'
import Link from 'next/link'
import { Twitter, Linkedin, ArrowRight } from 'lucide-react'

interface AuthorCardProps {
  author: {
    name: string
    image?: string
    bio?: string
    title?: string
    twitter?: string
    linkedin?: string
  }
  category?: string
  className?: string
}

/**
 * AuthorCard — quiet, editorial sign-off block placed after the article body.
 * Uses our editorial palette (cream surface) and soft borders.
 */
export default function AuthorCard({ author, category, className = '' }: AuthorCardProps) {
  return (
    <aside
      className={`bg-cream border border-line rounded-2xl p-7 sm:p-9 flex flex-col sm:flex-row gap-6 items-start ${className}`}
    >
      {/* Avatar */}
      <div className="shrink-0">
        {author.image ? (
          <div className="relative w-20 h-20 rounded-full overflow-hidden ring-1 ring-line bg-paper">
            <Image src={author.image} alt={author.name} fill sizes="80px" className="object-cover" />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-paper border border-line flex items-center justify-center text-3xl font-heading font-bold text-ink">
            {author.name.charAt(0)}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="eyebrow-mute mb-1">Written by</div>
            <h4 className="font-heading text-xl font-bold text-ink">{author.name}</h4>
            {author.title && (
              <p className="text-sm text-ink-mute mt-0.5">{author.title}</p>
            )}
          </div>

          {(author.twitter || author.linkedin) && (
            <div className="flex items-center gap-2">
              {author.twitter && (
                <a
                  href={author.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${author.name} on Twitter`}
                  className="w-9 h-9 rounded-full border border-line bg-paper flex items-center justify-center text-ink-mute hover:text-ink hover:border-ink/30 transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {author.linkedin && (
                <a
                  href={author.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${author.name} on LinkedIn`}
                  className="w-9 h-9 rounded-full border border-line bg-paper flex items-center justify-center text-ink-mute hover:text-ink hover:border-ink/30 transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
            </div>
          )}
        </div>

        <p className="mt-4 text-ink-soft text-[0.95rem] leading-relaxed">
          {author.bio
            || `Writes on crypto, security and on-chain economics. Focused on making complex ideas approachable for beginners.`}
        </p>

        {category && (
          <Link
            href={`/blog?category=${category}`}
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-accent-deep transition-colors"
          >
            More from {author.name.split(' ')[0]} on {category.toLowerCase()}
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </aside>
  )
}
