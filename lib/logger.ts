/**
 * Centralized API Logger
 * Provides structured, consistent logging across all API routes.
 *
 * Format: [METHOD] /path | STATUS | Xms | message
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface ApiLogOptions {
    method: string
    path: string
    status?: number
    durationMs?: number
    body?: Record<string, unknown>
    params?: Record<string, unknown>
    userId?: string
    error?: unknown
    extra?: Record<string, unknown>
}

function formatError(error: unknown): string {
    if (error instanceof Error) {
        return `${error.name}: ${error.message}`
    }
    return String(error)
}

function label(method: string, path: string): string {
    return `[API] ${method.toUpperCase()} ${path}`
}

/**
 * Logs the start of an API request (incoming).
 */
export function logRequest(method: string, path: string, extra?: Record<string, unknown>) {
    const msg = `${label(method, path)} → received`
    if (extra && Object.keys(extra).length > 0) {
        console.log(msg, extra)
    } else {
        console.log(msg)
    }
}

/**
 * Logs a successful API response.
 */
export function logSuccess({ method, path, status = 200, durationMs, extra }: ApiLogOptions) {
    const duration = durationMs !== undefined ? ` | ${durationMs}ms` : ''
    console.log(`${label(method, path)} ✓ ${status}${duration}`, extra ?? '')
}

/**
 * Logs a warning (e.g. validation failure, missing resource, rate limit).
 */
export function logWarn({ method, path, status, extra }: ApiLogOptions) {
    const statusStr = status ? ` ${status}` : ''
    console.warn(`${label(method, path)} ⚠${statusStr}`, extra ?? '')
}

/**
 * Logs an error with full details.
 */
export function logError({ method, path, status = 500, error, extra }: ApiLogOptions) {
    const errStr = formatError(error)
    console.error(`${label(method, path)} ✗ ${status} | ${errStr}`, extra ?? '')
}

/**
 * Creates a timer. Call start() before the operation, then done() to get elapsed ms.
 */
export function createTimer() {
    const start = Date.now()
    return {
        ms: () => Date.now() - start,
    }
}
