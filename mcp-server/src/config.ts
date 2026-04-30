/**
 * Env config for the MCP server. Validates eagerly at startup so the
 * process fails fast with a useful message instead of obscure 401s later.
 */

export type Config = {
    blogUrl: string
    adminApiKey: string
    timeoutMs: number
    writesEnabled: boolean
}

export function loadConfig(): Config {
    const blogUrl = process.env.BLOG_URL
    const adminApiKey = process.env.ADMIN_API_KEY
    const timeoutMs = parseInt(process.env.MCP_TIMEOUT_MS || '15000', 10)
    const writesEnabled = process.env.MCP_WRITES_ENABLED === 'true'

    const errors: string[] = []
    if (!blogUrl) errors.push('BLOG_URL is required (e.g. https://thecryptostart.com)')
    if (!adminApiKey) errors.push('ADMIN_API_KEY is required (must match the blog\'s ADMIN_API_KEY)')
    if (Number.isNaN(timeoutMs) || timeoutMs < 1000) errors.push('MCP_TIMEOUT_MS must be >= 1000')

    if (errors.length > 0) {
        throw new Error(`MCP server configuration error:\n  - ${errors.join('\n  - ')}`)
    }

    return {
        blogUrl: blogUrl!.replace(/\/$/, ''),
        adminApiKey: adminApiKey!,
        timeoutMs,
        writesEnabled,
    }
}
