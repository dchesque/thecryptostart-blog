/**
 * SEO Utilities
 * TheCryptoStart - Educational Blog
 * 
 * Provides metadata generation and JSON-LD schema helpers
 */

import type { Metadata } from 'next'
import { SITE_CONFIG, SEO_CONFIG } from './constants'

interface MetadataInput {
  title: string
  description: string
  image?: string
  publishedAt?: string
  modifiedAt?: string
  keywords?: string[]
  noIndex?: boolean
}

/**
 * Generate page metadata for Next.js
 */
export function generateMetadata(input: MetadataInput): Metadata {
  const {
    title,
    description,
    image,
    publishedAt,
    modifiedAt,
    keywords,
    noIndex = false,
  } = input

  // Keyword-first title format for better SEO
  const fullTitle = `${title} | ${SITE_CONFIG.name}`
  const ogImage = image || SEO_CONFIG.ogImage

  // Ensure description is 155-160 chars with CTA
  const optimizedDescription = description.length > 160
    ? description.slice(0, 157) + '...'
    : description.length < 100
      ? `${description} Learn more at TheCryptoStart — your crypto education hub.`
      : description

  return {
    title: fullTitle,
    description: optimizedDescription,
    keywords: keywords?.join(', '),
    authors: [{ name: SITE_CONFIG.author }],
    creator: SITE_CONFIG.author,
    publisher: SITE_CONFIG.name,
    openGraph: {
      type: 'article',
      locale: 'en_US',
      url: SITE_CONFIG.url,
      title: fullTitle,
      description: optimizedDescription,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: ogImage,
          width: SEO_CONFIG.defaultImage.width,
          height: SEO_CONFIG.defaultImage.height,
          alt: title,
        },
      ],
      ...(publishedAt && { publishedTime: publishedAt }),
      ...(modifiedAt && { modifiedTime: modifiedAt }),
    },
    twitter: {
      card: SEO_CONFIG.twitterCard,
      title: fullTitle,
      description: optimizedDescription,
      images: [ogImage],
      creator: SEO_CONFIG.twitterHandle,
    },
    robots: noIndex ? {
      index: false,
      follow: false,
    } : SEO_CONFIG.robots,
    alternates: {
      canonical: SITE_CONFIG.url,
    },
  }
}

interface SchemaInput {
  title: string
  description: string
  url: string
  publishedAt: string
  modifiedAt?: string
  author: string
  image?: string
}

/**
 * Generate Article JSON-LD schema
 */
export function generateSchema(input: SchemaInput) {
  const { title, description, url, publishedAt, modifiedAt, author, image } = input

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image: image || SEO_CONFIG.ogImage,
    datePublished: publishedAt,
    dateModified: modifiedAt || publishedAt,
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_CONFIG.url}${url}`,
    },
  }
}

/**
 * Generate Website JSON-LD schema for homepage
 */
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_CONFIG.url}/blog?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/**
 * Generate Organization JSON-LD schema
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/logo.png`,
    sameAs: [
      SITE_CONFIG.social.twitter,
      SITE_CONFIG.social.github,
      SITE_CONFIG.social.linkedin,
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: SITE_CONFIG.email,
      contactType: 'customer service',
    },
  }
}

/**
 * Generate BreadcrumbList JSON-LD schema
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_CONFIG.url}${item.url}`,
    })),
  }
}

interface FAQItem {
  question: string
  answer: string
}

/**
 * Generate FAQPage JSON-LD schema
 */
export function generateFAQSchema(items: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}
