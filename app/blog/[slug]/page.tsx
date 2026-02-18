import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { documentToReactComponents, Options } from '@contentful/rich-text-react-renderer'
import { BLOCKS, INLINES, MARKS } from '@contentful/rich-text-types'
import { getPostBySlug, getRelatedPosts, getAllPostSlugs, getAllCategories } from '@/lib/contentful'
import { generateMetadata as generateSeoMetadata, generateSchema, generateBreadcrumbSchema } from '@/lib/seo'
import AdSense from '@/components/AdSense'
import TableOfContents from '@/components/TableOfContents'
import NewsletterForm from '@/components/NewsletterForm'
import RelatedPosts from '@/components/RelatedPosts'
import BlogCard from '@/components/BlogCard'
import ShareButtons from '@/components/ShareButtons'
import AuthorCard from '@/components/AuthorCard'
import { BLOG_CONFIG, CACHE_CONFIG, getCategoryName, SITE_CONFIG, getCategoryBySlug } from '@/lib/constants'

// ISR: Revalidate every 5 minutes
export const revalidate = 300

interface PostPageProps {
  params: Promise<{ slug: string }>
}

// Generate static params for all posts
export async function generateStaticParams() {
  const slugs = await getAllPostSlugs()
  return slugs.map((slug) => ({ slug }))
}

// Generate metadata for the post
export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return generateSeoMetadata({
    title: post.title,
    description: post.description,
    image: post.featuredImage?.url,
    publishedAt: post.publishedAt,
    modifiedAt: post.updatedAt,
    keywords: post.tags,
  })
}

