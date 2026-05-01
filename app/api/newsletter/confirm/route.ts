import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendWelcome } from '@/lib/email'
import { logRequest, logSuccess, logWarn, logError, createTimer } from '@/lib/logger'

const PATH = '/api/newsletter/confirm'

/**
 * Double opt-in confirmation. Token is single-use.
 * GET /api/newsletter/confirm?token=...
 */
export async function GET(req: NextRequest) {
    const t = createTimer()
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token') || ''
    logRequest('GET', PATH, { tokenPrefix: token.slice(0, 6) })

    try {
        if (!token || token.length < 16) {
            logWarn({ method: 'GET', path: PATH, status: 400, extra: { reason: 'Missing or short token' } })
            return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
        }

        const subscriber = await prisma.newsletterSubscriber.findUnique({ where: { confirmToken: token } })
        if (!subscriber) {
            logWarn({ method: 'GET', path: PATH, status: 404, extra: { reason: 'Token not found' } })
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 404 })
        }

        await prisma.newsletterSubscriber.update({
            where: { id: subscriber.id },
            data: { status: 'CONFIRMED', confirmedAt: new Date(), confirmToken: null },
        })

        // Best-effort welcome email
        sendWelcome(subscriber.email).catch((err) => {
            logError({ method: 'GET', path: PATH, error: err, extra: { reason: 'Welcome email failed' } })
        })

        logSuccess({ method: 'GET', path: PATH, durationMs: t.ms(), extra: { id: subscriber.id } })
        return NextResponse.json({ message: 'Subscription confirmed.', success: true })
    } catch (error) {
        logError({ method: 'GET', path: PATH, error })
        return NextResponse.json({ error: 'Failed to confirm subscription' }, { status: 500 })
    }
}
