export interface Post {
  sys: {
    id: string
    createdAt: string
    updatedAt: string
    publishedAt?: string
  }
  fields: {
    title: string
    slug: string
    description: string
    content: any // Rich Text document
    featuredImage?: {
      fields: {
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
    author: string
    category: string
    tags: string[]
    readingTime: number
  }
}

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
