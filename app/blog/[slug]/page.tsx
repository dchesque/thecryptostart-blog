import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { documentToReactComponents, Options } from '@contentful/rich-text-react-renderer'
import { BLOCKS, INLINES, MARKS } from '@contentful/rich-text-types'
import { getPostBySlug, getRelatedPosts, getAllPostSlugs, getAllCategories } from '@/lib/contentful'
import { generateMetadata as generateSeoMetadata, generateSchema, generateBreadcrumbSchema, generateAIOptimizedArticleSchema } from '@/lib/seo'
import { extractQuickAnswer, generateFAQFromPost } from '@/lib/ai-optimization'
import FAQSection from '@/components/FAQSection'
import AdSense from '@/components/AdSense'
import TableOfContents from '@/components/TableOfContents'
import NewsletterForm from '@/components/NewsletterForm'
import BlogCard from '@/components/BlogCard'
import ShareButtons from '@/components/ShareButtons'
import AuthorCard from '@/components/AuthorCard'
import RecommendedContent from '@/components/RecommendedContent'
import InlineNewsletter from '@/components/InlineNewsletter'
import Breadcrumb from '@/components/Breadcrumb'
import PostMeta from '@/components/PostMeta'
import FeaturedImage from '@/components/FeaturedImage'
import CompactTableOfContents from '@/components/CompactTableOfContents'
import CategoryLinks from '@/components/CategoryLinks'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Dynamic imports for heavy or below-the-fold components
const SocialComments = dynamic(() => import('@/components/SocialComments'), {
  loading: () => <div className="py-20 text-center text-gray-400 animate-pulse">Loading discussion...</div>,
})

const RelatedPosts = dynamic(() => import('@/components/RelatedPosts'), {
  loading: () => <div className="py-12 bg-gray-50 rounded-xl animate-pulse" />,
})

const PopularPosts = dynamic(() => import('@/components/PopularPosts'), {
  loading: () => <div className="h-40 bg-gray-50 rounded-xl animate-pulse" />,
})

import { BLOG_CONFIG, CACHE_CONFIG, getCategoryName, SITE_CONFIG, getCategoryBySlug } from '@/lib/constants'

// ISR: Dynamic revalidation from config (Hardcoded for Next.js build optimization)
export const revalidate = 86400

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

interface Heading {
  id: string
  text: string
  level: 1 | 2 | 3
}

