import Link from 'next/link'
import Image from 'next/image'
import type { BlogPost } from '@/types/blog'
import { getCategoryName } from '@/lib/constants'

interface BlogCardProps {
  post: BlogPost
  variant?: 'large' | 'standard'
}

/**
 * Blog post card component
 * Displays a preview card for blog listings
 */
export default function BlogCard({ post, variant = 'standard' }: BlogCardProps) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  // Define category style mapping
  const categoryStyles: Record<string, string> = {
    'bitcoin': 'badge-bitcoin',
    'ethereum': 'badge-ethereum',
    'defi': 'badge-invest',
    'investing-and-strategy': 'badge-invest',
    'crypto-security': 'badge-press',
    'web3-and-innovation': 'bg-crypto-navy',
    'crypto-opportunities': 'bg-green-600',
    'crypto-basics': 'badge-bitcoin',
  }

  const badgeClass = categoryStyles[post.category] || 'bg-crypto-navy'
  const isLarge = variant === 'large'

  return (
    <article
      className={`
        card-article group
        ${isLarge ? 'md:col-span-2 lg:col-span-2 shadow-4 border-crypto-primary/20 min-h-[450px]' : 'shadow-3 min-h-[400px]'}
      `}
      style={{
        backgroundImage: post.featuredImage ? `url(${post.featuredImage.url})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <Link href={`/blog/${post.slug}`} className="flex flex-col h-full justify-end">
        {/* Category & Date */}
        <div className="flex justify-between items-start mb-auto">
          <span className={`badge ${badgeClass} shadow-lg`}>
            {getCategoryName(post.category)}
          </span>
          <div className="text-[10px] font-bold uppercase tracking-widest text-white/60 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full">
            {formattedDate}
          </div>
        </div>

        {/* Content */}
        <div className="mt-8 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
          {isLarge ? (
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight group-hover:text-crypto-primary transition-colors">
              {post.title}
            </h2>
          ) : (
            <h3 className="text-2xl font-extrabold text-white mb-3 leading-tight group-hover:text-crypto-primary transition-colors">
              {post.title}
            </h3>
          )}

          <p className={`text-white/70 line-clamp-2 mb-8 font-medium group-hover:text-white transition-colors duration-300 ${isLarge ? 'text-lg' : 'text-sm'}`}>
            {post.description}
          </p>

          {/* Author Info */}
          <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider overflow-hidden">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
              {post.author.image ? (
                <Image
                  src={post.author.image}
                  alt={post.author.name}
                  width={20}
                  height={20}
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-crypto-primary flex items-center justify-center text-[8px]">
                  {post.author.name.charAt(0)}
                </div>
              )}
              <span className="text-white">{post.author.name}</span>
            </div>
            <span className="text-white/40">•</span>
            <span className="text-white/60 tracking-widest">{post.readingTime} MIN READ</span>
          </div>
        </div>
      </Link>
    </article>
  )
}
