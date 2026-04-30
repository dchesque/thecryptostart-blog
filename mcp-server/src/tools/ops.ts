import { z } from 'zod'
import type { Server } from '@modelcontextprotocol/sdk/server/index.js'
import type { ApiClient } from '../api-client.js'
import { registerTool, jsonText } from '../helpers.js'

export function registerOpsTools(server: Server, api: ApiClient, writesEnabled: boolean) {
    registerTool(server, {
        name: 'health',
        description: 'Public: blog health check (status, DB connectivity, env presence).',
        inputSchema: z.object({}),
        handler: async () => jsonText(await api.get('/api/health')),
    })

    registerTool(server, {
        name: 'stats',
        description: 'Public: aggregate counts (published posts, categories, authors, comments).',
        inputSchema: z.object({}),
        handler: async () => jsonText(await api.get('/api/stats')),
    })

    registerTool(server, {
        name: 'tags',
        description: 'Public: tags + counts across published posts.',
        inputSchema: z.object({}),
        handler: async () => jsonText(await api.get('/api/tags')),
    })

    registerTool(server, {
        name: 'diagnostics',
        description: 'Admin: DB diagnostics + env checks. Useful when debugging deploys.',
        inputSchema: z.object({}),
        handler: async () => jsonText(await api.get('/api/admin/diagnostics')),
    })

    registerTool(server, {
        name: 'logs.recent',
        description: 'Admin: most recent SystemLog entries.',
        inputSchema: z.object({
            limit: z.number().int().min(1).max(200).default(50),
            level: z.enum(['INFO', 'WARN', 'ERROR']).optional(),
        }),
        handler: async ({ limit, level }) => {
            const params = new URLSearchParams({ limit: String(limit) })
            if (level) params.set('level', level)
            return jsonText(await api.get(`/api/admin/logs?${params}`))
        },
    })

    if (!writesEnabled) return

    registerTool(server, {
        name: 'revalidate',
        description:
            'Admin: trigger Next.js ISR revalidation for paths/tags/slug. Requires MCP_WRITES_ENABLED=true.',
        inputSchema: z.object({
            paths: z.array(z.string()).optional(),
            tags: z.array(z.string()).optional(),
            slug: z.string().optional(),
        }),
        handler: async (body) => jsonText(await api.post('/api/admin/revalidate', body)),
    })
}
