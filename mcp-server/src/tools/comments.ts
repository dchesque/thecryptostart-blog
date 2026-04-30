import { z } from 'zod'
import type { Server } from '@modelcontextprotocol/sdk/server/index.js'
import type { ApiClient } from '../api-client.js'
import { registerTool, jsonText } from '../helpers.js'

export function registerCommentTools(server: Server, api: ApiClient, writesEnabled: boolean) {
    registerTool(server, {
        name: 'comments.list',
        description: 'Admin: list comments by status (PENDING/APPROVED/REJECTED/SPAM/all).',
        inputSchema: z.object({
            status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SPAM', 'all']).default('PENDING'),
            page: z.number().int().min(1).default(1),
        }),
        handler: async ({ status, page }) =>
            jsonText(await api.get(`/api/admin/comments?status=${status}&page=${page}`)),
    })

    registerTool(server, {
        name: 'comments.list_public',
        description: 'Public: approved comments for a given post slug.',
        inputSchema: z.object({ postSlug: z.string().min(1) }),
        handler: async ({ postSlug }) =>
            jsonText(await api.get(`/api/comments?postSlug=${encodeURIComponent(postSlug)}`)),
    })

    if (!writesEnabled) return

    registerTool(server, {
        name: 'comments.moderate',
        description:
            'Admin: change a comment status (APPROVED/REJECTED/SPAM). Requires MCP_WRITES_ENABLED=true.',
        inputSchema: z.object({
            id: z.string().min(1),
            status: z.enum(['APPROVED', 'REJECTED', 'SPAM']),
        }),
        handler: async ({ id, status }) =>
            jsonText(await api.patch(`/api/admin/comments/${id}`, { status })),
    })

    registerTool(server, {
        name: 'comments.delete',
        description:
            'Admin: hard-delete a comment and its replies. Requires MCP_WRITES_ENABLED=true.',
        inputSchema: z.object({ id: z.string().min(1) }),
        handler: async ({ id }) => {
            await api.delete(`/api/admin/comments/${id}`)
            return jsonText({ deleted: true, id })
        },
    })
}
