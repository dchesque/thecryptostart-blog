/**
 * Contentful CMS Client
 * Crypto Academy - Educational Blog
 * 
 * Provides all functions to fetch blog posts from Contentful
 * Implements caching with ISR (revalidate: 3600)
 */

import { createClient, ContentfulClientApi } from 'contentful'
import type {
  BlogPost,
  BlogCategory,
  CategoryConfig,
  ContentfulBlogPost,
  PaginationOptions,
  SearchOptions,
  TagOptions
} from '@/types/blog'

// Singleton client instance
let client: ContentfulClientApi<undefined> | null = null

/**
 * Get or create the Contentful client
 * Singleton pattern to avoid multiple instances
 */
function getClient(): ContentfulClientApi<undefined> {
  if (!client) {
    const spaceId = process.env.CONTENTFUL_SPACE_ID
    const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN

    console.log('--- Contentful Client Init ---')
    console.log('Space ID:', spaceId ? `${spaceId.substring(0, 4)}...` : 'MISSING')
    console.log('Token:', accessToken ? `${accessToken.substring(0, 4)}...` : 'MISSING')
    console.log('Env:', process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT || 'master')

    if (!spaceId || !accessToken) {
      throw new Error(
        'Contentful environment variables are not configured. ' +
        'Please set CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_TOKEN'
      )
    }

    client = createClient({
      space: spaceId,
      accessToken: accessToken,
      environment: process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT || 'master',
    })
  }
  return client
}

/**
 * Calculate reading time based on content length
 * Assumes average reading speed of 200 words per minute
 */
function calculateReadingTime(content: any): number {
  if (!content) return 1

  // Extract text from rich text document
  const extractText = (node: any): string => {
    if (typeof node === 'string') return node
    if (node.value) return node.value
    if (node.content) {
      return node.content.map(extractText).join(' ')
    }
    return ''
  }

  const text = extractText(content)
  const wordCount = text.split(/\s+/).filter(Boolean).length
  const readingTime = Math.ceil(wordCount / 200)

  return Math.max(1, readingTime) // Minimum 1 minute
}

/**
 * Transform Contentful entry to BlogPost
 */
function transformPost(entry: ContentfulBlogPost): BlogPost {
  const { sys, fields } = entry

  // Handle Author Reference or Legacy String
  let author: BlogPost['author'] = {
    name: 'Crypto Academy',
    slug: fields.authorSlug,
    image: fields.authorImage,
  }

  if (fields.author) {
    if (typeof fields.author === 'string') {
      author.name = fields.author
    } else if (fields.author.fields) {
      const authFields = fields.author.fields
      author.name = authFields.name || author.name
      author.slug = authFields.slug || author.slug

      // Handle Profile Image from reference
      if (authFields.profileImage?.fields?.file?.url) {
        const imgUrl = authFields.profileImage.fields.file.url
        author.image = imgUrl.startsWith('//') ? `https:${imgUrl}` : imgUrl
      }
    }
  }

  // Handle Category Reference or Legacy String
  let categorySlug: BlogCategory = 'bitcoin'
  if (fields.category) {
    if (typeof fields.category === 'string') {
      categorySlug = fields.category as BlogCategory
    } else if (fields.category.fields?.slug) {
      categorySlug = fields.category.fields.slug as BlogCategory
    }
  }

  // Build featured image if available
  let featuredImage: BlogPost['featuredImage'] = undefined
  if (fields.featuredImage?.fields?.file) {
    const imgFields = fields.featuredImage.fields
    featuredImage = {
      url: imgFields.file.url.startsWith('//')
        ? `https:${imgFields.file.url}`
        : imgFields.file.url,
      title: imgFields.title || fields.title,
      description: imgFields.description,
      width: imgFields.file.details?.image?.width || 1200,
      height: imgFields.file.details?.image?.height || 630,
    }
  }

  return {
    id: sys.id,
    title: fields.title,
    slug: fields.slug,
    description: fields.excerpt,
    content: fields.content,
    featuredImage,
    author,
    category: categorySlug,
    tags: fields.tags || [],
    publishedAt: fields.publishDate || sys.createdAt,
    updatedAt: sys.updatedAt,
    readingTime: fields.readingTime || calculateReadingTime(fields.content),
  }
}

/**
 * Get all published posts with optional filtering and pagination
 */
