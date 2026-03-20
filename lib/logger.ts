/**
 * Centralized API Logger
 * Provides structured, consistent logging across all API routes.
 *
 * Format: [METHOD] /path | STATUS | Xms | message
 */
import { prisma } from './prisma'

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
        console.log(msg);
    }

    // Persist to DB (asynchronous, non-blocking for the request)
    (prisma as any).systemLog.create({
        data: {
            level: 'INFO',
            source: 'API',
            message: msg,
            data: extra ? (extra as any) : undefined
        }
    }).catch((err: any) => console.error('[Logger] Failed to persist log:', err));
}

/**
 * Logs a successful API response.
 */
export function logSuccess({ method, path, status = 200, durationMs, extra }: ApiLogOptions) {
    const duration = durationMs !== undefined ? ` | ${durationMs}ms` : ''
    const msg = `${label(method, path)} ✓ ${status}${duration}`;
    console.log(msg, extra ?? '');

    (prisma as any).systemLog.create({
        data: {
            level: 'INFO',
            source: 'API',
            message: msg,
            data: extra ? (extra as any) : undefined
        }
    }).catch((err: any) => console.error('[Logger] Failed to persist log:', err));
}

/**
 * Logs a warning (e.g. validation failure, missing resource, rate limit).
 */
export function logWarn({ method, path, status, extra }: ApiLogOptions) {
    const statusStr = status ? ` ${status}` : ''
    const msg = `${label(method, path)} ⚠${statusStr}`;
    console.warn(msg, extra ?? '');

    (prisma as any).systemLog.create({
        data: {
            level: 'WARN',
            source: 'API',
            message: msg,
            data: extra ? (extra as any) : undefined
        }
    }).catch((err: any) => console.error('[Logger] Failed to persist log:', err));
}

/**
 * Logs an error with full details.
 */
export function logError({ method, path, status = 500, error, extra }: ApiLogOptions) {
    const errStr = formatError(error)
    const msg = `${label(method, path)} ✗ ${status} | ${errStr}`;
    console.error(msg, extra ?? '');

    (prisma as any).systemLog.create({
        data: {
            level: 'ERROR',
            source: 'API',
            message: msg,
            data: {
                ...(extra as any || {}),
                error: errStr
            }
        }
    }).catch((err: any) => console.error('[Logger] Failed to persist log:', err));
}

/**
 * Objeto logger centralizado para uso em qualquer parte do sistema (incluindo middlewares).
 */
export const logger = {
    info(source: string, message: string, data?: any) {
        return (prisma as any).systemLog.create({
            data: { level: 'INFO', source, message, data: data || undefined }
        }).catch((err: any) => console.error('[Logger] Info failed:', err));
    },
    warn(source: string, message: string, data?: any) {
        return (prisma as any).systemLog.create({
            data: { level: 'WARN', source, message, data: data || undefined }
        }).catch((err: any) => console.error('[Logger] Warn failed:', err));
    },
    error(source: string, message: string, data?: any) {
        return (prisma as any).systemLog.create({
            data: { level: 'ERROR', source, message, data: data || undefined }
        }).catch((err: any) => console.error('[Logger] Error failed:', err));
    }
};

/**
 * Creates a timer. Call start() before the operation, then done() to get elapsed ms.
 */
export function createTimer() {
    const start = Date.now()
    return {
        ms: () => Date.now() - start,
    }
}
