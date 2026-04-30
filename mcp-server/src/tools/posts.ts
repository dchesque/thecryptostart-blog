import { z } from 'zod'
import type { Server } from '@modelcontextprotocol/sdk/server/index.js'
import type { ApiClient } from '../api-client.js'
import { registerTool, jsonText } from '../helpers.js'

export function registerPostTools(server: Server, api: ApiClient, writesEnabled: boolean) {
    registerTool(server, {
        name: 'posts.list',
        description: 'List PUBLISHED posts. Supports pagination, category and tag filters.',
        inputSchema: z.object({
            limit: z.number().int().min(1).max(100).default(10),
            page: z.number().int().min(1).default(1),
            category: z.string().optional(),
            tag: z.string().optional(),
        }),
        handler: async ({ limit, page, category, tag }) => {
            const params = new URLSearchParams({ limit: String(limit), page: String(page) })
            if (category) params.set('category', category)
            if (tag) params.append('tag', tag)
            return jsonText(await api.get(`/api/posts?${params}`))
        },
    })

    registerTool(server, {
        name: 'posts.get',
        description: 'Get a single PUBLISHED post by slug.',
        inputSchema: z.object({ slug: z.string().min(1) }),
        handler: async ({ slug }) => jsonText(await api.get(`/api/posts/${encodeURIComponent(slug)}`)),
    })

    registerTool(server, {
        name: 'posts.related',
        description: 'Related posts for a given slug.',
        inputSchema: z.object({
            slug: z.string().min(1),
            limit: z.number().int().min(1).max(12).default(3),
        }),
        handler: async ({ slug, limit }) =>
            jsonText(await api.get(`/api/posts/${encodeURIComponent(slug)}/related?limit=${limit}`)),
    })

    registerTool(server, {
        name: 'posts.featured',
        description: 'Featured published posts.',
        inputSchema: z.object({ limit: z.number().int().min(1).max(24).default(5) }),
        handler: async ({ limit }) => jsonText(await api.get(`/api/posts/featured?limit=${limit}`)),
    })

    registerTool(server, {
        name: 'posts.search',
        description: 'Search published posts by title/excerpt.',
        inputSchema: z.object({
            q: z.string().min(2),
            limit: z.number().int().min(1).max(50).default(10),
        }),
        handler: async ({ q, limit }) =>
            jsonText(await api.get(`/api/search?q=${encodeURIComponent(q)}&limit=${limit}`)),
    })

    registerTool(server, {
        name: 'posts.list_admin',
        description: 'Admin: list ALL posts (DRAFT + PUBLISHED). Requires admin auth.',
        inputSchema: z.object({
            page: z.number().int().min(1).default(1),
            limit: z.number().int().min(1).max(100).default(20),
            status: z.enum(['DRAFT', 'PUBLISHED', 'all']).optional(),
            search: z.string().optional(),
            category: z.string().optional(),
        }),
        handler: async (args) => {
            const params = new URLSearchParams({ page: String(args.page), limit: String(args.limit) })
            if (args.status) params.set('status', args.status)
            if (args.search) params.set('search', args.search)
            if (args.category) params.set('category', args.category)
            return jsonText(await api.get(`/api/admin/posts?${params}`))
        },
    })

    registerTool(server, {
        name: 'posts.get_admin',
        description: 'Admin: get a post by id (any status).',
        inputSchema: z.object({ id: z.string().min(1) }),
        handler: async ({ id }) => jsonText(await api.get(`/api/admin/posts/${id}`)),
    })

    if (!writesEnabled) return

    // ===== Write tools (only when MCP_WRITES_ENABLED=true) =====

    registerTool(server, {
        name: 'posts.create',
        description: 'Admin: create a new post (DRAFT by default). Requires MCP_WRITES_ENABLED=true.',
        inputSchema: z.object({
            title: z.string().min(1),
            slug: z.string().regex(/^[a-z0-9-]+$/),
            excerpt: z.string().min(1),
            content: z.string().min(1),
            authorId: z.string().min(1),
            categoryId: z.string().min(1),
            status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
            tags: z.array(z.string()).default([]),
            seoTitle: z.string().optional(),
            seoDescription: z.string().optional(),
            targetKeyword: z.string().optional(),
            secondaryKeywords: z.array(z.string()).default([]),
            isFeatured: z.boolean().default(false),
            contentType: z.enum(['ARTICLE', 'GUIDE', 'TUTORIAL', 'GLOSSARY', 'REVIEW', 'NEWS']).default('ARTICLE'),
            difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('BEGINNER'),
            schemaType: z.enum(['ARTICLE', 'HOW_TO', 'REVIEW', 'NEWS_ARTICLE']).default('ARTICLE'),
            adDensity: z.enum(['LOW', 'NORMAL', 'HIGH']).default('NORMAL'),
            featuredImageUrl: z.string().url().optional(),
            featuredImageAlt: z.string().optional(),
        }).passthrough(),
        handler: async (data) => jsonText(await api.post('/api/admin/posts', data)),
    })

    registerTool(server, {
        name: 'posts.update',
        description: 'Admin: replace a post by id with the provided fields. Requires MCP_WRITES_ENABLED=true.',
        inputSchema: z.object({ id: z.string().min(1) }).passthrough(),
        handler: async ({ id, ...data }: any) => jsonText(await api.put(`/api/admin/posts/${id}`, data)),
    })

    registerTool(server, {
        name: 'posts.publish',
        description: 'Admin: publish or unpublish a post. Requires MCP_WRITES_ENABLED=true.',
        inputSchema: z.object({ id: z.string().min(1), publish: z.boolean().default(true) }),
        handler: async ({ id, publish }) =>
            jsonText(await api.post(`/api/admin/posts/${id}/publish`, { publish })),
    })

    registerTool(server, {
        name: 'posts.delete',
        description:
            'Admin: HARD DELETE a post. Requires MCP_WRITES_ENABLED=true AND a confirm token equal to "DELETE <slug>" to prevent accidents.',
        inputSchema: z.object({
            id: z.string().min(1),
            slug: z.string().min(1),
            confirm: z.string().min(1),
        }),
        handler: async ({ id, slug, confirm }) => {
            const expected = `DELETE ${slug}`
            if (confirm !== expected) {
                throw new Error(`Refusing to delete: confirm must equal exactly "${expected}".`)
            }
            await api.delete(`/api/admin/posts/${id}`)
            return jsonText({ deleted: true, id, slug })
        },
    })
}
