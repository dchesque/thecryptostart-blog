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
import {
  generateMetadata as generateSeoMetadata,
  generateAIOptimizedArticleSchema,
  generateBreadcrumbSchema,
  generateFAQSchema
} from '@/lib/seo'
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
import ReadingProgressBar from '@/components/ReadingProgressBar'
import InContentAd from '@/components/InContentAd'
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
  const headings = extractHeadingsFromMarkdown(post.content)

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
            author: {
              name: post.author.name,
              image: post.author.image,
              twitter: post.author.twitter,
              linkedin: post.author.linkedin,
            },
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

      {faqItems.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateFAQSchema(faqItems))
          }}
        />
      )}

      <ReadingProgressBar />

      <article className="min-h-screen bg-gray-50/30">
        {/* Breadcrumb - Over the hero for better orientation */}
        <div className="w-full bg-crypto-darker pt-24 pb-4">
          <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8">
            <Breadcrumb items={breadcrumbs} className="text-white/50" />
          </div>
        </div>

        {/* Hero Section - Refactored to 2 columns (Text | Image) */}
        <div className="bg-crypto-darker pb-16 lg:pb-24 lg:min-h-[440px] flex items-center overflow-hidden relative">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
            <div className="absolute -top-1/4 -right-1/4 w-full h-full bg-crypto-primary/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute -bottom-1/2 -left-1/4 w-full h-full bg-crypto-ethereum/5 rounded-full blur-[100px]"></div>
          </div>

          <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column (≈60%): Context & Title */}
              <div className="lg:col-span-7">
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
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold font-heading text-white mb-6 leading-tight animate-slide-up [animation-delay:100ms]">
                  {post.title}
                </h1>
                <p className="text-lg sm:text-xl text-white/70 mb-8 leading-relaxed max-w-2xl animate-slide-up [animation-delay:200ms]">
                  {post.description}
                </p>

                {/* Hero Metadata - Compact & Author Box Component */}
                <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-white/10 animate-slide-up [animation-delay:300ms]">
                  <PostMeta
                    author={post.author}
                    publishedAt={post.publishedAt}
                    readingTime={post.readingTime}
                    category={post.category}
                    categoryName={getCategoryName(post.category)}
                    categoryColor={categoryInfo?.color || '#FF7400'}
                    className="!text-white/80"
                  />
                  {/* Views placeholder if available - as requested in prompt */}
                  <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>2.4k views</span>
                  </div>
                </div>
              </div>

              {/* Right Column (≈40%): Featured Image */}
              <div className="lg:col-span-5 animate-scale-in">
                {post.featuredImage?.url && (
                  <div className="relative aspect-video lg:aspect-[4/3] xl:aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                    <Image
                      src={post.featuredImage.url}
                      alt={post.title}
                      fill
                      priority
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 40vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-crypto-darker/40 to-transparent"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Layout Container */}
        <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8 py-12">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_300px]">

            {/* MAIN CONTENT AREA */}
            <div className="min-w-0 space-y-8">
              {/* Mobile Table of Contents - Accordion style as requested */}
              <div className="lg:hidden">
                <details className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden group">
                  <summary className="p-4 font-bold text-crypto-navy cursor-pointer list-none flex items-center justify-between">
                    <span>In this article</span>
                    <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="p-4 pt-0 border-t border-gray-50">
                    <TableOfContents content={post.content} />
                  </div>
                </details>
              </div>

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

                  // Sophisticated splitting to support 3 in-content ads
                  const paragraphs = contentString.split(/\n\s*\n/)
                  const totalParas = paragraphs.length
                  
                  const firstPart = paragraphs.slice(0, 2).join('\n\n')
                  const midPoint = Math.floor(totalParas / 2)
                  const secondPart = paragraphs.slice(2, midPoint).join('\n\n')
                  const thirdPart = paragraphs.slice(midPoint).join('\n\n')

                  return (
                    <>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings, rehypeHighlight]}
                        components={MarkdownComponents}
                      >
                        {firstPart}
                      </ReactMarkdown>

                      {/* Ad 1: After 2nd paragraph */}
                      <InContentAd slot="article-in-content-top" />

                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings, rehypeHighlight]}
                        components={MarkdownComponents}
                      >
                        {secondPart}
                      </ReactMarkdown>

                      {/* Ad 2: Middle of the article */}
                      <InContentAd slot="article-in-content-mid" />

                      {/* Inline Newsletter - Kept for engagement */}
                      <InlineNewsletter />

                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings, rehypeHighlight]}
                        components={MarkdownComponents}
                      >
                        {thirdPart}
                      </ReactMarkdown>

                      {/* Ad 3: Before related posts (handled outside prose for better spacing) */}
                    </>
                  )
                })()}
              </div>

              {/* Ad 3: Before related articles */}
              <InContentAd slot="article-in-content-bottom" />

              {/* Author Card Section - Improved E-E-A-T */}
              <AuthorCard
                author={post.author}
                category={getCategoryName(post.category)}
                className="my-12 shadow-sm border-gray-100"
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

            {/* RIGHT SIDEBAR - Sticky Desktop Only */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-8">
                {/* 1. Dynamic Table of Contents */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-bold text-crypto-navy mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-crypto-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    Contents
                  </h3>
                  <TableOfContents content={post.content} />
                </div>

                {/* 2. Sidebar Ad Top */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Advertisement</span>
                  <AdSense slot="article-sidebar-top" format="rectangle" className="!bg-transparent !border-none" />
                </div>

                {/* 3. Sidebar Ad Bottom (Sticky anchor) */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Advertisement</span>
                  <AdSense slot="article-sidebar-bottom" format="vertical" className="!bg-transparent !border-none" />
                </div>

                {/* Fallback to legacy categories if ads not visible - for E-E-A-T */}
                <Sidebar categories={categories} className="!space-y-0 opacity-80" />
              </div>
            </aside>
          </div>
        </div>
      </article>
    </>
  )
}
