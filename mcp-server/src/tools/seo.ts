import { z } from 'zod'
import type { Server } from '@modelcontextprotocol/sdk/server/index.js'
import type { ApiClient } from '../api-client.js'
import { registerTool, jsonText } from '../helpers.js'

export function registerSeoTools(server: Server, api: ApiClient) {
    registerTool(server, {
        name: 'seo.metrics',
        description:
            'Admin: SEO metrics across all published posts (avg word count, posts under 1500, internal/external link averages, expansion opportunities, linking suggestions). Cached 5min server-side.',
        inputSchema: z.object({}),
        handler: async () => jsonText(await api.get('/api/seo/metrics')),
    })

    registerTool(server, {
        name: 'seo.gsc',
        description: 'Admin: Google Search Console analytics (top queries, top pages, low-CTR pages, recommendations).',
        inputSchema: z.object({}),
        handler: async () => jsonText(await api.get('/api/gsc/analytics')),
    })

    registerTool(server, {
        name: 'seo.ai_scores',
        description: 'Admin: AI-optimization scores per post (Quick Answer, FAQ schema, citable sentences).',
        inputSchema: z.object({}),
        handler: async () => jsonText(await api.get('/api/ai-optimization/scores')),
    })
}
