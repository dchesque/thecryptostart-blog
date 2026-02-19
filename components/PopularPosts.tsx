import Link from 'next/link'
import Image from 'next/image'
import { getAllPosts } from '@/lib/contentful'

interface PopularPostsProps {
    categorySlug?: string
    limit?: number
    className?: string
}

export default async function PopularPosts({
    categorySlug,
    limit = 3,
    className = '',
}: PopularPostsProps) {
    const posts = await getAllPosts()

    // Filter by category and limit
    const filtered = posts
        .filter(p => !categorySlug || p.category === categorySlug)
        .slice(0, limit)

    return (
        <div className={`space-y-4 ${className}`}>
            {filtered.map(post => (
                <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group flex gap-3 items-start"
                >
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        {post.featuredImage?.url && (
                            <Image
                                src={post.featuredImage.url}
                                alt={post.title}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-bold text-crypto-darker group-hover:text-crypto-primary transition-colors line-clamp-2 leading-snug">
                            {post.title}
                        </h5>
                        <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-500">
                            <span className="flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-crypto-primary" />
                                {post.readingTime} min read
                            </span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    )
}
