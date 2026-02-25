import Link from 'next/link'
import Image from 'next/image'

import { BlogPost } from '@/types/blog'

interface BlogCardCompactProps {
    post: BlogPost
    className?: string
}

export default function BlogCardCompact({
    post,
    className = '',
}: BlogCardCompactProps) {
    return (
        <Link
            href={`/blog/${post.slug}`}
            className={`group flex flex-col bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:border-crypto-primary/20 transition-all duration-300 ${className}`}
        >
            <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                {post.featuredImage?.url && (
                    <Image

                        src={post.featuredImage.url}
                        alt={post.title}
                        fill
                        loading="lazy"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                )}
                <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-crypto-darker text-[10px] font-bold uppercase tracking-widest shadow-sm">
                        {post.category}
                    </span>
                </div>
            </div>

            <div className="p-6 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-crypto-darker group-hover:text-crypto-primary transition-colors leading-tight mb-3 line-clamp-2">
                    {post.title}
                </h3>

                <p className="text-gray-600 text-sm line-clamp-2 mb-6 leading-relaxed flex-1">
                    {post.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
                            {post.author.image ? (
                                <Image

                                    src={post.author.image}
                                    alt={post.author.name}
                                    width={24}
                                    height={24}
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-crypto-primary text-white text-[10px] flex items-center justify-center font-bold">
                                    {post.author.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tighter">{post.author.name}</span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-500">{post.readingTime} min read</span>
                </div>
            </div>
        </Link>
    )
}
