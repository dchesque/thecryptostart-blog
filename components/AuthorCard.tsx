import Image from 'next/image'
import Link from 'next/link'

interface AuthorCardProps {
    author: {
        name: string
        image?: string
        bio?: string
        title?: string
        twitter?: string
        linkedin?: string
    }
    category?: string
    className?: string
}

/**
 * AuthorCard component
 * Detailed author card displayed after post content for credibility
 */
export default function AuthorCard({ author, category, className = '' }: AuthorCardProps) {
    return (
        <div
            className={`bg-gray-50 rounded-2xl p-6 sm:p-8 border border-crypto-light flex flex-col sm:flex-row gap-6 ${className}`}
        >
            {/* Avatar */}
            <div className="flex-shrink-0">
                {author.image ? (
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-md">
                        <Image
                            src={author.image}
                            alt={author.name}
                            fill
                            className="object-cover"
                        />
                    </div>
                ) : (
                    <div className="w-20 h-20 rounded-2xl bg-crypto-primary/10 flex items-center justify-center text-crypto-primary font-bold text-3xl border border-crypto-primary/20">
                        {author.name.charAt(0)}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div>
                        <h4 className="text-lg font-bold text-crypto-navy">{author.name}</h4>
                        {author.title && (
                            <p className="text-sm text-crypto-charcoal/60 font-medium">{author.title}</p>
                        )}
                    </div>

                    {/* Social Links */}
                    {(author.twitter || author.linkedin) && (
                        <div className="flex items-center gap-2">
                            {author.twitter && (
                                <a
                                    href={author.twitter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-8 h-8 rounded-lg bg-white border border-crypto-light flex items-center justify-center text-crypto-charcoal/40 hover:text-crypto-primary hover:border-crypto-primary/30 transition-colors"
                                    aria-label="Twitter"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                </a>
                            )}
                            {author.linkedin && (
                                <a
                                    href={author.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-8 h-8 rounded-lg bg-white border border-crypto-light flex items-center justify-center text-crypto-charcoal/40 hover:text-crypto-primary hover:border-crypto-primary/30 transition-colors"
                                    aria-label="LinkedIn"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                </a>
                            )}
                        </div>
                    )}
                </div>

                {/* Bio */}
                {author.bio ? (
                    <p className="text-crypto-charcoal/70 text-sm leading-relaxed mb-4">{author.bio}</p>
                ) : (
                    <p className="text-crypto-charcoal/70 text-sm leading-relaxed mb-4">
                        Expert crypto educator at TheCryptoStart. Dedicated to making blockchain technology accessible and safe for beginners.
                    </p>
                )}

                {/* CTA */}
                {category && (
                    <Link
                        href={`/blog?category=${category}`}
                        className="inline-flex items-center gap-2 text-sm font-bold text-crypto-primary hover:text-crypto-accent transition-colors"
                    >
                        See more articles
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                )}
            </div>
        </div>
    )
}
