import Link from 'next/link'
import Image from 'next/image'
import { getAllPosts } from '@/lib/posts'
import { getCategoryName } from '@/lib/constants'

interface PopularPostsProps {
  categorySlug?: string
  limit?: number
  className?: string
  title?: string
}

export default async function PopularPosts({
  categorySlug,
  limit = 4,
  className = '',
  title = 'Popular this week',
}: PopularPostsProps) {
  try {
    const posts = await getAllPosts()
    const filtered = posts
      .filter(p => !categorySlug || p.category === categorySlug)
      .slice(0, limit)

    if (filtered.length === 0) return null

    return (
      <section className={className}>
        <div className="flex items-center gap-3 mb-5">
          <span className="eyebrow-mute">{title}</span>
          <div className="flex-1 h-px bg-line" />
        </div>
        <ol className="space-y-4">
          {filtered.map((post, index) => (
            <li key={post.id}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex gap-4 items-start"
              >
                <span
                  className="font-heading font-bold text-lg text-ink-faint tabular-nums leading-none pt-1 shrink-0 group-hover:text-accent transition-colors"
                  aria-hidden
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                {post.featuredImage?.url && (
                  <div className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-cream">
                    <Image
                      src={post.featuredImage.url}
                      alt={post.title}
                      fill
                      sizes="56px"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <h5 className="font-heading text-sm font-semibold leading-snug text-ink group-hover:text-accent-deep transition-colors line-clamp-2">
                    {post.title}
                  </h5>
                  <div className="mt-1.5 text-xs text-ink-mute">
                    {getCategoryName(post.category)} · {post.readingTime} min
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    )
  } catch (error) {
    console.error('Error fetching popular posts:', error)
    return null
  }
}
