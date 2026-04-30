import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { logRequest, logSuccess, logWarn, logError, createTimer } from '@/lib/logger'

const PATH = '/api/newsletter/unsubscribe'

const schema = z.object({
    email: z.string().email().max(254),
})

export async function POST(req: NextRequest) {
    const t = createTimer()
    logRequest('POST', PATH)

    try {
        const body = await req.json()
        const parsed = schema.safeParse(body)
        if (!parsed.success) {
            logWarn({ method: 'POST', path: PATH, status: 400, extra: { reason: 'Validation failed' } })
            return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
        }

        const email = parsed.data.email.toLowerCase().trim()

        const subscriber = await prisma.newsletterSubscriber.findUnique({ where: { email } })
        if (!subscriber) {
            // Idempotent — same response either way
            logSuccess({ method: 'POST', path: PATH, durationMs: t.ms(), extra: { email, existed: false } })
            return NextResponse.json({ message: 'Unsubscribed', success: true })
        }

        await prisma.newsletterSubscriber.update({
            where: { id: subscriber.id },
            data: { status: 'UNSUBSCRIBED' },
        })

        logSuccess({ method: 'POST', path: PATH, durationMs: t.ms(), extra: { email, existed: true } })
        return NextResponse.json({ message: 'Unsubscribed', success: true })
    } catch (error) {
        logError({ method: 'POST', path: PATH, error })
        return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 })
    }
}
