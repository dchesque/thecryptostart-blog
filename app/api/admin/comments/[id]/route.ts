import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logRequest, logSuccess, logWarn, logError, createTimer } from '@/lib/logger'

const PATH = '/api/admin/comments/[id]'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const t = createTimer()
    const { id } = await params

    try {
        const body = await req.json()
        const { status } = body
        logRequest('PATCH', PATH, { id, status })

        if (!['APPROVED', 'REJECTED', 'SPAM'].includes(status)) {
            logWarn({ method: 'PATCH', path: PATH, status: 400, extra: { id, reason: 'Invalid status value', value: status } })
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
        }

        const comment = await prisma.comment.update({
            where: { id },
            data: {
                status: status as any,
                modifiedAt: new Date(),
                modifiedBy: 'ADMIN'
            }
        })

        logSuccess({ method: 'PATCH', path: PATH, durationMs: t.ms(), extra: { id, status: comment.status } })
        return NextResponse.json(comment)
    } catch (error) {
        logError({ method: 'PATCH', path: PATH, error, extra: { id } })
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const t = createTimer()
    const { id } = await params
    logRequest('DELETE', PATH, { id })

    try {
        // Delete comment and its replies
        const { count } = await prisma.comment.deleteMany({
            where: {
                OR: [
                    { id },
                    { parentId: id }
                ]
            }
        })

        logSuccess({ method: 'DELETE', path: PATH, status: 204, durationMs: t.ms(), extra: { id, deletedCount: count } })
        return new NextResponse(null, { status: 204 })
    } catch (error) {
        logError({ method: 'DELETE', path: PATH, error, extra: { id } })
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
