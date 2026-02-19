import Link from 'next/link'
import { BlogPost } from '@/types/blog'

interface TrendingListProps {
    posts: BlogPost[]
    limit?: number
    className?: string
}

export default function TrendingList({
    posts,
    limit = 5,
    className = '',
}: TrendingListProps) {
    const trendingPosts = posts.slice(0, limit)

    return (
        <div className={`space-y-6 ${className}`}>
            {trendingPosts.map((post, index) => (
                <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group flex gap-4 items-start"
                >
                    <div className="flex-shrink-0 text-3xl font-black text-gray-100 group-hover:text-crypto-primary/20 transition-colors italic leading-none">
                        {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="flex-1 pt-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-crypto-primary/10 text-crypto-primary text-[10px] font-bold uppercase tracking-wider rounded">
                                Trending
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium">
                                {post.category}
                            </span>
                        </div>
                        <h4 className="text-sm font-bold text-crypto-darker group-hover:text-crypto-primary transition-colors leading-tight">
                            {post.title}
                        </h4>
                        <p className="mt-1 text-[11px] text-gray-500 line-clamp-1">
                            Questões de segurança e como se proteger no mercado de cripto de 2026.
                        </p>
                        <div className="mt-2 flex items-center gap-3 text-[10px] text-gray-400">
                            <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                            <span>{post.readingTime} min read</span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    )
}
