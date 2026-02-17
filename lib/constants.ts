/**
 * Site & Blog Configuration Constants
 * Crypto Academy - Educational Blog
 * 
 * All configuration constants with const assertions for type safety
 */

import type { BlogCategory, CategoryConfig } from '@/types/blog'

/**
 * Main site configuration
 */
export const SITE_CONFIG = {
  name: 'TheCryptoStart',
  title: 'Cryptocurrency for Beginners | Complete & Secure Guide',
  description: 'Learn about Bitcoin, Ethereum, and DeFi with educational guides focused on real security. The best starting point for your crypto journey.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  locale: 'en-US',
  timezone: 'America/New_York',
  author: 'TheCryptoStart Team',
  email: 'contact@thecryptostart.com',
  social: {
    twitter: 'https://twitter.com/cryptoacademy',
    github: 'https://github.com/chesqueclaw/crypto-academy-blog',
    linkedin: 'https://linkedin.com/company/cryptoacademy',
  },
  adSense: {
    enabled: process.env.NODE_ENV === 'production',
    clientId: 'ca-pub-xxxxxxxxxxxxxxx', // Replace with actual client ID
  },
} as const

/**
 * Blog-specific configuration
 */
export const BLOG_CONFIG = {
  /** Number of posts per page in listings */
  postsPerPage: 10,
  /** Number of related posts to show */
  relatedPostsCount: 3,
  /** Number of featured posts on homepage */
  featuredPostsCount: 4, // "Start Here" 
  /** Number of recent posts in sidebar/homepage */
  recentPostsCount: 6,
  /** Maximum excerpt length in characters */
  excerptLength: 160,
  /** Average reading speed (words per minute) */
  readingSpeed: 200,
  /** Available categories with display info */
  categories: [
    { slug: 'crypto-basics' as BlogCategory, name: 'Fundamentals', icon: '📚' },
    { slug: 'bitcoin' as BlogCategory, name: 'Bitcoin', icon: '₿' },
    { slug: 'ethereum' as BlogCategory, name: 'Ethereum', icon: '🔹' },
    { slug: 'crypto-security' as BlogCategory, name: 'Security', icon: '🔒' },
    { slug: 'defi' as BlogCategory, name: 'DeFi', icon: '💰' },
    { slug: 'investing-and-strategy' as BlogCategory, name: 'Investing', icon: '📊' },
    { slug: 'web3-and-innovation' as BlogCategory, name: 'Web3 & Innovation', icon: '🌐' },
    { slug: 'crypto-opportunities' as BlogCategory, name: 'Opportunities', icon: '💎' },
  ] as const satisfies readonly CategoryConfig[],
} as const

/**
 * SEO configuration
 */
export const SEO_CONFIG = {
  /** Default OG image path */
  ogImage: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/og-image.png`,
  /** Twitter handle (with @) */
  twitterHandle: '@cryptoacademy',
  /** Twitter card type */
  twitterCard: 'summary_large_image' as const,
  /** Default image dimensions */
  defaultImage: {
    width: 1200,
    height: 630
  },
  /** Robots directives */
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  },
} as const

/**
 * Cache configuration (ISR)
 */
export const CACHE_CONFIG = {
  /** Revalidation time for posts in seconds (1 hour) */
  postsRevalidate: 3600,
  /** Revalidation time for static pages (10 minutes) */
  staticRevalidate: 600,
  /** Revalidation time for sitemap (1 hour) */
  sitemapRevalidate: 3600,
} as const

/**
 * AdSense slot configurations
 */
export const ADSENSE_SLOTS = {
  'blog-top': 'xxxxxxxxxxxx', // Replace with actual slot ID
  'blog-bottom': 'xxxxxxxxxxxx',
  'blog-sidebar': 'xxxxxxxxxxxx',
  'homepage-banner': 'xxxxxxxxxxxx',
} as const

/**
 * Helper to get category by slug
 */
export function getCategoryBySlug(slug: string): CategoryConfig | undefined {
  return BLOG_CONFIG.categories.find(cat => cat.slug === slug)
}

/**
 * Helper to get category name by slug
 */
export function getCategoryName(slug: string): string {
  return getCategoryBySlug(slug)?.name || slug
}
