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
    className = '',
}: PostMetaProps) {
    const publishedDate = new Date(publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })

    return (
        <div className={`flex flex-wrap items-center gap-4 text-sm ${className}`}>
            {/* Category Badge */}
            <Link
                href={`/blog?category=${category}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border transition-opacity hover:opacity-80"
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
            <div className="flex items-center gap-2">
                {author.image ? (
                    <div className="relative w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                            src={author.image}
                            alt={author.name}
                            fill
                            className="object-cover"
                        />
                    </div>
                ) : (
                    <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: categoryColor }}
                    >
                        {author.name.charAt(0)}
                    </div>
                )}
                <span className="font-semibold text-crypto-navy">{author.name}</span>
            </div>

            {/* Date */}
            <div className="flex items-center gap-1.5 text-crypto-charcoal/50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <time dateTime={publishedAt}>{publishedDate}</time>
                {updatedAt && updatedAt !== publishedAt && (
                    <span className="text-xs">(updated)</span>
                )}
            </div>

            {/* Reading Time */}
            <div className="flex items-center gap-1.5 text-crypto-charcoal/50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{readingTime} min read</span>
            </div>
        </div>
    )
}
