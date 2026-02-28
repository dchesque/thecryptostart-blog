import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logRequest, logSuccess, logWarn, logError, createTimer } from '@/lib/logger'

const PATH = '/api/admin/comments'

export async function GET(req: NextRequest) {
    const t = createTimer()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20
    const skip = (page - 1) * limit
    logRequest('GET', PATH, { status, page })

    try {
        const whereClause: any = {}
        if (status && status !== 'all') {
            whereClause.status = status.toUpperCase()
        }

        const [comments, total] = await Promise.all([
            prisma.comment.findMany({
                where: whereClause,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    post: { select: { title: true } }
                }
            }),
            prisma.comment.count({ where: whereClause })
        ])

        logSuccess({ method: 'GET', path: PATH, durationMs: t.ms(), extra: { total, returned: comments.length } })
        return NextResponse.json({
            comments,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            }
        })
    } catch (error) {
        logError({ method: 'GET', path: PATH, error })
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
