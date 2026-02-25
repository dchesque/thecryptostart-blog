import { prisma } from '@/lib/prisma'
import { BlogPost, PaginationOptions, TagOptions, SearchOptions, CategoryConfig } from '@/types/blog'
import { Post, Author, Category } from '@prisma/client'

/**
 * Funções auxiliares para cálculos e tratamento
 */
export function calculateWordCount(markdown: string): number {
    if (!markdown) return 0
    // Remove markdown syntax roughly
    const text = markdown.replace(/[#*_~\[\]()>]/g, '')
    const words = text.match(/\b[-?a-zA-Z0-9_'"]+\b/g)
    return words ? words.length : 0
}

export function calculateReadingTime(wordCount: number): number {
    return Math.max(1, Math.ceil(wordCount / 200))
}

export function generateSlugFromTitle(title: string): string {
    return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/[\s-]+/g, '-')
}

/**
 * Transforma o post Prisma no tipo BlogPost do Blog antigo.
 */
export function transformPrismaPost(
    post: (Post & { author: Author; category: Category })
): BlogPost {
    return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        description: post.excerpt,
        content: post.content,
        featuredImage: post.featuredImageUrl ? {
            url: post.featuredImageUrl,
            title: post.featuredImageAlt || post.title,
            width: post.featuredImageWidth || 1200,
            height: post.featuredImageHeight || 630,
        } : undefined,
        author: {
            name: post.author.name,
            slug: post.author.slug,
            bio: post.author.bio || undefined,
            image: post.author.avatar || undefined,
            twitter: post.author.socialLinks
                ? (post.author.socialLinks as { twitter?: string }).twitter
                : undefined,
        },
        category: post.category.slug as any,
        tags: post.tags,
        publishedAt: post.publishDate ? post.publishDate.toISOString() : post.createdAt.toISOString(),
        updatedAt: post.updatedDate ? post.updatedDate.toISOString() : post.updatedAt.toISOString(),
        readingTime: post.readingTime,
        wordCount: post.wordCount,
        isFeatured: post.isFeatured,
        contentType: post.contentType,
        difficulty: post.difficulty,
        seoTitle: post.seoTitle || undefined,
        seoDescription: post.seoDescription || undefined,
        seoImageUrl: post.seoImageUrl || undefined,
        seoNoindex: post.seoNoindex,
        targetKeyword: post.targetKeyword || undefined,
        secondaryKeywords: post.secondaryKeywords,
        schemaType: post.schemaType,
        canonicalUrl: post.canonicalUrl || undefined,
        lastReviewedAt: post.lastReviewedAt ? post.lastReviewedAt.toISOString() : undefined,
        faq: post.faq,
        howToSteps: post.howToSteps,
        pros: post.pros,
        cons: post.cons,
        relatedPostsSlugs: post.relatedPostsSlugs,
        pillarPageSlug: post.pillarPageSlug || undefined,
        internalLinks: post.internalLinks,
        adDensity: post.adDensity,
        monetizationDisabled: post.monetizationDisabled,
        sponsoredBy: post.sponsoredBy || undefined,
    }
}

/**
 * API Data Layer
 */
export async function getAllPosts(
    options?: PaginationOptions & TagOptions
): Promise<BlogPost[]> {
    const limit = options?.limit || 10
    const skip = options?.skip || 0

    const where: any = {
        status: 'PUBLISHED',
        publishDate: {
            lte: new Date(),
        },
    }

    if (options?.category) {
        where.category = {
            slug: options.category
        }
    }

    if (options?.tags && options.tags.length > 0) {
        where.tags = {
            hasSome: options.tags
        }
    }

    const posts = await prisma.post.findMany({
        where,
        include: {
            author: true,
            category: true,
        },
        orderBy: [
            { publishDate: 'desc' },
            { createdAt: 'desc' },
        ],
        take: limit,
        skip: skip,
    })

    return posts.map(transformPrismaPost)
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
    const post = await prisma.post.findUnique({
        where: { slug },
        include: {
            author: true,
            category: true,
        },
    })

    if (!post) return null
    return transformPrismaPost(post)
}

export async function getPostsByCategory(
    categorySlug: string,
    options?: PaginationOptions & TagOptions
): Promise<BlogPost[]> {
    return getAllPosts({ ...options, category: categorySlug as any })
}

export async function getRelatedPosts(
    currentSlug: string,
    categorySlug: string,
    limit: number = 3
): Promise<BlogPost[]> {
    const currentPost = await prisma.post.findUnique({
        where: { slug: currentSlug },
        select: { relatedPostsSlugs: true }
    })

    // Priority to manually mapped related posts
    if (currentPost && currentPost.relatedPostsSlugs.length > 0) {
        const manualPosts = await prisma.post.findMany({
            where: {
                slug: { in: currentPost.relatedPostsSlugs },
                status: 'PUBLISHED',
            },
            include: {
                author: true,
                category: true,
            },
            take: limit,
        })

        if (manualPosts.length > 0) {
            return manualPosts.map(transformPrismaPost)
        }
    }

    // Fallback to latest in same category
    const fallbackPosts = await prisma.post.findMany({
        where: {
            category: { slug: categorySlug },
            slug: { not: currentSlug },
            status: 'PUBLISHED',
        },
        include: {
            author: true,
            category: true,
        },
        orderBy: { publishDate: 'desc' },
        take: limit,
    })

    return fallbackPosts.map(transformPrismaPost)
}

export async function searchPosts(
    query: string,
    options?: SearchOptions
): Promise<BlogPost[]> {
    const limit = options?.limit || 10
    const searchTerms = query.split(' ').filter(word => word.length > 2).join(' | ')

    let posts: any[] = []

    if (searchTerms.length > 0) {
        // Prisma Full text search is experimental or DB specific. 
        // Using a simpler fallback with contains
        posts = await prisma.post.findMany({
            where: {
                status: 'PUBLISHED',
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { excerpt: { contains: query, mode: 'insensitive' } }
                ]
            },
            include: {
                author: true,
                category: true,
            },
            take: limit,
        })
    }

    return posts.map(transformPrismaPost)
}

export async function getAllPostSlugs(): Promise<string[]> {
    const posts = await prisma.post.findMany({
        where: {
            status: 'PUBLISHED',
        },
        select: {
            slug: true,
        },
    })
    return posts.map((p: any) => p.slug)
}

export async function getAllCategories(): Promise<CategoryConfig[]> {
    const categories = await prisma.category.findMany({
        orderBy: [
            { order: 'asc' },
            { name: 'asc' }
        ]
    })

    return categories.map((cat: any) => ({
        slug: cat.slug as any,
        name: cat.name,
        description: cat.description || '',
        icon: cat.icon,
        color: cat.color || undefined,
    }))
}

export async function getTotalPostsCount(categorySlug?: string): Promise<number> {
    const where: any = {
        status: 'PUBLISHED',
        publishDate: {
            lte: new Date(),
        },
    }

    if (categorySlug) {
        where.category = {
            slug: categorySlug
        }
    }

    return await prisma.post.count({ where })
}

export async function getFeaturedPosts(limit: number = 3): Promise<BlogPost[]> {
    const posts = await prisma.post.findMany({
        where: {
            isFeatured: true,
            status: 'PUBLISHED',
            publishDate: { lte: new Date() }
        },
        include: {
            author: true,
            category: true,
        },
        orderBy: { publishDate: 'desc' },
        take: limit,
    })

    return posts.map(transformPrismaPost)
}

export async function getPostsByPillar(pillarSlug: string): Promise<BlogPost[]> {
    const posts = await prisma.post.findMany({
        where: {
            pillarPageSlug: pillarSlug,
            status: 'PUBLISHED',
        },
        include: {
            author: true,
            category: true,
        },
        orderBy: { publishDate: 'desc' },
    })
    return posts.map(transformPrismaPost)
}
