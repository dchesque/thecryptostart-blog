import Link from 'next/link'
import Image from 'next/image'

import type { BlogPost } from '@/types/blog'
import { getCategoryName } from '@/lib/constants'

interface RelatedPostsProps {
  posts: BlogPost[]
}

/**
 * Related posts component
 * Displays a grid of related articles
 */
export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null

  return (
    <section className="pt-12 border-t border-gray-100">
      <h2 className="text-3xl font-bold text-crypto-navy mb-8 flex items-center gap-3">
        <span className="w-2 h-8 bg-crypto-primary rounded-full"></span>
        Related Articles
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.slice(0, 3).map((post) => (
          <article
            key={post.id}
            className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <Link href={`/blog/${post.slug}`} className="flex flex-col h-full">
              {/* Image Container */}
              <div className="aspect-video relative overflow-hidden bg-gray-100">
                {post.featuredImage ? (
                  <Image
                    src={post.featuredImage.url}
                    alt={post.featuredImage.title || post.title}
                    fill
                    loading="lazy"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-crypto-primary/20 to-crypto-accent/20 flex items-center justify-center">
                    <span className="text-4xl opacity-30">📄</span>
                  </div>
                )}
                {/* Category Badge on Image */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-crypto-primary shadow-sm border border-white/20">
                    {getCategoryName(post.category)}
                  </span>
                </div>
              </div>

              {/* Content Container */}
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-crypto-navy mb-3 line-clamp-2 group-hover:text-crypto-primary transition-colors min-h-[3.5rem]">
                  {post.title}
                </h3>
                
                {/* Author & Reading Time Meta */}
                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    {post.author.image && (
                      <div className="relative w-6 h-6 rounded-full overflow-hidden border border-gray-200">
                        <Image 
                          src={post.author.image} 
                          alt={post.author.name} 
                          fill 
                          className="object-cover"
                        />
                      </div>
                    )}
                    <span className="font-semibold text-crypto-charcoal/80">{post.author.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-60">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{post.readingTime} min</span>
                  </div>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}

