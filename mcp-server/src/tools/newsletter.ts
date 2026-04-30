import { z } from 'zod'
import type { Server } from '@modelcontextprotocol/sdk/server/index.js'
import type { ApiClient } from '../api-client.js'
import { registerTool, jsonText } from '../helpers.js'

export function registerNewsletterTools(server: Server, api: ApiClient, writesEnabled: boolean) {
    registerTool(server, {
        name: 'newsletter.subscribers',
        description: 'Admin: list subscribers (paginated, optional status filter).',
        inputSchema: z.object({
            status: z.enum(['PENDING', 'CONFIRMED', 'UNSUBSCRIBED', 'all']).optional(),
            page: z.number().int().min(1).default(1),
            limit: z.number().int().min(1).max(200).default(50),
        }),
        handler: async ({ status, page, limit }) => {
            const params = new URLSearchParams({ page: String(page), limit: String(limit) })
            if (status) params.set('status', status)
            return jsonText(await api.get(`/api/admin/newsletter/subscribers?${params}`))
        },
    })

    if (!writesEnabled) return

    registerTool(server, {
        name: 'newsletter.delete_subscriber',
        description: 'Admin: hard-delete a subscriber by email. Requires MCP_WRITES_ENABLED=true.',
        inputSchema: z.object({ email: z.string().email() }),
        handler: async ({ email }) => {
            await api.delete(`/api/admin/newsletter/subscribers?email=${encodeURIComponent(email)}`)
            return jsonText({ deleted: true, email })
        },
    })
}
