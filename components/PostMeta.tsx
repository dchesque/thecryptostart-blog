import Image from 'next/image'
import Link from 'next/link'

interface PostMetaProps {
    author: {
        name: string
        image?: string
    }
    publishedAt: string
    readingTime: number
    category: string
    categoryName: string
    categoryColor?: string
    updatedAt?: string
    className?: string
}

/**
 * PostMeta component
 * Displays author, date, reading time and category badge
 */
export default function PostMeta({
    author,
    publishedAt,
    readingTime,
    category,
    categoryName,
    categoryColor = '#FF7400',
    updatedAt,
    isTrending = false,
    className = '',
}: PostMetaProps & { isTrending?: boolean }) {
    const publishedDate = new Date(publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })

    const updatedDate = updatedAt ? new Date(updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }) : null

    return (
        <div className={`flex flex-wrap items-center gap-4 text-sm ${className}`}>
            {/* Trending Badge */}
            {isTrending && (
                <div className="flex items-center gap-1.5 bg-crypto-primary/10 text-crypto-primary px-3 py-1 rounded-full border border-crypto-primary/20 animate-pulse">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.5 11c1.9 0 3.5 1.6 3.5 3.5s-1.6 3.5-3.5 3.5-3.5-1.6-3.5-3.5 1.6-3.5 3.5-3.5zM12 2c3.3 0 6 2.7 6 6v2.3c3.4 1.1 6 4.3 6 8s-2.7 7.7-6 7.7-6-3.4-6-7.7c0-2 .8-3.9 2.2-5.3L12 11l-2.2 2.1C11.2 14.5 12 16.4 12 18.3c0 4.1-3.1 7.4-7 7.4s-7-3.3-7-7.4c0-3.7 2.6-6.9 6-8V8c0-3.3 2.7-6 6-6zm0 2c-2.2 0-4 1.8-4 4v3.1c-2.8.9-5 3.5-5 6.6 0 3.3 2.2 6.1 5 6.1s5-2.8 5-6.1c0-1.7-.6-3.2-1.6-4.4L12 13.5l1.6-1.5C12.6 13.1 12 14.5 12 16.1c0 3.2 2.2 6 5 6s5-2.8 5-6c0-3.1-2.2-5.7-5-6.7V8c0-2.2-1.8-4-4-4z" />
                    </svg>
                    <span className="text-[10px] font-black uppercase tracking-widest">Trending</span>
                </div>
            )}

            {/* Category Badge */}
            <Link
                href={`/blog?category=${category}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border transition-opacity hover:opacity-80 shadow-sm"
                style={{
                    backgroundColor: `${categoryColor}20`,
                    color: categoryColor,
                    borderColor: `${categoryColor}40`,
                }}
            >
                {categoryName}
            </Link>

            {/* Divider */}
            <span className="text-crypto-charcoal/20 hidden sm:block">|</span>

            {/* Author */}
            <div className="flex items-center gap-2 group cursor-pointer">
                {author.image ? (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border-2 border-white shadow-sm group-hover:border-crypto-primary transition-colors">
                        <Image
                            src={author.image}
                            alt={author.name}
                            fill
                            className="object-cover"
                        />
                    </div>
                ) : (
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 border-2 border-white shadow-sm group-hover:border-crypto-primary transition-colors"
                        style={{ backgroundColor: categoryColor }}
                    >
                        {author.name.charAt(0)}
                    </div>
                )}
                <span className="font-bold text-crypto-navy group-hover:text-crypto-primary transition-colors">{author.name}</span>
            </div>

            {/* Date */}
            <div className="flex items-center gap-2 text-crypto-charcoal/60 bg-crypto-light/50 px-3 py-1 rounded-lg">
                <svg className="w-4 h-4 text-crypto-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="flex flex-col sm:flex-row sm:gap-2">
                    <time dateTime={publishedAt} className="font-medium">{publishedDate}</time>
                    {updatedDate && updatedDate !== publishedDate && (
                        <span className="text-[10px] text-crypto-primary font-bold flex items-center gap-1">
                            <span className="hidden sm:inline">•</span>
                            <span>Updated: {updatedDate}</span>
                        </span>
                    )}
                </div>
            </div>

            {/* Reading Time */}
            <div className="flex items-center gap-2 text-crypto-charcoal/60 bg-crypto-light/50 px-3 py-1 rounded-lg">
                <svg className="w-4 h-4 text-crypto-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-bold tracking-tight">{readingTime} min read</span>
            </div>
        </div>
    )
}
