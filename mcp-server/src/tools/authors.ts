import { z } from 'zod'
import type { Server } from '@modelcontextprotocol/sdk/server/index.js'
import type { ApiClient } from '../api-client.js'
import { registerTool, jsonText } from '../helpers.js'

export function registerAuthorTools(server: Server, api: ApiClient, writesEnabled: boolean) {
    registerTool(server, {
        name: 'authors.list',
        description: 'List authors that have at least one published post.',
        inputSchema: z.object({}),
        handler: async () => jsonText(await api.get('/api/authors')),
    })

    registerTool(server, {
        name: 'authors.get',
        description: 'Get an author by slug, with paginated published posts.',
        inputSchema: z.object({
            slug: z.string().min(1),
            limit: z.number().int().min(1).max(100).default(10),
            skip: z.number().int().min(0).default(0),
        }),
        handler: async ({ slug, limit, skip }) =>
            jsonText(await api.get(`/api/authors/${encodeURIComponent(slug)}?limit=${limit}&skip=${skip}`)),
    })

    if (!writesEnabled) return

    registerTool(server, {
        name: 'authors.create',
        description: 'Admin: create author. Requires MCP_WRITES_ENABLED=true.',
        inputSchema: z.object({
            name: z.string().min(1),
            slug: z.string().regex(/^[a-z0-9-]+$/),
            bio: z.string().optional(),
            avatar: z.string().url().optional(),
            socialLinks: z.any().optional(),
        }),
        handler: async (data) => jsonText(await api.post('/api/admin/authors', data)),
    })

    registerTool(server, {
        name: 'authors.update',
        description: 'Admin: update author. Requires MCP_WRITES_ENABLED=true.',
        inputSchema: z.object({ id: z.string().min(1) }).passthrough(),
        handler: async ({ id, ...data }: any) => jsonText(await api.put(`/api/admin/authors/${id}`, data)),
    })

    registerTool(server, {
        name: 'authors.delete',
        description: 'Admin: delete author. Requires MCP_WRITES_ENABLED=true and confirm token "DELETE <slug>".',
        inputSchema: z.object({ id: z.string().min(1), slug: z.string().min(1), confirm: z.string().min(1) }),
        handler: async ({ id, slug, confirm }) => {
            const expected = `DELETE ${slug}`
            if (confirm !== expected) throw new Error(`confirm must equal "${expected}"`)
            await api.delete(`/api/admin/authors/${id}`)
            return jsonText({ deleted: true, id, slug })
        },
    })
}
