#!/usr/bin/env node
/**
 * MCP server for thecryptostart blog.
 * Connects via stdio. Spawn from Claude Desktop / Claude Code with:
 *
 *   {
 *     "command": "node",
 *     "args": ["/path/to/mcp-server/dist/server.js"],
 *     "env": {
 *       "BLOG_URL": "https://thecryptostart.com",
 *       "ADMIN_API_KEY": "...",
 *       "MCP_WRITES_ENABLED": "false"
 *     }
 *   }
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

import { loadConfig } from './config.js'
import { createApiClient } from './api-client.js'
import { bindRegistryToServer } from './helpers.js'
import { bindPromptsToServer } from './prompts/index.js'

import { registerPostTools } from './tools/posts.js'
import { registerCategoryTools } from './tools/categories.js'
import { registerAuthorTools } from './tools/authors.js'
import { registerCommentTools } from './tools/comments.js'
import { registerNewsletterTools } from './tools/newsletter.js'
import { registerSeoTools } from './tools/seo.js'
import { registerOpsTools } from './tools/ops.js'

import './prompts/new-post-skeleton.js'
import './prompts/triage-comments.js'
import './prompts/seo-fix-report.js'

async function main() {
    const cfg = loadConfig()
    const api = createApiClient(cfg)

    const server = new Server(
        { name: 'thecryptostart-mcp', version: '0.1.0' },
        { capabilities: { tools: {}, prompts: {} } },
    )

    registerPostTools(server, api, cfg.writesEnabled)
    registerCategoryTools(server, api, cfg.writesEnabled)
    registerAuthorTools(server, api, cfg.writesEnabled)
    registerCommentTools(server, api, cfg.writesEnabled)
    registerNewsletterTools(server, api, cfg.writesEnabled)
    registerSeoTools(server, api)
    registerOpsTools(server, api, cfg.writesEnabled)

    bindRegistryToServer(server)
    bindPromptsToServer(server)

    const transport = new StdioServerTransport()
    await server.connect(transport)

    // stderr is OK in MCP (stdio is reserved for protocol). Use it for boot info.
    process.stderr.write(
        `[mcp] thecryptostart-mcp v0.1.0 connected; writes=${cfg.writesEnabled}\n`,
    )
}

main().catch((err) => {
    process.stderr.write(`[mcp] fatal: ${err?.message || err}\n`)
    process.exit(1)
})
