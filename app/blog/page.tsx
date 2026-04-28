import Link from 'next/link'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'

import {
  getAllPosts,
  getTotalPostsCount,
  searchPosts,
  getAllCategories,
} from '@/lib/posts'
import BlogCardCompact from '@/components/BlogCardCompact'
import FeaturedArticleCard from '@/components/FeaturedArticleCard'
import CategoryCard from '@/components/CategoryCard'
import Breadcrumb from '@/components/Breadcrumb'
import Sidebar from '@/components/Sidebar'
import { BLOG_CONFIG, getCategoryName, SITE_CONFIG } from '@/lib/constants'
import type { BlogCategory } from '@/types/blog'

interface BlogPageProps {
  searchParams: Promise<{
    page?: string
    category?: string
    search?: string
  }>
}

export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
  const { category } = await searchParams
  if (category) {
    const categoryName = getCategoryName(category)
    return {
      title: `${categoryName} — Crypto guides | ${SITE_CONFIG.name}`,
      description: `Plain-language ${categoryName} guides, written for beginners. Browse our editorial library on ${categoryName}.`,
    }
  }
  return {
    title: `The library — Bitcoin, Ethereum & Web3 | ${SITE_CONFIG.name}`,
    description:
      'Browse our editorial library: Bitcoin, Ethereum, DeFi, security and Web3 — all written for crypto beginners.',
  }
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { page: pageParam, category: categoryParam, search: searchParam } = await searchParams
  const page = parseInt(pageParam || '1', 10)
  const category = categoryParam as BlogCategory | undefined
  const searchQuery = searchParam?.trim()

  let posts: any[] = []
  let totalCount = 0
  let categories: any[] = []

  if (searchQuery) {
    [posts, categories] = await Promise.all([
      searchPosts(searchQuery, { limit: BLOG_CONFIG.postsPerPage }),
      getAllCategories(),
    ])
    totalCount = posts.length
  } else {
    [posts, totalCount, categories] = await Promise.all([
      getAllPosts({
        limit: BLOG_CONFIG.postsPerPage,
        skip: (page - 1) * BLOG_CONFIG.postsPerPage,
        category,
      }),
      getTotalPostsCount(category),
      getAllCategories(),
    ])
  }

  const totalPages = Math.ceil(totalCount / BLOG_CONFIG.postsPerPage)
  const isFiltered = Boolean(category || searchQuery)
  const lead = !isFiltered && page === 1 ? posts[0] : null
  const grid = !isFiltered && page === 1 ? posts.slice(1) : posts

  const categoryName = category ? getCategoryName(category) : null

  // Pagination URL builder
  const buildPageUrl = (pageNum: number) => {
    const params = new URLSearchParams()
    params.set('page', pageNum.toString())
    if (category) params.set('category', category)
    if (searchQuery) params.set('search', searchQuery)
    return `/blog?${params.toString()}`
  }

  // Breadcrumbs
  const crumbs = [
    { name: 'Home', url: '/' },
    { name: 'Articles', url: '/blog' },
    ...(category ? [{ name: categoryName!, url: `/blog?category=${category}` }] : []),
    ...(searchQuery ? [{ name: `“${searchQuery}”`, url: '#' }] : []),
  ]

  // Page kicker / title
  const kicker = searchQuery
    ? 'Search results'
    : category
      ? 'Topic'
      : 'The library'
  const title = searchQuery
    ? `Results for “${searchQuery}”`
    : category
      ? categoryName!
      : 'Editorial guides on crypto, written for beginners'
  const subtitle = searchQuery
    ? `${posts.length} ${posts.length === 1 ? 'article' : 'articles'} found.`
    : category
      ? `Every article we've published on ${categoryName?.toLowerCase()} — practical, security-first and beginner-friendly.`
      : 'A growing library of explainers, security guides and market commentary. No jargon. No hype.'

  return (
    <div className="bg-paper">
      {/* ------------------------------------------------------------
       *  PAGE HEADER
       * ------------------------------------------------------------ */}
      <header className="border-b border-line">
        <div className="container-hub pt-10 md:pt-14 pb-12 md:pb-16">
          <Breadcrumb items={crumbs} className="mb-7" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <span className="eyebrow">{kicker}</span>
              <h1 className="mt-3 page-title text-balance max-w-3xl">{title}</h1>
              <p className="mt-5 text-lg text-ink-soft leading-relaxed max-w-2xl">
                {subtitle}
              </p>
            </div>

            <div className="lg:col-span-4">
              <form action="/blog" method="GET" className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-mute" />
                <input
                  type="search"
                  name="search"
                  defaultValue={searchQuery || ''}
                  placeholder="Search the library…"
                  className="w-full pl-11 pr-4 py-3 bg-cream border border-line rounded-full text-sm text-ink placeholder:text-ink-faint outline-none focus:border-ink/30 transition-colors"
                />
              </form>
            </div>
          </div>

          {/* Topic chips */}
          {!searchQuery && (
            <nav aria-label="Topics" className="mt-10 flex flex-wrap gap-2">
              <Link
                href="/blog"
                className={`tag ${!category ? 'bg-ink text-paper border-ink hover:text-paper hover:border-ink' : ''}`}
              >
                All
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/blog?category=${cat.slug}`}
                  className={`tag ${category === cat.slug ? 'bg-ink text-paper border-ink hover:text-paper hover:border-ink' : ''}`}
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* ------------------------------------------------------------
       *  LEAD STORY (only on the unfiltered first page)
       * ------------------------------------------------------------ */}
      {lead && (
        <section className="border-b border-line">
          <div className="container-hub py-12 md:py-16">
            <FeaturedArticleCard post={lead} />
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------
       *  ARTICLE GRID + SIDEBAR
       * ------------------------------------------------------------ */}
      <section className="container-hub py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-12 lg:gap-16">
          <div>
            {posts.length > 0 ? (
              <>
                <div className="flex items-center justify-between gap-4 mb-8">
                  <h2 className="font-heading text-xl font-bold text-ink tracking-tight">
                    {searchQuery ? 'Matching articles' : category ? `Latest ${categoryName}` : 'Latest articles'}
                  </h2>
                  {totalCount > BLOG_CONFIG.postsPerPage && !searchQuery && (
                    <span className="text-sm text-ink-mute">
                      Page {page} of {totalPages}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12">
                  {grid.map((post) => (
                    <BlogCardCompact key={post.id} post={post} />
                  ))}
                </div>

                {totalPages > 1 && !searchQuery && (
                  <nav
                    className="mt-16 pt-8 border-t border-line flex items-center justify-between"
                    aria-label="Pagination"
                  >
                    {page > 1 ? (
                      <Link
                        href={buildPageUrl(page - 1)}
                        className="btn-ghost"
                      >
                        <ChevronLeft className="w-4 h-4" /> Previous
                      </Link>
                    ) : (
                      <span />
                    )}

                    <ol className="hidden sm:flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                        const isCurrent = pageNum === page
                        return (
                          <li key={pageNum}>
                            <Link
                              href={buildPageUrl(pageNum)}
                              aria-current={isCurrent ? 'page' : undefined}
                              className={`w-10 h-10 inline-flex items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                                isCurrent
                                  ? 'bg-ink text-paper'
                                  : 'text-ink-mute hover:bg-cream hover:text-ink'
                              }`}
                            >
                              {pageNum}
                            </Link>
                          </li>
                        )
                      })}
                    </ol>

                    {page < totalPages ? (
                      <Link
                        href={buildPageUrl(page + 1)}
                        className="btn-ghost"
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </Link>
                    ) : (
                      <span />
                    )}
                  </nav>
                )}
              </>
            ) : (
              <div className="border border-line rounded-2xl p-12 text-center bg-cream">
                <h3 className="font-heading text-xl font-bold text-ink mb-2">
                  Nothing matched.
                </h3>
                <p className="text-ink-mute max-w-sm mx-auto mb-6">
                  We couldn't find articles for that search. Try a different keyword or browse our topics.
                </p>
                <Link href="/blog" className="btn-primary">View all articles</Link>
              </div>
            )}
          </div>

          <Sidebar
            categories={categories}
            recentPosts={posts.slice(0, 5)}
          />
        </div>
      </section>

      {/* ------------------------------------------------------------
       *  TOPIC HUBS — only on the unfiltered first page
       * ------------------------------------------------------------ */}
      {!isFiltered && page === 1 && categories.length > 0 && (
        <section className="border-t border-line bg-cream">
          <div className="container-hub py-16 md:py-20">
            <div className="max-w-2xl mb-10">
              <span className="eyebrow">Browse the library</span>
              <h2 className="mt-3 section-title">Choose a topic, go deep.</h2>
              <p className="mt-3 text-ink-soft leading-relaxed">
                Each topic is a curated stream of guides — start with the basics or
                jump into more advanced material when you're ready.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <CategoryCard key={cat.slug} category={cat} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
