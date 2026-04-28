import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeHighlight from 'rehype-highlight'
import { Lightbulb } from 'lucide-react'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'

import { getPostBySlug, getRelatedPosts, getAllPostSlugs, getAllCategories } from '@/lib/posts'
import {
  generateMetadata as generateSeoMetadata,
  generateAIOptimizedArticleSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
} from '@/lib/seo'
import { extractQuickAnswer, generateFAQFromPost } from '@/lib/ai-optimization'

import FAQSection from '@/components/FAQSection'
import AdSense from '@/components/AdSense'
import TableOfContents from '@/components/TableOfContents'
import CompactTableOfContents from '@/components/CompactTableOfContents'
import ShareButtons from '@/components/ShareButtons'
import AuthorCard from '@/components/AuthorCard'
import RecommendedContent from '@/components/RecommendedContent'
import InlineNewsletter from '@/components/InlineNewsletter'
import Breadcrumb from '@/components/Breadcrumb'
import PostMeta from '@/components/PostMeta'
import InContentAd from '@/components/InContentAd'

import { BLOG_CONFIG, getCategoryName, SITE_CONFIG } from '@/lib/constants'

const SocialComments = dynamic(() => import('@/components/SocialComments'), {
  loading: () => (
    <div className="py-12 text-center text-ink-mute italic">Loading discussion…</div>
  ),
})

const RelatedPosts = dynamic(() => import('@/components/RelatedPosts'), {
  loading: () => <div className="h-64 bg-cream rounded-xl animate-pulse" />,
})

interface PostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return { title: 'Post Not Found' }

  return generateSeoMetadata({
    title: post.title,
    description: post.description,
    image: post.featuredImage?.url,
    publishedAt: post.publishedAt,
    modifiedAt: post.updatedAt,
    keywords: post.tags,
  })
}

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

