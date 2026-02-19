import Link from 'next/link'
import Image from 'next/image'
import contentfulLoader from '@/lib/contentful-loader'
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
    <section className="border-t border-crypto-primary/10 pt-12">
      <h2 className="text-2xl font-bold text-white mb-6">
        Related Articles
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <article
            key={post.id}
            className="group bg-crypto-darker rounded-xl overflow-hidden border border-crypto-primary/10 hover:border-crypto-primary/30 transition"
          >
            <Link href={`/blog/${post.slug}`} className="block">
              {/* Image */}
              {post.featuredImage ? (
                <div className="aspect-video relative overflow-hidden hidden md:block">
                  <Image
                    loader={contentfulLoader}
                    src={post.featuredImage.url}
                    alt={post.featuredImage.title}
                    fill
                    loading="lazy"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-crypto-primary/20 to-crypto-accent/20 flex items-center justify-center">
                  <span className="text-4xl opacity-50">📄</span>
                </div>
              )}

              {/* Content */}
              <div className="p-4">
                <span className="text-xs text-crypto-primary font-medium uppercase tracking-wide">
                  {getCategoryName(post.category)}
                </span>
                <h3 className="text-white font-semibold mt-1 line-clamp-2 group-hover:text-crypto-primary transition">
                  {post.title}
                </h3>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <span>{post.readingTime} min read</span>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
