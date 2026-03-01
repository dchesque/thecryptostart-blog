import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeHighlight from 'rehype-highlight'
import { getPostBySlug, getRelatedPosts, getAllPostSlugs, getAllCategories } from '@/lib/posts'
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
import Sidebar from '@/components/Sidebar'
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

function splitMarkdownIntoHalves(markdown: string) {
  if (!markdown) return { firstHalf: '', secondHalf: '' }
  const length = markdown.length
  const midPoint = Math.floor(length / 2)

  let splitIndex = markdown.indexOf('\n\n', midPoint)
  if (splitIndex === -1) {
    splitIndex = markdown.lastIndexOf('\n\n', midPoint)
  }
  if (splitIndex === -1) {
    splitIndex = midPoint
  }

  const firstHalf = markdown.slice(0, splitIndex)
  const secondHalf = markdown.slice(splitIndex)
  return { firstHalf, secondHalf }
}

function extractHeadingsFromMarkdown(content: string): Heading[] {
  const headings: Heading[] = []
  const seenIds = new Map<string, number>()

  if (!content) return headings

  const regex = /^(#{2,3})\s+(.+)$/gm
  let match

  while ((match = regex.exec(content)) !== null) {
    const level = match[1].length as 2 | 3
    const text = match[2].trim()
    let id = slugify(text)

    if (seenIds.has(id)) {
      const count = seenIds.get(id)! + 1
      seenIds.set(id, count)
      id = `${id}-${count}`
    } else {
      seenIds.set(id, 0)
    }

    headings.push({ id, text, level })
  }

  return headings
}

const MarkdownComponents = {
  a: ({ node, href, ...props }: any) => {
    const linkHref = href || ''
    const className = "text-crypto-primary hover:text-crypto-accent underline transition-colors"

    if (linkHref.startsWith('/')) {
      return <Link href={linkHref} className={className} {...props} />
    }

    return <a href={linkHref} target="_blank" rel="noopener noreferrer" className={className} {...props} />
  },
  img: ({ node, src, alt, ...props }: any) => (
    <figure className="my-8">
      <Image
        src={src || ''}
        alt={alt || 'Blog image'}
        width={800}
        height={450}
        className="rounded-xl w-full object-cover aspect-video"
      />
      {alt && (
        <figcaption className="text-center text-sm text-gray-500 mt-2">
          {alt}
        </figcaption>
      )}
    </figure>
  ),
  blockquote: ({ node, ...props }: any) => (
    <blockquote className="border-l-4 border-crypto-primary pl-4 py-2 my-6 italic text-gray-400 bg-crypto-darker/50 rounded-r-lg" {...props} />
  ),
  code: ({ node, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '')
    const isInline = !match && !className?.includes('language-')

    if (isInline) {
      return (
        <code className="bg-crypto-darker px-2 py-1 rounded text-crypto-primary font-mono text-sm" {...props}>
          {children}
        </code>
      )
    }

    return (
      <code className={className} {...props}>
        {children}
      </code>
    )
  }
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
                  headings={extractHeadingsFromMarkdown(post.content)}
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
                  const contentString = post.content || ''
                  if (!contentString) {
                    return <div className="py-10 text-center text-gray-500 italic">This post has no content yet.</div>
                  }

                  const { firstHalf, secondHalf } = splitMarkdownIntoHalves(contentString)

                  return (
                    <>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings, rehypeHighlight]}
                        components={MarkdownComponents}
                      >
                        {firstHalf}
                      </ReactMarkdown>

                      {/* Ad — Middle Content (blog-middle) */}
                      <div className="not-prose my-10 rounded-xl overflow-hidden bg-gray-50 min-h-[280px] flex items-center justify-center border border-gray-100">
                        <AdSense slot="blog-middle" />
                      </div>

                      {/* Inline Newsletter */}
                      <InlineNewsletter />

                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings, rehypeHighlight]}
                        components={MarkdownComponents}
                      >
                        {secondHalf}
                      </ReactMarkdown>

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
            <Sidebar categories={categories} recentPosts={relatedPosts} className="hidden lg:block" />
          </div>
        </div>
      </article>
    </>
  )
}