/**
 * Rich text rendering options
 * Configures how Contentful rich text is rendered
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const richTextOptions: Options = {
  renderMark: {
    [MARKS.BOLD]: (text) => <strong className="font-bold">{text}</strong>,
    [MARKS.ITALIC]: (text) => <em className="italic">{text}</em>,
    [MARKS.UNDERLINE]: (text) => <u className="underline">{text}</u>,
    [MARKS.CODE]: (text) => (
      <code className="bg-crypto-darker px-2 py-1 rounded text-crypto-primary font-mono text-sm">
        {text}
      </code>
    ),
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node, children) => {
      // Avoid rendering empty paragraphs which add unnecessary vertical space
      const isEmpty = node.content.every((c: any) => c.nodeType === 'text' && !c.value.trim())
      if (isEmpty) return null
      return <p className="leading-7">{children}</p>
    },
    [BLOCKS.HEADING_2]: (node, children) => {
      const text = (node.content[0] as any)?.value || ''
      const id = slugify(text)
      return (
        <h2 id={id} className="text-2xl font-bold mt-10 mb-4 scroll-mt-24">
          {children}
        </h2>
      )
    },
    [BLOCKS.HEADING_3]: (node, children) => {
      const text = (node.content[0] as any)?.value || ''
      const id = slugify(text)
      return (
        <h3 id={id} className="text-xl font-semibold mt-8 mb-3 scroll-mt-24">
          {children}
        </h3>
      )
    },
    [BLOCKS.HEADING_4]: (node, children) => (
      <h4 className="text-lg font-semibold mt-6 mb-2">{children}</h4>
    ),
    [BLOCKS.UL_LIST]: (node, children) => (
      <ul className="list-disc list-inside mb-6 space-y-2">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (node, children) => (
      <ol className="list-decimal list-inside mb-6 space-y-2">{children}</ol>
    ),
    [BLOCKS.LIST_ITEM]: (node, children) => (
      <li className="text-gray-300">{children}</li>
    ),
    [BLOCKS.QUOTE]: (node, children) => (
      <blockquote className="border-l-4 border-crypto-primary pl-4 py-2 my-6 italic text-gray-400 bg-crypto-darker/50 rounded-r-lg">
        {children}
      </blockquote>
    ),
    [BLOCKS.HR]: () => (
      <hr className="my-8 border-crypto-primary/20" />
    ),
    [BLOCKS.EMBEDDED_ASSET]: (node) => {
      const { file, title, description } = node.data.target.fields
      if (!file?.url) return null

      const url = file.url.startsWith('//') ? `https:${file.url}` : file.url

      return (
        <figure className="my-8">
          <Image
            src={url}
            alt={description || title || 'Blog image'}
            width={file.details?.image?.width || 800}
            height={file.details?.image?.height || 450}
            className="rounded-xl w-full"
          />
          {title && (
            <figcaption className="text-center text-sm text-gray-500 mt-2">
              {title}
            </figcaption>
          )}
        </figure>
      )
    },
    [INLINES.HYPERLINK]: (node, children) => (
      <a
        href={node.data.uri}
        target={node.data.uri.startsWith('http') ? '_blank' : undefined}
        rel={node.data.uri.startsWith('http') ? 'noopener noreferrer' : undefined}
        className="text-crypto-primary hover:text-crypto-accent underline transition-colors"
      >
        {children}
      </a>
    ),
  },
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const [relatedPosts, categories] = await Promise.all([
    getRelatedPosts(
      slug,
      post.category,
      BLOG_CONFIG.relatedPostsCount
    ),
    getAllCategories(),
  ])

  const categoryInfo = categories.find(c => c.slug === post.category)

  // Format dates
  const publishedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Breadcrumb data
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: getCategoryName(post.category), url: `/blog?category=${post.category}` },
    { name: post.title, url: `/blog/${slug}` },
  ]

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateSchema({
            title: post.title,
            description: post.description,
            url: `/blog/${slug}`,
            publishedAt: post.publishedAt,
            modifiedAt: post.updatedAt,
            author: post.author.name,
            image: post.featuredImage?.url,
          }))
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbSchema(breadcrumbs))
        }}
      />

      <article className="min-h-screen bg-[#FDFDFD]">
        {/* Sticky Header Hero */}
        <div className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden bg-crypto-darker">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
            <div className="absolute -top-1/4 -right-1/4 w-full h-full bg-crypto-primary/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute -bottom-1/2 -left-1/4 w-full h-full bg-crypto-ethereum/5 rounded-full blur-[100px]"></div>
          </div>

          <div className="container relative z-10">
            {/* Breadcrumb - Clean & Light */}
            <nav className="mb-10 text-sm animate-fade-in" aria-label="Breadcrumb">
              <ol className="flex items-center gap-3 text-white/70">
                {breadcrumbs.slice(0, -1).map((crumb, index) => (
                  <li key={crumb.url} className="flex items-center gap-3">
                    <Link href={crumb.url} className="hover:text-crypto-primary transition-all duration-300 font-medium">
                      {crumb.name}
                    </Link>
                    <span className="text-white/20 select-none">/</span>
                  </li>
                ))}
                <li className="text-crypto-primary font-bold truncate max-w-[200px] sm:max-w-md">{post.title}</li>
              </ol>
            </nav>

            <div className="max-w-4xl">
              <Link
                href={`/blog?category=${post.category}`}
                className={`
                  inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest
                  animate-slide-up
                `}
                style={{
                  backgroundColor: post.category === 'bitcoin' ? 'rgba(255, 116, 0, 0.2)' :
                    post.category === 'ethereum' ? 'rgba(0, 113, 195, 0.2)' :
                      post.category === 'defi' ? 'rgba(123, 63, 242, 0.2)' :
                        post.category === 'investing-and-strategy' ? 'rgba(255, 20, 147, 0.2)' :
                          post.category === 'crypto-security' ? 'rgba(255, 107, 107, 0.2)' :
                            'rgba(26, 42, 47, 0.2)',
                  color: post.category === 'bitcoin' ? '#FF7400' :
                    post.category === 'ethereum' ? '#0071C3' :
                      post.category === 'defi' ? '#7B3FF2' :
                        post.category === 'investing-and-strategy' ? '#FF1493' :
                          post.category === 'crypto-security' ? '#FF6B6B' :
                            '#1A2A2F',
                  border: '1px solid currentColor'
                }}
              >
                {categoryInfo?.name || getCategoryName(post.category)}
              </Link>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold font-heading text-white mb-8 leading-[1.1] animate-slide-up [animation-delay:100ms]">
                {post.title}
              </h1>

              <p className="text-xl sm:text-2xl text-white/70 mb-12 leading-7 max-w-4xl animate-slide-up [animation-delay:200ms]">
                {post.description}
              </p>

              <div className="flex flex-wrap items-center gap-8 py-8 border-t border-white/10 animate-slide-up [animation-delay:300ms]">
                {/* Author Card */}
                <div className="flex items-center gap-4 group">
                  <div className="relative">
                    {post.author.image ? (
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-xl transform group-hover:scale-105 transition-transform duration-500">
                        <Image
                          src={post.author.image}
                          alt={post.author.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-crypto-primary/20 flex items-center justify-center text-crypto-primary font-bold text-xl border border-crypto-primary/30">
                        {post.author.name.charAt(0)}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-crypto-success rounded-full border-2 border-crypto-darker"></div>
                  </div>
                  <div>
                    <span className="block text-white font-bold text-lg leading-tight group-hover:text-crypto-primary transition-colors">{post.author.name}</span>
                    <time dateTime={post.publishedAt} className="text-sm text-white/40">
                      {publishedDate}
                    </time>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-white/40">
                  <div className="h-10 w-px bg-white/10 hidden sm:block"></div>
                  <div className="flex items-center gap-2.5 bg-white/5 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shrink-0">
                    <svg className="w-5 h-5 text-crypto-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-bold text-xs uppercase tracking-widest text-white/80">{post.readingTime} min read</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container relative py-16 -mt-12 lg:-mt-20">
          <div className="grid lg:grid-cols-[1fr,350px] gap-16">
            {/* Main Content Area */}
            <div className="animate-slide-up [animation-delay:400ms]">
              {/* Featured Image - Premium Presentation */}
              {post.featuredImage && (
                <figure className="mb-8 transform hover:scale-[1.01] transition-transform duration-700 group">
                  <div className="aspect-[21/9] relative rounded-[2.5rem] overflow-hidden shadow-5 border-4 border-white">
                    <Image
                      src={post.featuredImage.url}
                      alt={post.featuredImage.title || post.title}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 1024px) 100vw, 1000px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  {post.featuredImage.description && (
                    <figcaption className="text-center text-sm text-crypto-charcoal/50 mt-6 tracking-wide italic bg-crypto-light/50 py-2 rounded-xl border border-dashed border-crypto-light max-w-2xl mx-auto">
                      {post.featuredImage.description}
                    </figcaption>
                  )}
                </figure>
              )}

              {/* Ad — Above Fold (blog-top) */}
              <div className="my-8 rounded-xl overflow-hidden">
                <AdSense slot="blog-top" />
              </div>

              {/* Share Floating Bottom Mobile */}
              <div className="lg:hidden sticky bottom-6 z-50 flex justify-center content-center animate-bounce-subtle">
                <div className="bg-white/80 backdrop-blur-xl px-6 py-4 rounded-[2rem] shadow-5 border border-crypto-light/50 flex items-center gap-4">
                  <span className="text-[10px] font-bold text-crypto-navy uppercase tracking-widest mr-2">Share</span>
                  <ShareButtons
                    title={post.title}
                    url={`${SITE_CONFIG.url}/blog/${slug}`}
                  />
                </div>
              </div>

              {/* Main Text Content */}
              <div className="prose prose-lg max-w-none prose-p:my-4 prose-p:leading-8 prose-h2:mt-12 prose-h2:mb-5 prose-h3:mt-10 prose-h3:mb-4 prose-headings:font-heading prose-headings:text-crypto-navy prose-p:text-crypto-charcoal/80 prose-a:text-crypto-primary prose-a:no-underline hover:prose-a:text-crypto-accent prose-a:font-bold prose-img:rounded-3xl prose-strong:text-crypto-navy prose-strong:font-bold">
                {(() => {
                  const seenIds = new Map<string, number>()
                  const nodes = post.content.content
                  const midIndex = Math.floor(nodes.length / 2)
                  const firstHalf = { ...post.content, content: nodes.slice(0, midIndex) }
                  const secondHalf = { ...post.content, content: nodes.slice(midIndex) }

                  const renderOptions = {
                    ...richTextOptions,
                    renderNode: {
                      ...richTextOptions.renderNode,
                      [BLOCKS.HEADING_2]: (node: any, children: any) => {
                        const text = (node.content[0] as any)?.value || ''
                        let id = slugify(text)

                        if (seenIds.has(id)) {
                          const count = seenIds.get(id)! + 1
                          seenIds.set(id, count)
                          id = `${id}-${count}`
                        } else {
                          seenIds.set(id, 0)
                        }

                        return (
                          <h2 id={id} className="text-3xl lg:text-4xl font-bold mt-10 mb-6 text-crypto-navy scroll-mt-32 relative pl-6 border-l-4 border-crypto-primary rounded-l-sm">
                            {children}
                          </h2>
                        )
                      },
                      [BLOCKS.HEADING_3]: (node: any, children: any) => {
                        const text = (node.content[0] as any)?.value || ''
                        let id = slugify(text)

                        if (seenIds.has(id)) {
                          const count = seenIds.get(id)! + 1
                          seenIds.set(id, count)
                          id = `${id}-${count}`
                        } else {
                          seenIds.set(id, 0)
                        }

                        return (
                          <h3 id={id} className="text-2xl lg:text-3xl font-bold mt-8 mb-4 text-crypto-navy scroll-mt-32">
                            {children}
                          </h3>
                        )
                      },
                      [BLOCKS.QUOTE]: (node: any, children: any) => (
                        <blockquote className="border-l-0 pl-0 py-12 my-16 relative bg-crypto-darker rounded-[2.5rem] overflow-hidden shadow-4 group">
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-crypto-primary"></div>
                          <div className="relative z-10 px-12 italic text-2xl text-white/90 font-medium leading-7 font-heading">
                            <svg className="absolute -top-6 -left-2 w-20 h-20 text-white/5 -z-10 group-hover:text-crypto-primary/10 transition-colors" fill="currentColor" viewBox="0 0 32 32">
                              <path d="M10 8v8H6v6h8V8h-4zm12 0v8h-4v6h8V8h-4z" />
                            </svg>
                            {children}
                          </div>
                        </blockquote>
                      ),
                    }
                  }

                  return (
                    <>
                      {documentToReactComponents(firstHalf, renderOptions)}
                      {/* Ad — Middle Content (blog-middle) */}
                      <div className="not-prose my-10 rounded-xl overflow-hidden">
                        <AdSense slot="blog-middle" />
                      </div>
                      {documentToReactComponents(secondHalf, renderOptions)}
                    </>
                  )
                })()}
              </div>

              {/* Interaction Bar */}
              <div className="mt-20 p-10 bg-white rounded-[2.5rem] shadow-4 border border-crypto-light flex flex-col md:flex-row items-center justify-between gap-8 group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-crypto-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <div className="relative z-10 text-center md:text-left">
                  <h4 className="text-2xl font-bold text-crypto-navy mb-2 font-heading">Did we help you today?</h4>
                  <p className="text-crypto-charcoal/50 font-medium">Share this guide with your friends!</p>
                </div>
                <div className="relative z-10 scale-110">
                  <ShareButtons
                    title={post.title}
                    url={`${SITE_CONFIG.url}/blog/${slug}`}
                  />
                </div>
              </div>

              {/* Tags Cloud */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-20">
                  <div className="flex items-center gap-4 mb-8">
                    <span className="w-12 h-px bg-crypto-light"></span>
                    <h4 className="text-xs font-black text-crypto-charcoal/30 uppercase tracking-[0.2em] whitespace-nowrap">Explore More</h4>
                    <span className="flex-grow h-px bg-crypto-light"></span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/blog?search=${tag}`}
                        className="text-sm bg-white border border-crypto-light text-crypto-navy font-bold px-6 py-3 rounded-2xl hover:bg-crypto-primary hover:text-white hover:border-crypto-primary transition-all duration-500 shadow-sm hover:shadow-lg transform hover:-translate-y-0.5"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Author Card — Credibility after content */}
              <AuthorCard
                author={post.author}
                category={post.category}
                className="mt-16"
              />

              {/* Newsletter Premium Card */}
              <div className="mt-24 p-12 relative overflow-hidden bg-crypto-darker rounded-[3rem] text-white shadow-5 group">
                {/* Decoration */}
                <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-crypto-primary/20 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-700"></div>
                <div className="absolute -top-24 -left-24 w-60 h-60 bg-crypto-ethereum/10 rounded-full blur-[80px]"></div>

                <div className="relative z-10 max-w-2xl">
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 mb-8">
                    <span className="w-2 h-2 bg-crypto-primary rounded-full animate-ping"></span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Premium Access</span>
                  </div>
                  <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading mb-6 leading-tight">
                    Don't miss the next <span className="text-crypto-primary">Crypto Gem.</span>
                  </h3>
                  <p className="text-xl text-white/60 mb-10 leading-relaxed font-medium">
                    Join 25,000+ investors. Receive weekly insights, airdrop strategies, and security tips in your inbox.
                  </p>
                  <NewsletterForm />
                  <p className="mt-6 text-xs text-white/50 font-medium tracking-wide">
                    We promise: zero spam. Just real value. Cancel anytime.
                  </p>
                </div>
              </div>

              {/* Related Content */}
              {relatedPosts.length > 0 && (
                <div className="mt-32 border-t border-crypto-light pt-20">
                  <h3 className="text-4xl font-bold font-heading text-crypto-navy mb-12 text-center">More to Read</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {relatedPosts.map(p => (
                      <BlogCard key={p.id} post={p} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Sticky */}
            <aside className="hidden lg:block">
              <div className="sticky top-32 space-y-12">
                {/* Table of Contents - Premium */}
                <div className="bg-white p-8 rounded-[2rem] shadow-4 border border-crypto-light relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-crypto-primary/5 rounded-full -mr-8 -mt-8"></div>
                  <h4 className="text-xs font-black text-crypto-charcoal/40 mb-8 uppercase tracking-[0.2em] flex items-center gap-3">
                    <span className="w-6 h-[2px] bg-crypto-primary/40"></span>
                    In this Article
                  </h4>
                  <TableOfContents content={post.content} />
                </div>

                {/* Ads / Widgets */}
                <div className="rounded-[2rem] overflow-hidden shadow-4 border border-crypto-light group">
                  <div className="bg-crypto-light p-4 text-center border-b border-crypto-light">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-crypto-charcoal/30 italic">Partner Advertising</span>
                  </div>
                  <AdSense slot="blog-sidebar" />
                </div>

                {/* Quick Share Widget */}
                <div className="bg-crypto-primary rounded-[2rem] p-8 text-white shadow-4 text-center">
                  <h5 className="font-bold text-lg mb-4">Share this guide!</h5>
                  <div className="flex justify-center">
                    <ShareButtons
                      title={post.title}
                      url={`${SITE_CONFIG.url}/blog/${slug}`}
                    />
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </article>
    </>
  )
}
