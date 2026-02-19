import Link from 'next/link'
import Image from 'next/image'
import contentfulLoader from '@/lib/contentful-loader'
import AdSense from '@/components/AdSense'
import { ADSENSE_SLOTS } from '@/lib/constants'

type AdSlot = keyof typeof ADSENSE_SLOTS

interface RecommendedPost {
    slug: string
    title: string
    excerpt?: string
    category: string
    categoryName: string
    featuredImage?: {
        url: string
        title?: string
    }
}

interface RecommendedContentProps {
    posts: RecommendedPost[]
    adSlot?: AdSlot
    className?: string
}

/**
 * RecommendedContent component
 * Grid of recommended articles with a native ad card mixed in
 */
export default function RecommendedContent({
    posts,
    adSlot = 'recommended-native',
    className = '',
}: RecommendedContentProps) {
    if (!posts || posts.length === 0) return null

    // Show up to 2 posts + 1 ad card
    const displayPosts = posts.slice(0, 2)

    return (
        <section className={`my-12 ${className}`}>
            <div className="flex items-center gap-3 mb-6">
                <h3 className="text-lg font-bold text-crypto-navy">Recommended for you</h3>
                <div className="flex-1 h-px bg-gray-100" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Article Cards */}
                {displayPosts.map((post) => {
                    const imageUrl = post.featuredImage?.url
                        ? post.featuredImage.url.startsWith('//')
                            ? `https:${post.featuredImage.url}`
                            : post.featuredImage.url
                        : null

                    return (
                        <Link
                            key={post.slug}
                            href={`/blog/${post.slug}`}
                            className="group block rounded-xl overflow-hidden border border-crypto-light hover:border-crypto-primary/30 hover:shadow-md transition-all duration-200"
                        >
                            {/* Thumbnail */}
                            <div className="aspect-video relative bg-gray-100 overflow-hidden">
                                {imageUrl ? (
                                    <Image
                                        loader={contentfulLoader}
                                        src={imageUrl}
                                        alt={post.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        sizes="(max-width: 640px) 100vw, 33vw"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-crypto-primary/10 to-crypto-accent/10 flex items-center justify-center">
                                        <span className="text-3xl">📰</span>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <span className="text-xs font-bold uppercase tracking-wide text-crypto-primary mb-2 block">
                                    {post.categoryName}
                                </span>
                                <h4 className="text-sm font-bold text-crypto-navy leading-snug line-clamp-2 group-hover:text-crypto-primary transition-colors">
                                    {post.title}
                                </h4>
                            </div>
                        </Link>
                    )
                })}

                {/* Native Ad Card */}
                <div className="rounded-xl overflow-hidden border border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center min-h-[180px]">
                    <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Sponsored</p>
                    <AdSense slot={adSlot} />
                </div>
            </div>
        </section>
    )
}
