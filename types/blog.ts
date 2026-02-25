/**
 * Available blog categories
 * Used for filtering and navigation
 */
export type BlogCategory =
  | 'bitcoin'
  | 'ethereum'
  | 'defi'
  | 'crypto-security'
  | 'crypto-opportunities'
  | 'crypto-basics'
  | 'web3-and-innovation'
  | 'investing-and-strategy'

/**
 * Featured image from Contentful Assets
 */
export interface FeaturedImage {
  /** Full URL to the image (Contentful CDN) */
  url: string
  /** Image title/alt text */
  title: string
  /** Optional description for accessibility */
  description?: string
  /** Image width in pixels */
  width: number
  /** Image height in pixels */
  height: number
}

/**
 * Author information
 */
export interface Author {
  /** Display name */
  name: string
  /** URL-friendly slug for author pages */
  slug?: string
  /** Short biography */
  bio?: string
  /** Avatar/profile image URL */
  image?: string
  /** Twitter handle (without @) */
  twitter?: string
}

/**
 * Main BlogPost interface
 * Represents a single blog article from Contentful
 */
export interface BlogPost {
  /** Contentful entry ID */
  id: string
  /** Post title */
  title: string
  /** URL-friendly slug */
  slug: string
  /** Meta description / excerpt */
  description: string
  /** Rich text content from Markdown */
  content: string
  /** Featured/hero image */
  featuredImage?: FeaturedImage
  /** Post author */
  author: Author
  /** Primary category */
  category: BlogCategory
  /** Tags for additional categorization */
  tags: string[]
  /** Publication date (ISO 8601) */
  publishedAt: string
  /** Last update date (ISO 8601) */
  updatedAt: string
  /** Estimated reading time in minutes */
  readingTime: number

  // ═══════════════════════════════════════════
  // NOVOS CAMPOS — SISTEMA DE CONTEÚDO PRÓPRIO
  // ═══════════════════════════════════════════
  wordCount?: number
  isFeatured?: boolean
  contentType?: string
  difficulty?: string

  seoTitle?: string
  seoDescription?: string
  seoImageUrl?: string
  seoNoindex?: boolean
  targetKeyword?: string
  secondaryKeywords?: string[]
  schemaType?: string
  canonicalUrl?: string
  lastReviewedAt?: string

  faq?: any
  howToSteps?: any
  pros?: string[]
  cons?: string[]

  relatedPostsSlugs?: string[]
  pillarPageSlug?: string
  internalLinks?: any

  adDensity?: string
  monetizationDisabled?: boolean
  sponsoredBy?: string
}

/**
 * Blog post metadata for SEO
 */
export interface BlogMetadata {
  /** Page title */
  title: string
  /** Meta description */
  description: string
  /** OG/Twitter image URL */
  image?: string
  /** SEO keywords */
  keywords?: string[]
  /** Publication date for article schema */
  publishedAt?: string
  /** Last modified date */
  modifiedAt?: string
}

/**
 * Pagination options for post listings
 */
export interface PaginationOptions {
  /** Number of posts per page */
  limit?: number
  /** Number of posts to skip (offset) */
  skip?: number
  /** Filter by category */
  category?: BlogCategory
}

/**
 * Search options
 */
export interface SearchOptions {
  /** Maximum results to return */
  limit?: number
}



/**
 * Category configuration with display info
 */
export interface CategoryConfig {
  slug: BlogCategory
  name: string
  icon: string
  color?: string
}

/**
 * Tag options for filtering
 */
export interface TagOptions {
  /** Filter by tags */
  tags?: string[]
}
