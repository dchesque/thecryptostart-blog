export interface SiteConfig {
  name: string
  description: string
  url: string
  author: string
  email: string
}

export interface SEOProps {
  title?: string
  description?: string
  image?: string
  keywords?: string[]
  author?: string
  publishedAt?: string
  modifiedAt?: string
  url?: string
}
