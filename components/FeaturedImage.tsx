import Image from 'next/image'

interface FeaturedImageProps {
    src: string
    alt: string
    caption?: string
    priority?: boolean
    className?: string
}

/**
 * FeaturedImage component
 * Hero image with 16:9 aspect ratio, optimized with Next.js Image
 */
export default function FeaturedImage({
    src,
    alt,
    caption,
    priority = false,
    className = '',
}: FeaturedImageProps) {
    if (!src) return null

    // Normalize URL (Contentful sometimes returns protocol-relative URLs)
    const normalizedSrc = src.startsWith('//') ? `https:${src}` : src

    return (
        <figure className={`my-8 ${className}`}>
            <div className="aspect-video relative rounded-xl overflow-hidden shadow-lg border border-crypto-light">
                <Image
                    src={normalizedSrc}
                    alt={alt}
                    fill
                    priority={priority}
                    loading={priority ? 'eager' : 'lazy'}
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1000px"
                />
            </div>
            {caption && (
                <figcaption className="text-center text-sm text-crypto-charcoal/50 mt-3 italic">
                    {caption}
                </figcaption>
            )}
        </figure>
    )
}
