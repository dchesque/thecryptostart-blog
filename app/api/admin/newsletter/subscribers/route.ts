import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkApiAuth } from '@/lib/auth-check'
import { logRequest, logSuccess, logError, createTimer } from '@/lib/logger'

const PATH = '/api/admin/newsletter/subscribers'

export async function GET(req: NextRequest) {
    const authError = await checkApiAuth(req)
    if (authError) return authError

    const t = createTimer()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200)
    const skip = (page - 1) * limit

    logRequest('GET', PATH, { status, page, limit })

    try {
        const where: any = {}
        if (status && status !== 'all') where.status = status.toUpperCase()

        const [subscribers, total] = await Promise.all([
            prisma.newsletterSubscriber.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                select: {
                    id: true,
                    email: true,
                    status: true,
                    source: true,
                    confirmedAt: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
            prisma.newsletterSubscriber.count({ where }),
        ])

        logSuccess({ method: 'GET', path: PATH, durationMs: t.ms(), extra: { count: subscribers.length, total } })
        return NextResponse.json({
            subscribers,
            pagination: {
                total,
                pages: Math.max(Math.ceil(total / limit), 1),
                currentPage: page,
                limit,
            },
        })
    } catch (error) {
        logError({ method: 'GET', path: PATH, error })
        return NextResponse.json({ error: 'Failed to list subscribers' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    const authError = await checkApiAuth(req)
    if (authError) return authError

    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')
    if (!email) {
        return NextResponse.json({ error: 'Missing email' }, { status: 400 })
    }

    try {
        await prisma.newsletterSubscriber.delete({ where: { email: email.toLowerCase().trim() } })
        return new NextResponse(null, { status: 204 })
    } catch (error: any) {
        if (error?.code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 })
        return NextResponse.json({ error: 'Failed to delete subscriber' }, { status: 500 })
    }
}
