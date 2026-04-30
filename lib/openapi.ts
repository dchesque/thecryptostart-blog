/**
 * OpenAPI 3.1 spec gerada a partir dos schemas Zod existentes.
 * Servida em /api/openapi.json (raw) e /api/docs (Swagger UI HTML).
 */
import { OpenAPIRegistry, OpenApiGeneratorV31, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { categorySchema, authorSchema, postSchema } from './validations/admin'

extendZodWithOpenApi(z)

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://thecryptostart.example.com'

// Reusable schemas
const PaginationSchema = z.object({
    total: z.number().int(),
    pages: z.number().int(),
    currentPage: z.number().int().optional(),
    limit: z.number().int().optional(),
}).openapi('Pagination')

const ErrorSchema = z.object({
    error: z.string(),
    message: z.string().optional(),
}).openapi('Error')

const BlogPostSchema = z.object({
    id: z.string(),
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    content: z.string(),
    publishedAt: z.string(),
    updatedAt: z.string(),
    readingTime: z.number().int(),
    wordCount: z.number().int().optional(),
    isFeatured: z.boolean().optional(),
    contentType: z.string().optional(),
    difficulty: z.string().optional(),
    tags: z.array(z.string()),
    category: z.string(),
    author: z.object({
        name: z.string(),
        slug: z.string().optional(),
        bio: z.string().optional(),
        image: z.string().optional(),
        twitter: z.string().optional(),
        linkedin: z.string().optional(),
    }),
    featuredImage: z.object({
        url: z.string(),
        title: z.string(),
        width: z.number().int(),
        height: z.number().int(),
    }).optional(),
}).openapi('BlogPost')

const CategorySchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable(),
    icon: z.string(),
    color: z.string().nullable(),
    order: z.number().int(),
    postCount: z.number().int().optional(),
}).openapi('Category')

const AuthorSchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    bio: z.string().nullable(),
    avatar: z.string().nullable(),
    socialLinks: z.any().nullable(),
    postCount: z.number().int().optional(),
}).openapi('Author')

const SubscriberSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    status: z.enum(['PENDING', 'CONFIRMED', 'UNSUBSCRIBED']),
    source: z.string().nullable(),
    confirmedAt: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
}).openapi('NewsletterSubscriber')

// Flat reply schema (one level deep) — OpenAPI doesn't model recursion
// cleanly, and the public /api/comments handler also only returns 1 level.
const CommentReplySchema = z.object({
    id: z.string(),
    authorName: z.string(),
    content: z.string(),
    createdAt: z.string(),
}).openapi('CommentReply')

const CommentSchema = z.object({
    id: z.string(),
    authorName: z.string(),
    content: z.string(),
    createdAt: z.string(),
    replies: z.array(CommentReplySchema).optional(),
}).openapi('Comment')

