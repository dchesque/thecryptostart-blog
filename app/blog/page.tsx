import Link from 'next/link'
import { getAllPosts, getTotalPostsCount, searchPosts } from '@/lib/contentful'
import BlogCard from '@/components/BlogCard'
import { BLOG_CONFIG, CACHE_CONFIG, getCategoryName } from '@/lib/constants'
import type { BlogCategory } from '@/types/blog'
import type { Metadata } from 'next'
import { SITE_CONFIG } from '@/lib/constants'

// ISR: Revalidate every hour
export const revalidate = 3600

export const metadata: Metadata = {
  title: `Blog | ${SITE_CONFIG.name}`,
  description: 'Explore our latest articles about cryptocurrency, blockchain, DeFi, NFTs, and Web3.',
}

interface BlogPageProps {
  searchParams: {
    page?: string
    category?: string
    search?: string
  }
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { page: pageParam, category: categoryParam, search: searchParam } = await searchParams
  const page = parseInt(pageParam || '1', 10)
  const category = categoryParam as BlogCategory | undefined
  const searchQuery = searchParam?.trim()

  // Fetch posts based on search or regular listing
  let posts
  let totalCount

  if (searchQuery) {
    posts = await searchPosts(searchQuery, { limit: BLOG_CONFIG.postsPerPage })
    totalCount = posts.length
  } else {
    [posts, totalCount] = await Promise.all([
      getAllPosts({
        limit: BLOG_CONFIG.postsPerPage,
        skip: (page - 1) * BLOG_CONFIG.postsPerPage,
        category,
      }),
      getTotalPostsCount(category),
    ])
  }

  const totalPages = Math.ceil(totalCount / BLOG_CONFIG.postsPerPage)

  // Build pagination URL
  const buildPageUrl = (pageNum: number) => {
    const params = new URLSearchParams()
    params.set('page', pageNum.toString())
    if (category) params.set('category', category)
    if (searchQuery) params.set('search', searchQuery)
    return `/blog?${params.toString()}`
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container">
        {/* Featured Section */}
        {!searchQuery && !category && page === 1 && posts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-crypto-navy">Featured</h2>
            <div className="featured-grid">
              <BlogCard post={posts[0]} variant="large" />
              <div className="grid grid-cols-1 gap-6">
                {posts.slice(1, 3).map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Categories Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-crypto-navy">Categories</h2>
          <div className="grid-categories">
            {BLOG_CONFIG.categories.map((cat) => {
              const bgColors: Record<string, string> = {
                bitcoin: '#FF7400',
                ethereum: '#0071C3',
                defi: '#7B3FF2',
                'investing-and-strategy': '#FF1493',
                'crypto-security': '#FF6B6B',
                'web3-and-innovation': '#1A2A2F',
              }
              return (
                <Link
                  key={cat.slug}
                  href={`/blog?category=${cat.slug}`}
                  className="p-6 rounded-xl text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg text-white"
                  style={{ background: bgColors[cat.slug] || '#333' }}
                >
                  <div className="text-3xl mb-2">{cat.icon}</div>
                  <div className="font-bold">{cat.name}</div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Main Feed Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-crypto-navy mb-2">
              {searchQuery
                ? `Search: "${searchQuery}"`
                : category
                  ? `Articles about ${getCategoryName(category)}`
                  : 'Latest Articles'
              }
            </h1>
            <p className="text-crypto-charcoal/60">
              {totalCount} {totalCount === 1 ? 'article found' : 'articles found'}
            </p>
          </div>

          {/* Search Form */}
          <form action="/blog" method="GET" className="w-full md:max-w-md">
            <div className="input-search">
              <input
                type="text"
                name="search"
                placeholder="Search articles..."
                defaultValue={searchQuery}
                className="flex-1 bg-transparent border-none outline-none text-sm"
              />
              <button type="submit" className="uppercase text-xs font-bold">Search</button>
            </div>
          </form>
        </div>

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="grid-posts mb-12">
            {(searchQuery || category || page > 1 ? posts : posts.slice(3)).map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-crypto-light rounded-3xl animate-fade-in">
            <div className="text-7xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-crypto-navy mb-3">No articles found</h3>
            <p className="text-crypto-charcoal/60 mb-8 max-w-md mx-auto">
              {searchQuery
                ? `We couldn't find results for "${searchQuery}". Try other terms.`
                : 'There are no articles available in this category yet.'
              }
            </p>
            <Link
              href="/blog"
              className="btn-primary"
            >
              View all articles
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !searchQuery && (
          <nav
            className="flex items-center justify-center gap-3 py-8"
            aria-label="Pagination"
          >
            {/* Previous */}
            {page > 1 ? (
              <Link
                href={buildPageUrl(page - 1)}
                className="w-12 h-12 rounded-xl bg-white shadow-2 flex items-center justify-center hover:bg-crypto-primary hover:text-white transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
            ) : (
              <span className="w-12 h-12 rounded-xl bg-crypto-light text-crypto-charcoal/20 flex items-center justify-center cursor-not-allowed">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </span>
            )}

            {/* Page numbers */}
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                const isCurrent = pageNum === page
                const showPage = pageNum === 1 || pageNum === totalPages || Math.abs(pageNum - page) <= 1

                if (!showPage) {
                  if (pageNum === 2 || pageNum === totalPages - 1) {
                    return <span key={pageNum} className="px-2 text-crypto-charcoal/30">...</span>
                  }
                  return null
                }

                return (
                  <Link
                    key={pageNum}
                    href={buildPageUrl(pageNum)}
                    className={`w-12 h-12 rounded-xl font-bold flex items-center justify-center transition-all ${isCurrent
                      ? 'bg-crypto-primary text-white shadow-lg'
                      : 'bg-white text-crypto-navy hover:bg-crypto-light shadow-1'
                      }`}
                  >
                    {pageNum}
                  </Link>
                )
              })}
            </div>

            {/* Next */}
            {page < totalPages ? (
              <Link
                href={buildPageUrl(page + 1)}
                className="w-12 h-12 rounded-xl bg-white shadow-2 flex items-center justify-center hover:bg-crypto-primary hover:text-white transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <span className="w-12 h-12 rounded-xl bg-crypto-light text-crypto-charcoal/20 flex items-center justify-center cursor-not-allowed">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            )}
          </nav>
        )}
      </div>
    </div>
  )
}
