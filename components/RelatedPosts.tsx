import Link from 'next/link'
import Image from 'next/image'
import type { BlogPost } from '@/types/blog'
import { getCategoryName } from '@/lib/constants'

interface RelatedPostsProps {
  posts: BlogPost[]
  title?: string
}

/**
 * Related-articles strip placed after the article body.
 * Editorial-light: no shadows, no overlay badges.
 */
export default function RelatedPosts({ posts, title = 'Continue reading' }: RelatedPostsProps) {
  if (!posts || posts.length === 0) return null

  return (
    <section className="not-prose">
      <div className="flex items-end justify-between gap-4 mb-8">
        <h2 className="font-heading text-2xl md:text-[1.625rem] font-bold text-ink tracking-tight">
          {title}
        </h2>
        <Link
          href="/blog"
          className="hidden sm:inline-flex items-center gap-1 text-sm text-ink-mute hover:text-ink transition-colors"
        >
          Browse all articles →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
        {posts.slice(0, 3).map((post) => {
          const categoryName = getCategoryName(post.category)
          return (
            <article key={post.id} className="group">
              <Link href={`/blog/${post.slug}`} className="block">
                {post.featuredImage && (
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-cream mb-5">
                    <Image
                      src={post.featuredImage.url}
                      alt={post.featuredImage.title || post.title}
                      fill
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                )}

                <span className="eyebrow">{categoryName}</span>
                <h3 className="mt-3 font-heading text-lg leading-snug text-ink group-hover:text-accent-deep transition-colors line-clamp-3 text-balance">
                  {post.title}
                </h3>

                <div className="mt-3 flex items-center gap-3 text-xs text-ink-mute">
                  <span className="font-medium text-ink-soft">{post.author.name}</span>
                  <span aria-hidden className="w-1 h-1 rounded-full bg-line" />
                  <span>{post.readingTime} min read</span>
                </div>
              </Link>
            </article>
          )
        })}
      </div>
    </section>
  )
}
