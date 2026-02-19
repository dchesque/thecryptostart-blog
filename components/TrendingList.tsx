'use client'

import Link from 'next/link'
import { BlogPost } from '@/types/blog'
import { Flame } from 'lucide-react'

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
    if (!posts || posts.length === 0) return null

    const trendingPosts = posts.slice(0, limit)

    return (
        <div className={`space-y-5 ${className}`}>
            {trendingPosts.map((post, index) => (
                <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group flex gap-4 items-center p-3 rounded-2xl bg-white border border-gray-50 hover:border-crypto-primary/20 hover:shadow-xl hover:shadow-crypto-primary/5 transition-all duration-300"
                >
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-xl font-black text-gray-300 group-hover:bg-crypto-primary/10 group-hover:text-crypto-primary transition-colors italic">
                        {index + 1}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-500/10 text-orange-600 text-[9px] font-bold uppercase tracking-wider rounded-full">
                                <Flame className="w-2.5 h-2.5" />
                                Trending
                            </span>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">
                                {post.category}
                            </span>
                        </div>
                        <h4 className="text-sm font-bold text-crypto-darker group-hover:text-crypto-primary transition-colors leading-tight line-clamp-2">
                            {post.title}
                        </h4>
                        <div className="mt-2 flex items-center gap-3 text-[10px] text-gray-500 font-bold">
                            <span className="flex items-center gap-1">
                                {post.readingTime} min read
                            </span>
                            <span className="w-0.5 h-0.5 rounded-full bg-gray-400" />
                            <span>{new Date((post as any).publishedAt || (post as any).createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}</span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    )
}
