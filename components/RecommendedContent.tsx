import Link from 'next/link'
import Image from 'next/image'

import AdSense from '@/components/AdSense'
import { ADSENSE_SLOTS } from '@/lib/constants'

type AdSlot = keyof typeof ADSENSE_SLOTS

interface RecommendedPost {
  slug: string
  title: string
  excerpt?: string
  category: string
  categoryName: string
  featuredImage?: { url: string; title?: string }
}

interface RecommendedContentProps {
  posts: RecommendedPost[]
  adSlot?: AdSlot
  className?: string
}

export default function RecommendedContent({
  posts,
  adSlot = 'recommended-native',
  className = '',
}: RecommendedContentProps) {
  if (!posts || posts.length === 0) return null

  const display = posts.slice(0, 2)

  return (
    <section className={`not-prose ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <span className="eyebrow-mute">You might also like</span>
        <div className="flex-1 h-px bg-line" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {display.map((post) => {
          const url = post.featuredImage?.url
            ? post.featuredImage.url.startsWith('//')
              ? `https:${post.featuredImage.url}`
              : post.featuredImage.url
            : null

          return (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col rounded-xl border border-line bg-paper hover:border-ink/20 transition-colors overflow-hidden"
            >
              <div className="relative aspect-[16/10] bg-cream">
                {url ? (
                  <Image
                    src={url}
                    alt={post.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : null}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <span className="eyebrow">{post.categoryName}</span>
                <h4 className="mt-2 font-heading text-base leading-snug text-ink group-hover:text-accent-deep transition-colors line-clamp-3">
                  {post.title}
                </h4>
              </div>
            </Link>
          )
        })}

        <div className="rounded-xl border border-dashed border-line bg-cream p-5 flex flex-col items-center justify-center text-center min-h-[180px]">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-faint mb-2">
            Sponsored
          </span>
          <AdSense slot={adSlot} />
        </div>
      </div>
    </section>
  )
}