export function buildOpenApiSpec() {
    const registry = new OpenAPIRegistry()

    // Security scheme
    registry.registerComponent('securitySchemes', 'AdminApiKey', {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'Admin API key for write/admin endpoints. Configurable via ADMIN_API_KEY env.',
    })

    registry.registerComponent('securitySchemes', 'Session', {
        type: 'apiKey',
        in: 'cookie',
        name: 'next-auth.session-token',
        description: 'NextAuth session cookie. Equivalent to AdminApiKey for admin endpoints.',
    })

    // ============================
    // PUBLIC — Posts
    // ============================
    registry.registerPath({
        method: 'get',
        path: '/api/posts',
        summary: 'List published posts',
        tags: ['Posts (public)'],
        request: {
            query: z.object({
                limit: z.coerce.number().int().min(1).max(100).optional().default(10),
                page: z.coerce.number().int().min(1).optional().default(1),
                skip: z.coerce.number().int().min(0).optional(),
                category: z.string().optional(),
                tag: z.array(z.string()).optional(),
            }),
        },
        responses: {
            200: {
                description: 'Paginated list of published posts',
                content: { 'application/json': { schema: z.object({ posts: z.array(BlogPostSchema), pagination: PaginationSchema }) } },
            },
        },
    })

    registry.registerPath({
        method: 'get',
        path: '/api/posts/{slug}',
        summary: 'Get a published post by slug',
        tags: ['Posts (public)'],
        request: { params: z.object({ slug: z.string() }) },
        responses: {
            200: { description: 'Post', content: { 'application/json': { schema: BlogPostSchema } } },
            404: { description: 'Not found', content: { 'application/json': { schema: ErrorSchema } } },
        },
    })

    registry.registerPath({
        method: 'get',
        path: '/api/posts/{slug}/related',
        summary: 'Related posts',
        tags: ['Posts (public)'],
        request: {
            params: z.object({ slug: z.string() }),
            query: z.object({ limit: z.coerce.number().int().min(1).max(12).optional().default(3) }),
        },
        responses: {
            200: { description: 'Related posts', content: { 'application/json': { schema: z.object({ posts: z.array(BlogPostSchema) }) } } },
            404: { description: 'Not found', content: { 'application/json': { schema: ErrorSchema } } },
        },
    })

    registry.registerPath({
        method: 'get',
        path: '/api/posts/featured',
        summary: 'Featured posts',
        tags: ['Posts (public)'],
        request: { query: z.object({ limit: z.coerce.number().int().min(1).max(24).optional().default(3) }) },
        responses: {
            200: { description: 'Featured posts', content: { 'application/json': { schema: z.object({ posts: z.array(BlogPostSchema) }) } } },
        },
    })

    // ============================
    // PUBLIC — Categories / Authors / Search / Tags / Stats
    // ============================
    registry.registerPath({
        method: 'get',
        path: '/api/categories',
        summary: 'List categories',
        tags: ['Taxonomy (public)'],
        responses: { 200: { description: 'Categories', content: { 'application/json': { schema: z.object({ categories: z.array(CategorySchema) }) } } } },
    })

    registry.registerPath({
        method: 'get',
        path: '/api/categories/{slug}',
        summary: 'Get category with paginated posts',
        tags: ['Taxonomy (public)'],
        request: {
            params: z.object({ slug: z.string() }),
            query: z.object({
                limit: z.coerce.number().int().min(1).max(100).optional().default(10),
                skip: z.coerce.number().int().min(0).optional().default(0),
            }),
        },
        responses: {
            200: { description: 'Category + posts', content: { 'application/json': { schema: z.object({ category: CategorySchema, posts: z.array(BlogPostSchema), pagination: PaginationSchema }) } } },
            404: { description: 'Not found', content: { 'application/json': { schema: ErrorSchema } } },
        },
    })

    registry.registerPath({
        method: 'get',
        path: '/api/authors',
        summary: 'List authors with at least one published post',
        tags: ['Taxonomy (public)'],
        responses: { 200: { description: 'Authors', content: { 'application/json': { schema: z.object({ authors: z.array(AuthorSchema) }) } } } },
    })

    registry.registerPath({
        method: 'get',
        path: '/api/authors/{slug}',
        summary: 'Author with paginated posts',
        tags: ['Taxonomy (public)'],
        request: {
            params: z.object({ slug: z.string() }),
            query: z.object({
                limit: z.coerce.number().int().min(1).max(100).optional().default(10),
                skip: z.coerce.number().int().min(0).optional().default(0),
            }),
        },
        responses: {
            200: { description: 'Author + posts', content: { 'application/json': { schema: z.object({ author: AuthorSchema, posts: z.array(BlogPostSchema), pagination: PaginationSchema }) } } },
            404: { description: 'Not found', content: { 'application/json': { schema: ErrorSchema } } },
        },
    })

    registry.registerPath({
        method: 'get',
        path: '/api/search',
        summary: 'Full-text-ish search',
        tags: ['Search (public)'],
        request: {
            query: z.object({
                q: z.string().min(2),
                limit: z.coerce.number().int().min(1).max(50).optional().default(10),
            }),
        },
        responses: {
            200: { description: 'Results', content: { 'application/json': { schema: z.object({ query: z.string(), results: z.array(BlogPostSchema), count: z.number().int() }) } } },
            400: { description: 'Invalid query', content: { 'application/json': { schema: ErrorSchema } } },
        },
    })

    registry.registerPath({
        method: 'get',
        path: '/api/tags',
        summary: 'Tags + counts across published posts',
        tags: ['Taxonomy (public)'],
        responses: { 200: { description: 'Tags', content: { 'application/json': { schema: z.object({ tags: z.array(z.object({ name: z.string(), count: z.number().int() })) }) } } } },
    })

    registry.registerPath({
        method: 'get',
        path: '/api/stats',
        summary: 'Aggregate counts',
        tags: ['Public'],
        responses: { 200: { description: 'Stats', content: { 'application/json': { schema: z.object({ publishedPosts: z.number().int(), draftPosts: z.number().int(), categories: z.number().int(), authors: z.number().int(), approvedComments: z.number().int(), generatedAt: z.string() }) } } } },
    })

    registry.registerPath({
        method: 'get',
        path: '/api/health',
        summary: 'Health check',
        tags: ['Public'],
        responses: { 200: { description: 'Health', content: { 'application/json': { schema: z.object({ status: z.string(), timestamp: z.string(), database: z.string() }) } } } },
    })

    // ============================
    // PUBLIC — Comments
    // ============================
    registry.registerPath({
        method: 'get',
        path: '/api/comments',
        summary: 'Approved comments for a post',
        tags: ['Comments (public)'],
        request: { query: z.object({ postSlug: z.string() }) },
        responses: { 200: { description: 'Comments', content: { 'application/json': { schema: z.array(CommentSchema) } } } },
    })

    registry.registerPath({
        method: 'post',
        path: '/api/comments',
        summary: 'Submit a comment (spam-guarded, honeypot, IP+email rate-limit)',
        tags: ['Comments (public)'],
        request: {
            body: { content: { 'application/json': { schema: z.object({ postSlug: z.string(), authorName: z.string(), authorEmail: z.string().email(), content: z.string().min(5).max(2000), parentId: z.string().optional(), website: z.string().optional() }) } } },
        },
        responses: {
            201: { description: 'Submitted', content: { 'application/json': { schema: z.object({ message: z.string(), commentId: z.string(), status: z.string() }) } } },
            400: { description: 'Invalid input', content: { 'application/json': { schema: ErrorSchema } } },
            429: { description: 'Rate limited', content: { 'application/json': { schema: ErrorSchema } } },
        },
    })

    // ============================
    // PUBLIC — Newsletter
    // ============================
    registry.registerPath({
        method: 'post',
        path: '/api/newsletter/subscribe',
        summary: 'Start subscription (double opt-in)',
        tags: ['Newsletter (public)'],
        request: {
            body: { content: { 'application/json': { schema: z.object({ email: z.string().email(), source: z.string().optional(), website: z.string().optional() }) } } },
        },
        responses: {
            201: { description: 'Subscription created', content: { 'application/json': { schema: z.object({ message: z.string(), success: z.boolean() }) } } },
            400: { description: 'Invalid email', content: { 'application/json': { schema: ErrorSchema } } },
            429: { description: 'Rate limited', content: { 'application/json': { schema: ErrorSchema } } },
        },
    })

    registry.registerPath({
        method: 'get',
        path: '/api/newsletter/confirm',
        summary: 'Confirm subscription',
        tags: ['Newsletter (public)'],
        request: { query: z.object({ token: z.string().min(16) }) },
        responses: {
            200: { description: 'Confirmed', content: { 'application/json': { schema: z.object({ message: z.string(), success: z.boolean() }) } } },
            400: { description: 'Invalid token', content: { 'application/json': { schema: ErrorSchema } } },
        },
    })

    registry.registerPath({
        method: 'post',
        path: '/api/newsletter/unsubscribe',
        summary: 'Unsubscribe',
        tags: ['Newsletter (public)'],
        request: { body: { content: { 'application/json': { schema: z.object({ email: z.string().email() }) } } } },
        responses: { 200: { description: 'Unsubscribed', content: { 'application/json': { schema: z.object({ message: z.string(), success: z.boolean() }) } } } },
    })

    // ============================
    // AUTH
    // ============================
    registry.registerPath({
        method: 'post',
        path: '/api/auth/register',
        summary: 'Register a new user',
        tags: ['Auth'],
        request: { body: { content: { 'application/json': { schema: z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(6) }) } } } },
        responses: {
            201: { description: 'Created', content: { 'application/json': { schema: z.object({ message: z.string(), userId: z.string() }) } } },
            400: { description: 'Validation error or user exists', content: { 'application/json': { schema: ErrorSchema } } },
        },
    })

    registry.registerPath({
        method: 'post',
        path: '/api/auth/password-reset/request',
        summary: 'Request password reset email',
        tags: ['Auth'],
        request: { body: { content: { 'application/json': { schema: z.object({ email: z.string().email() }) } } } },
        responses: { 200: { description: 'Generic success (constant-time)', content: { 'application/json': { schema: z.object({ message: z.string(), success: z.boolean() }) } } } },
    })

    registry.registerPath({
        method: 'post',
        path: '/api/auth/password-reset/confirm',
        summary: 'Set new password using token',
        tags: ['Auth'],
        request: { body: { content: { 'application/json': { schema: z.object({ token: z.string().min(32), password: z.string().min(8) }) } } } },
        responses: {
            200: { description: 'Updated', content: { 'application/json': { schema: z.object({ message: z.string(), success: z.boolean() }) } } },
            400: { description: 'Invalid token', content: { 'application/json': { schema: ErrorSchema } } },
        },
    })

    // ============================
    // ADMIN — Posts
    // ============================
    const adminPaths: Array<{ method: 'get' | 'post' | 'put' | 'delete' | 'patch'; path: string; summary: string; body?: any; params?: any; query?: any; tag: string; resp200?: any; resp201?: any }> = [
        { method: 'get', path: '/api/admin/posts', summary: 'List all posts (any status)', tag: 'Admin: Posts', query: z.object({ page: z.coerce.number().int().optional(), limit: z.coerce.number().int().optional(), status: z.string().optional(), search: z.string().optional(), category: z.string().optional() }), resp200: z.object({ posts: z.array(z.any()), pagination: PaginationSchema }) },
        { method: 'post', path: '/api/admin/posts', summary: 'Create a post', tag: 'Admin: Posts', body: postSchema, resp201: z.any() },
        { method: 'get', path: '/api/admin/posts/{id}', summary: 'Get post by id', tag: 'Admin: Posts', params: z.object({ id: z.string() }), resp200: z.any() },
        { method: 'put', path: '/api/admin/posts/{id}', summary: 'Update post', tag: 'Admin: Posts', params: z.object({ id: z.string() }), body: postSchema, resp200: z.any() },
        { method: 'delete', path: '/api/admin/posts/{id}', summary: 'Delete post', tag: 'Admin: Posts', params: z.object({ id: z.string() }) },
        { method: 'post', path: '/api/admin/posts/{id}/publish', summary: 'Publish or unpublish', tag: 'Admin: Posts', params: z.object({ id: z.string() }), body: z.object({ publish: z.boolean() }), resp200: z.object({ id: z.string(), status: z.string(), publishDate: z.string().nullable(), slug: z.string() }) },

        { method: 'get', path: '/api/admin/categories', summary: 'List categories', tag: 'Admin: Categories', query: z.object({ page: z.coerce.number().int().optional(), limit: z.coerce.number().int().optional() }), resp200: z.object({ categories: z.array(z.any()), pagination: PaginationSchema }) },
        { method: 'post', path: '/api/admin/categories', summary: 'Create category', tag: 'Admin: Categories', body: categorySchema, resp201: z.any() },
        { method: 'get', path: '/api/admin/categories/{id}', summary: 'Get category', tag: 'Admin: Categories', params: z.object({ id: z.string() }), resp200: z.any() },
        { method: 'put', path: '/api/admin/categories/{id}', summary: 'Update category', tag: 'Admin: Categories', params: z.object({ id: z.string() }), body: categorySchema, resp200: z.any() },
        { method: 'delete', path: '/api/admin/categories/{id}', summary: 'Delete category', tag: 'Admin: Categories', params: z.object({ id: z.string() }) },

        { method: 'get', path: '/api/admin/authors', summary: 'List authors', tag: 'Admin: Authors', query: z.object({ page: z.coerce.number().int().optional(), limit: z.coerce.number().int().optional() }), resp200: z.object({ authors: z.array(z.any()), pagination: PaginationSchema }) },
        { method: 'post', path: '/api/admin/authors', summary: 'Create author', tag: 'Admin: Authors', body: authorSchema, resp201: z.any() },
        { method: 'get', path: '/api/admin/authors/{id}', summary: 'Get author', tag: 'Admin: Authors', params: z.object({ id: z.string() }), resp200: z.any() },
        { method: 'put', path: '/api/admin/authors/{id}', summary: 'Update author', tag: 'Admin: Authors', params: z.object({ id: z.string() }), body: authorSchema, resp200: z.any() },
        { method: 'delete', path: '/api/admin/authors/{id}', summary: 'Delete author', tag: 'Admin: Authors', params: z.object({ id: z.string() }) },

        { method: 'get', path: '/api/admin/comments', summary: 'List comments', tag: 'Admin: Comments', query: z.object({ status: z.string().optional(), page: z.coerce.number().int().optional() }), resp200: z.object({ comments: z.array(z.any()), pagination: PaginationSchema }) },
        { method: 'patch', path: '/api/admin/comments/{id}', summary: 'Update status (APPROVED/REJECTED/SPAM)', tag: 'Admin: Comments', params: z.object({ id: z.string() }), body: z.object({ status: z.enum(['APPROVED', 'REJECTED', 'SPAM']) }), resp200: z.any() },
        { method: 'delete', path: '/api/admin/comments/{id}', summary: 'Delete comment + replies', tag: 'Admin: Comments', params: z.object({ id: z.string() }) },

        { method: 'get', path: '/api/admin/newsletter/subscribers', summary: 'List subscribers', tag: 'Admin: Newsletter', query: z.object({ status: z.string().optional(), page: z.coerce.number().int().optional(), limit: z.coerce.number().int().optional() }), resp200: z.object({ subscribers: z.array(SubscriberSchema), pagination: PaginationSchema }) },
        { method: 'delete', path: '/api/admin/newsletter/subscribers', summary: 'Hard delete subscriber by email', tag: 'Admin: Newsletter', query: z.object({ email: z.string().email() }) },

        { method: 'post', path: '/api/admin/revalidate', summary: 'Revalidate ISR (paths/tags/slug)', tag: 'Admin: Ops', body: z.object({ paths: z.array(z.string()).optional(), tags: z.array(z.string()).optional(), slug: z.string().optional() }), resp200: z.object({ success: z.boolean(), revalidated: z.object({ paths: z.array(z.string()), tags: z.array(z.string()) }), at: z.string() }) },

        { method: 'get', path: '/api/admin/diagnostics', summary: 'DB + env diagnostics', tag: 'Admin: Ops', resp200: z.any() },
        { method: 'get', path: '/api/admin/logs', summary: 'Recent SystemLog entries', tag: 'Admin: Ops', query: z.object({ limit: z.coerce.number().int().optional(), level: z.string().optional() }), resp200: z.array(z.any()) },

        { method: 'get', path: '/api/seo/metrics', summary: 'SEO metrics (cached 5min)', tag: 'Admin: SEO', resp200: z.any() },
        { method: 'get', path: '/api/ai-optimization/scores', summary: 'AI optimization scores', tag: 'Admin: SEO', resp200: z.array(z.any()) },
        { method: 'get', path: '/api/gsc/analytics', summary: 'Google Search Console analytics', tag: 'Admin: SEO', resp200: z.any() },
        { method: 'get', path: '/api/gsc/health', summary: 'GSC credentials health', tag: 'Admin: SEO', resp200: z.any() },

        { method: 'get', path: '/api/users', summary: 'List users', tag: 'Admin: Users', resp200: z.array(z.any()) },
        { method: 'post', path: '/api/users', summary: 'Create user', tag: 'Admin: Users', body: z.object({ name: z.string(), email: z.string().email(), password: z.string().min(6), roles: z.array(z.string()), bio: z.string().optional(), image: z.string().optional() }), resp201: z.any() },
        { method: 'patch', path: '/api/users/{id}', summary: 'Update user', tag: 'Admin: Users', params: z.object({ id: z.string() }), body: z.object({}).passthrough(), resp200: z.any() },
        { method: 'delete', path: '/api/users/{id}', summary: 'Delete user', tag: 'Admin: Users', params: z.object({ id: z.string() }) },
    ]

    for (const p of adminPaths) {
        const responses: any = {
            401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorSchema } } },
            403: { description: 'Forbidden', content: { 'application/json': { schema: ErrorSchema } } },
        }
        if (p.resp200) responses[200] = { description: 'OK', content: { 'application/json': { schema: p.resp200 } } }
        if (p.resp201) responses[201] = { description: 'Created', content: { 'application/json': { schema: p.resp201 } } }
        if (p.method === 'delete') responses[204] = { description: 'No content' }

        registry.registerPath({
            method: p.method,
            path: p.path,
            summary: p.summary,
            tags: [p.tag],
            security: [{ AdminApiKey: [] }, { Session: [] }],
            request: {
                ...(p.params ? { params: p.params } : {}),
                ...(p.query ? { query: p.query } : {}),
                ...(p.body ? { body: { content: { 'application/json': { schema: p.body } } } } : {}),
            },
            responses,
        })
    }

    const generator = new OpenApiGeneratorV31(registry.definitions)

    return generator.generateDocument({
        openapi: '3.1.0',
        info: {
            title: 'The Crypto Start API',
            version: '1.0.0',
            description: 'Public + admin API for thecryptostart.com. Admin endpoints require either a NextAuth session or an `X-API-Key` header (`ADMIN_API_KEY` env).',
        },
        servers: [{ url: SITE_URL, description: 'Default server' }],
    })
}
