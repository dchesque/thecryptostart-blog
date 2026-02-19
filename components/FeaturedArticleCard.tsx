import Link from 'next/link'
import Image from 'next/image'
import { BlogPost } from '@/types/blog'

interface FeaturedArticleCardProps {
    post: BlogPost
    className?: string
}

export default function FeaturedArticleCard({
    post,
    className = '',
}: FeaturedArticleCardProps) {
    return (
        <Link
            href={`/blog/${post.slug}`}
            className={`group relative block overflow-hidden rounded-[2.5rem] bg-crypto-darker min-h-[500px] ${className}`}
        >
            {post.featuredImage?.url && (
                <Image
                    src={post.featuredImage.url}
                    alt={post.title}
                    fill
                    className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                    priority
                />
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-crypto-darker via-crypto-darker/40 to-transparent" />

            <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
                <div className="flex items-center gap-3 mb-6">
                    <span className="px-4 py-1.5 bg-crypto-primary rounded-full text-white text-xs font-bold uppercase tracking-widest">
                        {post.category}
                    </span>
                    <span className="text-white/80 text-xs font-bold uppercase tracking-widest">
                        {post.readingTime} min read
                    </span>
                </div>

                <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight max-w-3xl group-hover:text-crypto-primary transition-colors">
                    {post.title}
                </h2>

                <p className="text-white/90 text-lg md:text-xl line-clamp-2 max-w-2xl mb-8 leading-relaxed">
                    {post.description}
                </p>

                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border border-white/20 overflow-hidden">
                        {post.author.image ? (
                            <Image src={post.author.image} alt={post.author.name} width={48} height={48} className="object-cover" />
                        ) : (
                            <div className="w-full h-full bg-crypto-primary flex items-center justify-center text-white font-bold">
                                {post.author.name.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div>
                        <span className="block text-white font-bold">{post.author.name}</span>
                        <span className="block text-white/40 text-xs font-medium uppercase tracking-wider">{new Date(post.publishedAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        </Link>
    )
}
