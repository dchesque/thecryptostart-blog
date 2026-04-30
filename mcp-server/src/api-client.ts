import type { Config } from './config.js'

export type ApiClient = {
    get<T = unknown>(path: string): Promise<T>
    post<T = unknown>(path: string, body: unknown): Promise<T>
    put<T = unknown>(path: string, body: unknown): Promise<T>
    patch<T = unknown>(path: string, body: unknown): Promise<T>
    delete(path: string): Promise<void>
}

const ADMIN_PREFIXES = ['/api/admin', '/api/users']

function isAdminPath(path: string) {
    return ADMIN_PREFIXES.some((p) => path.startsWith(p))
}

export function createApiClient(cfg: Config): ApiClient {
    async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
        const url = `${cfg.blogUrl}${path}`
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), cfg.timeoutMs)

        try {
            const headers: Record<string, string> = { accept: 'application/json' }
            if (body !== undefined) headers['content-type'] = 'application/json'
            if (isAdminPath(path)) headers['x-api-key'] = cfg.adminApiKey

            const res = await fetch(url, {
                method,
                headers,
                body: body !== undefined ? JSON.stringify(body) : undefined,
                signal: controller.signal,
            })

            if (!res.ok) {
                const text = await res.text().catch(() => '')
                throw new ApiError(method, path, res.status, text)
            }

            if (res.status === 204) return undefined as T
            const ct = res.headers.get('content-type') || ''
            if (ct.includes('application/json')) return (await res.json()) as T
            return (await res.text()) as unknown as T
        } finally {
            clearTimeout(timer)
        }
    }

    return {
        get: (p) => call('GET', p),
        post: (p, b) => call('POST', p, b),
        put: (p, b) => call('PUT', p, b),
        patch: (p, b) => call('PATCH', p, b),
        delete: async (p) => { await call('DELETE', p) },
    }
}

export class ApiError extends Error {
    method: string
    path: string
    status: number
    body: string

    constructor(method: string, path: string, status: number, body: string) {
        super(`${method} ${path} → ${status}: ${body || '(no body)'}`)
        this.name = 'ApiError'
        this.method = method
        this.path = path
        this.status = status
        this.body = body
    }
}
