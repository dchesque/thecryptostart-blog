import Image from 'next/image'

interface FeaturedImageProps {
  src: string
  alt: string
  caption?: string
  priority?: boolean
  className?: string
  aspect?: '16/9' | '4/3' | '3/2' | '21/9'
}

export default function FeaturedImage({
  src,
  alt,
  caption,
  priority = false,
  className = '',
  aspect = '16/9',
}: FeaturedImageProps) {
  if (!src) return null

  const normalizedSrc = src.startsWith('//') ? `https:${src}` : src

  const aspectClass = {
    '16/9': 'aspect-[16/9]',
    '4/3': 'aspect-[4/3]',
    '3/2': 'aspect-[3/2]',
    '21/9': 'aspect-[21/9]',
  }[aspect]

  return (
    <figure className={`my-8 ${className}`}>
      <div className={`${aspectClass} relative rounded-2xl overflow-hidden bg-cream`}>
        <Image
          src={normalizedSrc}
          alt={alt}
          fill
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1024px"
        />
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-sm text-ink-mute italic">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
