import { NextResponse } from 'next/server'

export const dynamic = 'force-static'
export const revalidate = false

/**
 * Build/runtime metadata. Useful for:
 *  - confirming which deploy is live (sha === origin/main commit?)
 *  - correlating errors with a specific release
 *  - cheap liveness check that doesn't hit the DB
 *
 * Values are read at BUILD time so `dynamic = 'force-static'` is safe.
 * GIT_SHA / GIT_BRANCH / BUILT_AT are baked by next.config.mjs.
 */
export async function GET() {
    return NextResponse.json({
        version: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
        gitSha: process.env.NEXT_PUBLIC_GIT_SHA || 'unknown',
        gitBranch: process.env.NEXT_PUBLIC_GIT_BRANCH || 'unknown',
        builtAt: process.env.NEXT_PUBLIC_BUILT_AT || null,
        nodeEnv: process.env.NODE_ENV ?? 'unknown',
    })
}
