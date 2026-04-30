import { NextResponse } from 'next/server'
import { buildOpenApiSpec } from '@/lib/openapi'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function GET() {
    const spec = buildOpenApiSpec()
    return NextResponse.json(spec, {
        headers: { 'Cache-Control': 'public, max-age=3600' },
    })
}
