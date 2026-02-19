import Link from 'next/link'
import { getAllPosts, getTotalPostsCount, searchPosts, getAllCategories } from '@/lib/contentful'
import BlogCardCompact from '@/components/BlogCardCompact'
import CategoryCard from '@/components/CategoryCard'
import PopularPosts from '@/components/PopularPosts'
import CategoryLinks from '@/components/CategoryLinks'
import AdSense from '@/components/AdSense'
import { BLOG_CONFIG, getCategoryName } from '@/lib/constants'
import type { BlogCategory } from '@/types/blog'
import type { Metadata } from 'next'
import { SITE_CONFIG } from '@/lib/constants'

// ISR: Revalidate every 5 minutes
export const revalidate = 300

export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
  const { category } = await searchParams
  if (category) {
    const categoryName = getCategoryName(category)
    return {
      title: `${categoryName} Articles — Crypto Guides | ${SITE_CONFIG.name}`,
      description: `Explore our best ${categoryName} articles. Learn everything about ${categoryName} with practical, beginner-friendly guides focused on real security and education.`,
    }
  }
  return {
    title: `Crypto Blog — Bitcoin, Ethereum & DeFi Articles | ${SITE_CONFIG.name}`,
    description: 'Explore our latest articles about cryptocurrency, blockchain, DeFi, NFTs, and Web3. Practical guides for beginners and advanced investors.',
  }
}

interface BlogPageProps {
  searchParams: Promise<{
    page?: string
    category?: string
    search?: string
  }>
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { page: pageParam, category: categoryParam, search: searchParam } = await searchParams
  const page = parseInt(pageParam || '1', 10)
  const category = categoryParam as BlogCategory | undefined
  const searchQuery = searchParam?.trim()

  // Fetch posts based on search or regular listing
  let posts
  let totalCount
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

  // Build pagination URL
  const buildPageUrl = (pageNum: number) => {
    const params = new URLSearchParams()
    params.set('page', pageNum.toString())
    if (category) params.set('category', category)
    if (searchQuery) params.set('search', searchQuery)
    return `/blog?${params.toString()}`
  }

  return (
    <div className="min-h-screen bg-gray-50/30 py-24">
      <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8">

        {/* Header Section */}
        <div className="mb-12">
          <nav className="mb-6 text-sm text-gray-400 font-medium" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-crypto-primary transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-crypto-darker">Blog</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-6xl font-black text-crypto-darker tracking-tight mb-4">
                {searchQuery
                  ? `Resultados para: "${searchQuery}"`
                  : category
                    ? getCategoryName(category)
                    : 'Library & Insights'
                }
              </h1>
              <p className="text-lg text-gray-500 max-w-2xl font-medium">
                {category
                  ? `Explorando os melhores guias e tutoriais sobre ${getCategoryName(category)}.`
                  : 'Sua enciclopédia definitiva sobre o mercado de criptoativos, segurança e inovação.'
                }
              </p>
            </div>

            {/* Sticky/Modern Search Form */}
            <form action="/blog" method="GET" className="w-full md:max-w-xs relative group">
              <input
                type="text"
                name="search"
                placeholder="Search resources..."
                defaultValue={searchQuery}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-crypto-primary/20 outline-none transition-all font-medium text-sm"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-crypto-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </form>
          </div>
        </div>

        {/* 2-Column Grid Layout */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_300px]">

          {/* Main Content (List) */}
          <div>
            {/* Top Ad */}
            <div className="mb-10 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 min-h-[120px] flex items-center justify-center">
              <AdSense slot="blog-top" />
            </div>

            {posts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  {posts.map((post) => (
                    <BlogCardCompact key={post.id} post={post} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && !searchQuery && (
                  <nav className="flex items-center justify-center gap-2 py-8 border-t border-gray-100" aria-label="Pagination">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                      const isCurrent = pageNum === page
                      return (
                        <Link
                          key={pageNum}
                          href={buildPageUrl(pageNum)}
                          className={`w-12 h-12 rounded-xl font-bold flex items-center justify-center transition-all ${isCurrent
                            ? 'bg-crypto-primary text-white shadow-lg'
                            : 'bg-white text-crypto-navy hover:bg-gray-100 border border-gray-100'
                            }`}
                        >
                          {pageNum}
                        </Link>
                      )
                    })}
                  </nav>
                )}
              </>
            ) : (
              <div className="text-center py-24 bg-white rounded-[3rem] border border-gray-100">
                <div className="text-6xl mb-6">🔍</div>
                <h3 className="text-2xl font-black text-crypto-darker mb-2">Nada encontrado</h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">Não encontramos artigos para sua busca. Tente palavras-chave diferentes ou explore nossas categorias.</p>
                <Link href="/blog" className="px-8 py-3 bg-crypto-primary text-white font-bold rounded-xl">Ver Tudo</Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside>
            <div className="sticky top-24 space-y-10">
              {/* Sidebar Ad 1 */}
              <div className="rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 aspect-[300/600] flex items-center justify-center">
                <AdSense slot="blog-sidebar-top" />
              </div>

              {/* Topics Card */}
              <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                <h4 className="font-bold text-xs uppercase tracking-widest text-crypto-darker mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-crypto-primary rounded-full"></span>
                  Explorar Tópicos
                </h4>
                <CategoryLinks categorySlug={category || ''} limit={8} />
              </div>

              {/* Sidebar Ad 2 */}
              <div className="rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 aspect-[300/250] flex items-center justify-center">
                <AdSense slot="blog-sidebar-middle" />
              </div>

              {/* Popular Articles */}
              <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                <h4 className="font-bold text-xs uppercase tracking-widest text-crypto-darker mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-crypto-primary rounded-full"></span>
                  Mais Lidos
                </h4>
                <PopularPosts categorySlug={category || ''} limit={4} />
              </div>

              {/* Sidebar Ad 3 */}
              <div className="rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 aspect-[300/600] flex items-center justify-center">
                <AdSense slot="blog-sidebar-bottom" />
              </div>
            </div>
          </aside>
        </div>

        {/* Categories Section (Secondary Grid) */}
        {!category && !searchQuery && (
          <section className="mt-24 pt-24 border-t border-gray-100">
            <h2 className="text-3xl font-black text-crypto-darker mb-10">Arquivos por Categoria</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map(cat => (
                <CategoryCard key={cat.slug} category={cat} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