function extractHeadingsFromMarkdown(content: string): Heading[] {
  const headings: Heading[] = []
  const seen = new Map<string, number>()
  if (!content) return headings

  const regex = /^(#{2,3})\s+(.+)$/gm
  let match
  while ((match = regex.exec(content)) !== null) {
    const level = match[1].length as 2 | 3
    const text = match[2].trim().replace(/[*_`]/g, '')
    let id = slugify(text)
    if (seen.has(id)) {
      const count = seen.get(id)! + 1
      seen.set(id, count)
      id = `${id}-${count}`
    } else {
      seen.set(id, 0)
    }
    headings.push({ id, text, level })
  }
  return headings
}

/**
 * Split markdown into halves at a paragraph boundary near the middle. Used
 * to insert a single discreet sponsor placement mid-article without
 * fragmenting the reading flow.
 */
function splitMarkdownIntoHalves(markdown: string) {
  if (!markdown) return { firstHalf: '', secondHalf: '' }
  const length = markdown.length
  const midPoint = Math.floor(length / 2)
  let splitIndex = markdown.indexOf('\n\n', midPoint)
  if (splitIndex === -1) splitIndex = markdown.lastIndexOf('\n\n', midPoint)
  if (splitIndex === -1) splitIndex = midPoint
  return {
    firstHalf: markdown.slice(0, splitIndex),
    secondHalf: markdown.slice(splitIndex),
  }
}

const MarkdownComponents = {
  a: ({ node, href, ...props }: any) => {
    const linkHref = href || ''
    if (linkHref.startsWith('/')) {
      return <Link href={linkHref} {...props} />
    }
    return <a href={linkHref} target="_blank" rel="noopener noreferrer" {...props} />
  },
  img: ({ node, src, alt, ...props }: any) => (
    <figure className="my-10">
      <div className="relative rounded-xl overflow-hidden bg-cream aspect-video">
        <Image
          src={src || ''}
          alt={alt || ''}
          fill
          sizes="(max-width: 768px) 100vw, 720px"
          className="object-cover"
        />
      </div>
      {alt && (
        <figcaption className="text-center text-sm text-ink-mute mt-3 italic">
          {alt}
        </figcaption>
      )}
    </figure>
  ),
  code: ({ node, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '')
    const isInline = !match && !className?.includes('language-')
    if (isInline) {
      return (
        <code {...props}>
          {children}
        </code>
      )
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    )
  },
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const [relatedPosts, categories] = await Promise.all([
    getRelatedPosts(slug, post.category, BLOG_CONFIG.relatedPostsCount),
    getAllCategories(),
  ])
  const categoryInfo = categories.find((c) => c.slug === post.category)
  const categoryName = getCategoryName(post.category)
  const articleUrl = `${SITE_CONFIG.url}/blog/${slug}`

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Articles', url: '/blog' },
    { name: categoryName, url: `/blog?category=${post.category}` },
    { name: post.title, url: `/blog/${slug}` },
  ]

  const quickAnswer = extractQuickAnswer(post.content)
  const faqItems = generateFAQFromPost(post)
  const headings = extractHeadingsFromMarkdown(post.content)
  const { firstHalf, secondHalf } = splitMarkdownIntoHalves(post.content || '')

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateAIOptimizedArticleSchema({
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
            })
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbSchema(breadcrumbs)),
        }}
      />
      {faqItems.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateFAQSchema(faqItems)),
          }}
        />
      )}

      <article className="bg-paper">
        {/* ============================================================
         *  HERO — light, editorial, centered
         * ============================================================ */}
        <header className="border-b border-line">
          <div className="container-hub pt-8 pb-12 md:pt-12 md:pb-16">
            <div className="max-w-measure mx-auto">
              <Breadcrumb items={breadcrumbs} className="mb-8" />

              <Link
                href={`/blog?category=${post.category}`}
                className="inline-block eyebrow hover:text-accent transition-colors"
              >
                {categoryName}
              </Link>

              <h1 className="mt-4 font-heading font-bold text-ink leading-[1.05] tracking-tight text-balance text-4xl sm:text-5xl md:text-[3.25rem]">
                {post.title}
              </h1>

              <p className="mt-6 text-lg md:text-xl text-ink-soft leading-relaxed max-w-prose">
                {post.description}
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
                <PostMeta
                  variant="stacked"
                  author={post.author}
                  publishedAt={post.publishedAt}
                  updatedAt={post.updatedAt}
                  readingTime={post.readingTime}
                  category={post.category}
                  categoryName={categoryName}
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-mute mr-1 hidden sm:inline">Share</span>
                  <ShareButtons title={post.title} url={articleUrl} variant="pill" />
                </div>
              </div>
            </div>
          </div>

          {/* Lead image */}
          {post.featuredImage?.url && (
            <div className="container-hub pb-12 md:pb-16">
              <div className="max-w-wide mx-auto">
                <figure className="relative aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden bg-cream">
                  <Image
                    src={post.featuredImage.url}
                    alt={post.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 1280px"
                    className="object-cover"
                  />
                </figure>
              </div>
            </div>
          )}
        </header>

        {/* ============================================================
         *  BODY — reading column with sticky sidebar (TOC + share)
         * ============================================================ */}
        <div className="container-hub py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-12 lg:gap-16 max-w-wide mx-auto">

            {/* Reading column */}
            <div className="min-w-0 max-w-post mx-auto lg:mx-0 w-full">
              {/* Mobile TOC */}
              {headings.length >= 2 && (
                <div className="lg:hidden mb-10">
                  <CompactTableOfContents headings={headings} />
                </div>
              )}

              {/* Quick answer (hero callout) */}
              {quickAnswer && (
                <aside className="not-prose mb-10 rounded-2xl bg-accent-soft border border-accent/15 p-6 sm:p-7">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 mt-1 text-accent-deep shrink-0" aria-hidden />
                    <div>
                      <span className="eyebrow">Quick answer</span>
                      <p className="mt-2 text-ink leading-relaxed text-[1.05rem] font-medium">
                        {quickAnswer}
                      </p>
                    </div>
                  </div>
                </aside>
              )}

              <div className="prose prose-lg article-body has-dropcap max-w-none">
                {!post.content ? (
                  <p className="text-ink-mute italic">This post has no content yet.</p>
                ) : (
                  <>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings, rehypeHighlight]}
                      components={MarkdownComponents}
                    >
                      {firstHalf}
                    </ReactMarkdown>

                    {/* A single, discreet mid-article sponsor break */}
                    <InContentAd slot="article-in-content-mid" />

                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings, rehypeHighlight]}
                      components={MarkdownComponents}
                    >
                      {secondHalf}
                    </ReactMarkdown>
                  </>
                )}
              </div>

              {/* Inline newsletter (sits inside the column for cohesion) */}
              <InlineNewsletter />

              {/* Share row */}
              <div className="mt-10 pt-8 border-t border-line flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {post.tags.slice(0, 5).map((tag) => (
                    <span key={tag} className="tag">#{tag}</span>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-ink-mute">Share this article</span>
                  <ShareButtons title={post.title} url={articleUrl} variant="pill" />
                </div>
              </div>

              {/* Author */}
              <div className="mt-12">
                <AuthorCard author={post.author} category={post.category} />
              </div>

              {/* Recommended (with native ad) */}
              <div className="mt-16">
                <RecommendedContent
                  posts={relatedPosts.slice(0, 2).map((p) => ({
                    slug: p.slug,
                    title: p.title,
                    category: p.category,
                    categoryName: getCategoryName(p.category),
                    featuredImage: p.featuredImage,
                  }))}
                  adSlot="recommended-native"
                />
              </div>

              {/* FAQ */}
              {faqItems.length > 0 && (
                <div className="mt-16">
                  <FAQSection
                    items={faqItems}
                    title={`Questions about ${categoryName.toLowerCase()}`}
                  />
                </div>
              )}

              {/* Related */}
              {relatedPosts.length > 0 && (
                <div className="mt-20 pt-12 border-t border-line">
                  <Suspense fallback={<div className="h-72 bg-cream rounded-xl animate-pulse" />}>
                    <RelatedPosts posts={relatedPosts} />
                  </Suspense>
                </div>
              )}

              {/* Comments */}
              <div className="mt-20 pt-12 border-t border-line">
                <Suspense fallback={<div className="h-40 bg-cream rounded-xl animate-pulse" />}>
                  <SocialComments slug={slug} />
                </Suspense>
              </div>
            </div>

            {/* Sidebar — desktop sticky reading aids */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-10">
                {headings.length >= 2 && (
                  <TableOfContents content={post.content} />
                )}

                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="eyebrow-mute">Share</span>
                    <div className="flex-1 h-px bg-line" />
                  </div>
                  <ShareButtons title={post.title} url={articleUrl} variant="pill" />
                </div>

                <div className="rounded-xl border border-line bg-cream p-4 text-center">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-faint">
                    Sponsored
                  </span>
                  <div className="mt-2">
                    <AdSense slot="article-sidebar-top" format="rectangle" />
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