export async function getAllPosts(options?: PaginationOptions & TagOptions): Promise<BlogPost[]> {
  try {
    const { limit = 100, skip = 0, category, tags } = options || {}

    const query: any = {
      content_type: 'blogPost',
      order: ['-fields.publishDate', '-sys.createdAt'],
      limit,
      skip,
      // Only get published posts (publishDate <= now)
      'fields.publishDate[lte]': new Date().toISOString(),
    }

    console.log(`[Contentful] Querying posts at: ${query['fields.publishDate[lte]']}`)

    // Filter by category if provided (reference field)
    if (category) {
      query['fields.category.sys.contentType.sys.id'] = 'category'
      query['fields.category.fields.slug'] = category
    }

    // Filter by tags if provided
    if (tags && tags.length > 0) {
      query['metadata.tags.sys.id[in]'] = tags.join(',')
    }

    const response = await getClient().getEntries(query)
    console.log(`getAllPosts found: ${response.items.length} posts (Total in space: ${response.total})`)

    return response.items.map((item) => transformPost(item as unknown as ContentfulBlogPost))
  } catch (error) {
    console.error('Error fetching posts:', error)
    return []
  }
}

/**
 * Get a single post by slug
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const response = await getClient().getEntries({
      content_type: 'blogPost',
      'fields.slug': slug,
      limit: 1,
      // Include linked entries (author, images)
      include: 2,
    })

    if (response.items.length === 0) {
      return null
    }

    return transformPost(response.items[0] as unknown as ContentfulBlogPost)
  } catch (error) {
    console.error(`Error fetching post by slug "${slug}":`, error)
    return null
  }
}

/**
 * Get posts by category with pagination
 */
export async function getPostsByCategory(
  category: BlogCategory,
  options?: { limit?: number; skip?: number }
): Promise<BlogPost[]> {
  return getAllPosts({
    category,
    limit: options?.limit,
    skip: options?.skip,
  })
}

/**
 * Get related posts (same category, excluding current)
 */
export async function getRelatedPosts(
  currentSlug: string,
  category: BlogCategory,
  limit: number = 3
): Promise<BlogPost[]> {
  try {
    const response = await getClient().getEntries({
      content_type: 'blogPost',
      'fields.category.sys.contentType.sys.id': 'category',
      'fields.category.fields.slug': category,
      'fields.slug[ne]': currentSlug,
      order: ['-fields.publishDate', '-sys.createdAt'],
      limit,
      'fields.publishDate[lte]': new Date().toISOString(),
    })

    return response.items.map((item) => transformPost(item as unknown as ContentfulBlogPost))
  } catch (error) {
    console.error('Error fetching related posts:', error)
    return []
  }
}

/**
 * Get all categories from Contentful
 * Fetches all entries of type 'category' ordered by the 'order' field
 */
export async function getAllCategories(): Promise<CategoryConfig[]> {
  try {
    const response = await getClient().getEntries({
      content_type: 'category',
      order: ['fields.order', 'fields.name'],
    })

    return response.items.map((item: any) => ({
      slug: item.fields.slug as BlogCategory,
      name: item.fields.name,
      description: item.fields.description,
      icon: item.fields.icon || '📚', // Default icon if missing
      color: item.fields.color,
    }))
  } catch (error) {
    console.error('Error fetching categories from Contentful:', error)
    return []
  }
}

/**
 * Get total count of published posts
 */
export async function getTotalPostsCount(category?: BlogCategory): Promise<number> {
  try {
    const query: any = {
      content_type: 'blogPost',
      limit: 0, // We only need the total count
      'fields.publishDate[lte]': new Date().toISOString(),
    }

    if (category) {
      query['fields.category.sys.contentType.sys.id'] = 'category'
      query['fields.category.fields.slug'] = category
    }

    const response = await getClient().getEntries(query)
    return response.total
  } catch (error) {
    console.error('Error fetching posts count:', error)
    return 0
  }
}

/**
 * Search posts by query string
 */
export async function searchPosts(
  query: string,
  options?: SearchOptions
): Promise<BlogPost[]> {
  try {
    if (!query.trim()) {
      return []
    }

    const response = await getClient().getEntries({
      content_type: 'blogPost',
      query: query.trim(),
      order: ['-fields.publishDate', '-sys.createdAt'],
      limit: options?.limit || 20,
      'fields.publishDate[lte]': new Date().toISOString(),
    })

    return response.items.map((item) => transformPost(item as unknown as ContentfulBlogPost))
  } catch (error) {
    console.error(`Error searching posts for "${query}":`, error)
    return []
  }
}

/**
 * Get posts for static generation (all slugs)
 */
export async function getAllPostSlugs(): Promise<string[]> {
  try {
    const posts = await getAllPosts({ limit: 1000 })
    return posts.map(post => post.slug)
  } catch (error) {
    console.error('Error fetching post slugs:', error)
    return []
  }
}
