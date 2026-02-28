import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PrismaClientKnownRequestError, PrismaClientInitializationError } from '@prisma/client/runtime/library'
import { logRequest, logSuccess, logWarn, logError, createTimer } from '@/lib/logger'

const PATH = '/api/admin/posts/[id]/publish'

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const t = createTimer()
    const { id } = await params

    try {
        const body = await req.json()
        const { publish } = body
        logRequest('POST', PATH, { id, publish })

        // publish is a boolean indicating whether to publish or unpublish
        const status = publish ? 'PUBLISHED' : 'DRAFT'

        // Data contains also publishDate if it is moving to PUBLISHED
        const dataToUpdate: any = { status }
        if (publish) {
            dataToUpdate.publishDate = new Date()
        }

        const post = await prisma.post.update({
            where: { id },
            data: dataToUpdate,
            select: { id: true, status: true, publishDate: true }
        })

        logSuccess({ method: 'POST', path: PATH, durationMs: t.ms(), extra: { id, status: post.status } })
        return NextResponse.json(post)
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
            logWarn({ method: 'POST', path: PATH, status: 404, extra: { id, reason: 'Post not found' } })
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }
        if (error instanceof PrismaClientInitializationError) {
            logError({ method: 'POST', path: PATH, status: 503, error, extra: { id } })
            return NextResponse.json({ error: 'Database connection failed' }, { status: 503 })
        }
        logError({ method: 'POST', path: PATH, error, extra: { id } })
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