function extractHeadingsFromRichText(content: any): Heading[] {
  const headings: Heading[] = []
  const seenIds = new Map<string, number>()

  content.content.forEach((node: any) => {
    if ([BLOCKS.HEADING_2, BLOCKS.HEADING_3].includes(node.nodeType)) {
      const text = node.content[0]?.value || ''
      if (!text) return

      const level = node.nodeType === BLOCKS.HEADING_2 ? 2 : 3
      let id = slugify(text)

      if (seenIds.has(id)) {
        const count = seenIds.get(id)! + 1
        seenIds.set(id, count)
        id = `${id}-${count}`
      } else {
        seenIds.set(id, 0)
      }

      headings.push({ id, text, level: level as 1 | 2 | 3 })
    }
  })

  return headings
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
    [BLOCKS.PARAGRAPH]: (node, children) => (
      <p className="leading-tight mb-2 last:mb-0 text-crypto-charcoal/80">{children}</p>
    ),
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
      <ul className="list-disc list-outside mb-4 ml-6 space-y-1">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (node, children) => (
      <ol className="list-decimal list-outside mb-4 ml-6 space-y-1">{children}</ol>
    ),
    [BLOCKS.LIST_ITEM]: (node, children) => {
      // If children is a paragraph, we might want to unwrap it if it's the only one
      // but Tailwind Typography .prose li p handles it better if we just control margins
      return <li className="text-crypto-charcoal/80 pl-2 leading-tight">{children}</li>
    },
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

  const quickAnswer = extractQuickAnswer(post.content)
  const faqItems = generateFAQFromPost(post)

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateAIOptimizedArticleSchema({
            title: post.title,
            description: post.description,
            url: `/blog/${slug}`,
            publishedAt: post.publishedAt,
            modifiedAt: post.updatedAt,
            author: post.author.name,
            image: post.featuredImage?.url,
            quickAnswer: quickAnswer || undefined,
            tags: post.tags,
            readingTime: post.readingTime,
          }))
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbSchema(breadcrumbs))
        }}
      />

      <article className="min-h-screen bg-gray-50/30">
        {/* Main Header Container - Full width */}
        <div className="bg-crypto-darker pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden relative">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
            <div className="absolute -top-1/4 -right-1/4 w-full h-full bg-crypto-primary/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute -bottom-1/2 -left-1/4 w-full h-full bg-crypto-ethereum/5 rounded-full blur-[100px]"></div>
          </div>

          <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8 relative z-10">
            <div className="max-w-4xl">
              <Link
                href={`/blog?category=${post.category}`}
                className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 animate-slide-up"
                style={{
                  backgroundColor: post.category === 'bitcoin' ? 'rgba(255, 116, 0, 0.2)' :
                    post.category === 'ethereum' ? 'rgba(0, 113, 195, 0.2)' :
                      'rgba(26, 42, 47, 0.2)',
                  color: post.category === 'bitcoin' ? '#FF7400' :
                    post.category === 'ethereum' ? '#0071C3' :
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
            </div>
          </div>
        </div>

        {/* 3-Column Grid Layout */}
        <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8 py-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[100px_1fr_300px]">

            {/* LEFT: Compact TOC Dots (Desktop Only) */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <CompactTableOfContents
                  headings={extractHeadingsFromRichText(post.content)}
                  variant="minimal"
                />
              </div>
            </aside>

            {/* CENTER: Main Content */}
            <div className="max-w-post mx-auto w-full space-y-8">
              <Breadcrumb items={breadcrumbs} className="mb-4" />

              <PostMeta
                author={post.author}
                publishedAt={post.publishedAt}
                readingTime={post.readingTime}
                category={post.category}
                categoryName={getCategoryName(post.category)}
                categoryColor={categoryInfo?.color || '#FF7400'}
                updatedAt={post.updatedAt}
                className="mb-8"
              />

              <FeaturedImage
                src={post.featuredImage?.url || ''}
                alt={post.title}
                caption={post.featuredImage?.description}
                priority
                className="mb-8"
              />

              {/* Ad Placement #1 - blog-top */}
              <div className="my-8 rounded-xl overflow-hidden bg-gray-50 min-h-[120px] flex items-center justify-center border border-gray-100">
                <AdSense slot="blog-top" />
              </div>

              {/* AI Quick Answer Box */}
              {quickAnswer && (
                <div className="mb-10 bg-crypto-primary/5 border-l-4 border-crypto-primary p-6 rounded-r-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-crypto-primary/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-crypto-primary/20 transition-all duration-500"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">💡</span>
                      <h3 className="font-bold text-crypto-navy uppercase tracking-widest text-sm">Quick Answer</h3>
                    </div>
                    <p className="text-crypto-navy font-medium leading-relaxed italic text-lg">
                      {quickAnswer}
                    </p>
                  </div>
                </div>
              )}

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
                    }
                  }

                  return (
                    <>
                      {documentToReactComponents(firstHalf, renderOptions)}

                      {/* Ad — Middle Content (blog-middle) */}
                      <div className="not-prose my-10 rounded-xl overflow-hidden bg-gray-50 min-h-[280px] flex items-center justify-center border border-gray-100">
                        <AdSense slot="blog-middle" />
                      </div>

                      {/* Inline Newsletter */}
                      <InlineNewsletter />

                      {documentToReactComponents(secondHalf, renderOptions)}

                      {/* Ad — Bottom Content (blog-bottom) */}
                      <div className="not-prose my-10 rounded-xl overflow-hidden bg-gray-50 min-h-[280px] flex items-center justify-center border border-gray-100">
                        <AdSense slot="blog-bottom" />
                      </div>
                    </>
                  )
                })()}
              </div>

              {/* Author Card Section */}
              <AuthorCard
                author={post.author}
                category={getCategoryName(post.category)}
                className="my-12"
              />

              {/* Recommended & Related */}
              <div className="space-y-12 pt-12 border-t border-gray-100">
                <RecommendedContent
                  posts={relatedPosts.slice(0, 2).map(p => ({
                    slug: p.slug,
                    title: p.title,
                    category: p.category,
                    categoryName: getCategoryName(p.category),
                    featuredImage: p.featuredImage,
                  }))}
                  adSlot="recommended-native"
                />

                {/* AI FAQ Section */}
                {faqItems.length > 0 && (
                  <FAQSection
                    items={faqItems}
                    title={`Questions about ${post.title}`}
                  />
                )}

                <Suspense fallback={<div className="h-64 bg-gray-50 rounded-xl animate-pulse" />}>
                  <SocialComments slug={slug} />
                </Suspense>

                {relatedPosts.length > 0 && (
                  <Suspense fallback={<div className="h-96 bg-gray-50 rounded-xl animate-pulse" />}>
                    <RelatedPosts posts={relatedPosts} />
                  </Suspense>
                )}
              </div>
            </div>

            {/* RIGHT: Sidebar (Desktop Only) */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-8">
                {/* Sidebar Ad 1 */}
                <div className="rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 aspect-[300/600] flex items-center justify-center">
                  <AdSense slot="blog-sidebar-top" />
                </div>

                {/* TOC Compact (Secondary) */}
                <CompactTableOfContents
                  headings={extractHeadingsFromRichText(post.content)}
                  variant="compact"
                />

                {/* Related Categories */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-4">
                  <h4 className="font-bold text-sm mb-4 uppercase tracking-widest text-crypto-navy">More Categories</h4>
                  <CategoryLinks categorySlug={post.category} limit={6} />
                </div>

                {/* Sidebar Ad 2 */}
                <div className="rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 aspect-[300/250] flex items-center justify-center">
                  <AdSense slot="blog-sidebar-middle" />
                </div>

                {/* Popular Posts */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-4">
                  <h4 className="font-bold text-sm mb-4 uppercase tracking-widest text-crypto-navy">Popular Now</h4>
                  <Suspense fallback={<div className="h-40 bg-gray-50 rounded-2xl animate-pulse" />}>
                    <PopularPosts categorySlug={post.category} limit={3} />
                  </Suspense>
                </div>

                {/* Final Sidebar Ad */}
                <div className="rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 aspect-[300/600] flex items-center justify-center">
                  <AdSense slot="blog-sidebar-bottom" />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </article>
    </>
  )
}
