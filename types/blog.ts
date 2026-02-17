/**
 * Blog Types & Interfaces
 * Crypto Academy - Educational Blog
 * 
 * TypeScript strict mode enabled
 * All interfaces for Contentful CMS integration
 */

import type { Document } from '@contentful/rich-text-types'

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
  /** Rich text content from Contentful */
  content: Document
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
 * Contentful Entry Fields for BlogPost
 * Raw response structure from Contentful API
 */
export interface ContentfulBlogPostFields {
  title: string
  slug: string
  excerpt: string
  content: Document
  featuredImage?: {
    fields: {
      title: string
      description?: string
      file: {
        url: string
        details: {
          image: {
            width: number
            height: number
          }
        }
      }
    }
  }
  author: any // Can be a string or a reference entry
  authorSlug?: string
  authorImage?: string
  category: any // Can be a string/slug or a reference entry
  tags?: string[]
  publishDate?: string
  readingTime?: number
}

/**
 * Contentful Entry System Metadata
 */
export interface ContentfulSys {
  id: string
  createdAt: string
  updatedAt: string
}

/**
 * Full Contentful Entry for BlogPost
 */
export interface ContentfulBlogPost {
  sys: ContentfulSys
  fields: ContentfulBlogPostFields
}

/**
 * Category configuration with display info
 */
export interface CategoryConfig {
  slug: BlogCategory
  name: string
  icon: string
}

/**
 * Tag options for filtering
 */
export interface TagOptions {
  /** Filter by tags */
  tags?: string[]
}
