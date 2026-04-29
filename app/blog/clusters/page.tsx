import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

import { getAllPosts, getAllCategories } from '@/lib/posts'
import Breadcrumb from '@/components/Breadcrumb'
import { SITE_CONFIG, getCategoryName } from '@/lib/constants'
import type { BlogCategory } from '@/types/blog'

export const revalidate = 600

export const metadata: Metadata = {
  title: `Topic clusters — full library map | ${SITE_CONFIG.name}`,
  description:
    'A complete map of every topic and article on TheCryptoStart — built so you can find the next thing to read in seconds.',
}

export default async function ContentClustersPage() {
  const [posts, categories] = await Promise.all([
    getAllPosts({ limit: 200 }),
    getAllCategories(),
  ])

  // Group posts by category, ordered by category list
  const clusters = categories
    .map((cat) => ({
      category: cat,
      posts: posts.filter((p) => p.category === cat.slug),
    }))
    .filter((c) => c.posts.length > 0)

  // Catch-all bucket for posts whose category isn't in the categories table
  const known = new Set(categories.map((c) => c.slug))
  const orphans = posts.filter((p) => !known.has(p.category))
  const orphanGroup = orphans.length
    ? {
        category: { slug: 'other', name: 'Other', icon: '✦' } as any,
        posts: orphans,
      }
    : null

  const allClusters = orphanGroup ? [...clusters, orphanGroup] : clusters

  return (
    <div className="bg-paper">
      <header className="border-b border-line">
        <div className="container-hub pt-8 sm:pt-10 md:pt-14 pb-10 sm:pb-12 md:pb-16">
          <Breadcrumb
            items={[
              { name: 'Home', url: '/' },
              { name: 'Articles', url: '/blog' },
              { name: 'Topic clusters', url: '/blog/clusters' },
            ]}
            className="mb-6 sm:mb-7"
          />
          <span className="eyebrow">The full map</span>
          <h1 className="mt-3 page-title text-balance max-w-3xl">
            Every article, organised by topic.
          </h1>
          <p className="mt-5 sm:mt-6 text-base sm:text-lg text-ink-soft leading-relaxed max-w-2xl">
            A complete index of the library — pick a topic, see what's there, and
            jump straight to the article that answers your question.
          </p>
        </div>
      </header>

      <section className="container-hub py-12 sm:py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
          {allClusters.map(({ category, posts: clusterPosts }) => (
            <article
              key={category.slug}
              className="rounded-2xl border border-line bg-paper p-5 sm:p-7 flex flex-col"
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <div className="flex items-center gap-2 text-2xl">
                    <span aria-hidden>{category.icon || '✦'}</span>
                    <h2 className="font-heading font-bold text-lg text-ink tracking-tight">
                      {category.name || getCategoryName(category.slug)}
                    </h2>
                  </div>
                </div>
                <span className="tag">
                  {clusterPosts.length} {clusterPosts.length === 1 ? 'article' : 'articles'}
                </span>
              </div>

              <ol className="space-y-3 flex-1">
                {clusterPosts.slice(0, 6).map((post) => (
                  <li key={post.slug}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="group flex items-start gap-2.5 text-sm text-ink-soft hover:text-ink transition-colors"
                    >
                      <span
                        className="mt-2 w-1 h-1 rounded-full bg-line group-hover:bg-accent transition-colors shrink-0"
                        aria-hidden
                      />
                      <span className="leading-snug line-clamp-2">{post.title}</span>
                    </Link>
                  </li>
                ))}
                {clusterPosts.length > 6 && (
                  <li className="pt-2 border-t border-line text-xs text-ink-mute italic">
                    + {clusterPosts.length - 6} more
                  </li>
                )}
              </ol>

              {category.slug !== 'other' && (
                <Link
                  href={`/blog?category=${category.slug}`}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-accent-deep transition-colors"
                >
                  Browse the {category.name || getCategoryName(category.slug)} hub
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
