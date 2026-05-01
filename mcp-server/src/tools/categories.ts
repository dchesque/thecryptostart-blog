import { z } from 'zod'
import type { Server } from '@modelcontextprotocol/sdk/server/index.js'
import type { ApiClient } from '../api-client.js'
import { registerTool, jsonText, requireDeleteConfirm } from '../helpers.js'

export function registerCategoryTools(server: Server, api: ApiClient, writesEnabled: boolean) {
    registerTool(server, {
        name: 'categories.list',
        description: 'List all categories with published-post counts.',
        inputSchema: z.object({}),
        handler: async () => jsonText(await api.get('/api/categories')),
    })

    registerTool(server, {
        name: 'categories.get',
        description: 'Get a category by slug, with paginated published posts.',
        inputSchema: z.object({
            slug: z.string().min(1),
            limit: z.number().int().min(1).max(100).default(10),
            skip: z.number().int().min(0).default(0),
        }),
        handler: async ({ slug, limit, skip }) =>
            jsonText(await api.get(`/api/categories/${encodeURIComponent(slug)}?limit=${limit}&skip=${skip}`)),
    })

    if (!writesEnabled) return

    registerTool(server, {
        name: 'categories.create',
        description: 'Admin: create a new category. Requires MCP_WRITES_ENABLED=true.',
        inputSchema: z.object({
            name: z.string().min(1),
            slug: z.string().regex(/^[a-z0-9-]+$/),
            description: z.string().optional(),
            icon: z.string().default('📚'),
            color: z.string().optional(),
            order: z.number().int().default(0),
        }),
        handler: async (data) => jsonText(await api.post('/api/admin/categories', data)),
    })

    registerTool(server, {
        name: 'categories.update',
        description: 'Admin: update a category by id. Requires MCP_WRITES_ENABLED=true.',
        inputSchema: z.object({ id: z.string().min(1) }).passthrough(),
        handler: async ({ id, ...data }: any) => jsonText(await api.put(`/api/admin/categories/${id}`, data)),
    })

    registerTool(server, {
        name: 'categories.delete',
        description: 'Admin: delete a category. Requires MCP_WRITES_ENABLED=true and confirm token "DELETE <slug>".',
        inputSchema: z.object({ id: z.string().min(1), slug: z.string().min(1), confirm: z.string().min(1) }),
        handler: async ({ id, slug, confirm }) => {
            requireDeleteConfirm(slug, confirm)
            await api.delete(`/api/admin/categories/${id}`)
            return jsonText({ deleted: true, id, slug })
        },
    })
}
