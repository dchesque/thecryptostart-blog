import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { randomBytes } from 'crypto'
import { getClientIP } from '@/lib/spam-prevention'
import { checkRateLimit } from '@/lib/rate-limit'
import { rateLimitHeaders } from '@/lib/rate-limit-headers'
import { sendSubscriptionConfirmation } from '@/lib/email'
import { logRequest, logSuccess, logWarn, logError, createTimer } from '@/lib/logger'

const PATH = '/api/newsletter/subscribe'

const subscribeSchema = z.object({
    email: z.string().email().max(254),
    source: z.string().max(80).optional(),
    website: z.string().optional(), // honeypot
})

const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 3 // 3 subscribe attempts/min/IP

export async function POST(req: NextRequest) {
    const t = createTimer()
    logRequest('POST', PATH)

    try {
        const body = await req.json()
        const parsed = subscribeSchema.safeParse(body)
        if (!parsed.success) {
            logWarn({ method: 'POST', path: PATH, status: 400, extra: { reason: 'Validation failed' } })
            return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
        }

        const { email, source, website } = parsed.data

        // Honeypot — silently accept and discard
        if (website && website.trim() !== '') {
            logWarn({ method: 'POST', path: PATH, extra: { reason: 'Honeypot triggered' } })
            return NextResponse.json({ message: 'Subscribed', success: true }, { status: 201 })
        }

        const ip = getClientIP(req)
        const rl = await checkRateLimit(`newsletter:subscribe:ip:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)
        const rlInfo = { limit: RATE_LIMIT_MAX, remaining: rl.remaining, resetAt: rl.resetAt }
        if (rl.limited) {
            logWarn({ method: 'POST', path: PATH, status: 429, extra: { reason: 'Rate limit', ip } })
            return NextResponse.json(
                { error: 'Too many requests, slow down.' },
                { status: 429, headers: rateLimitHeaders(rlInfo, { include429: true }) },
            )
        }

        const headers = rateLimitHeaders(rlInfo)
        const normalizedEmail = email.toLowerCase().trim()

        const existing = await prisma.newsletterSubscriber.findUnique({ where: { email: normalizedEmail } })
        if (existing) {
            if (existing.status === 'UNSUBSCRIBED') {
                const newToken = randomBytes(24).toString('hex')
                await prisma.newsletterSubscriber.update({
                    where: { email: normalizedEmail },
                    data: { status: 'PENDING', confirmToken: newToken },
                })
                // Resubscribe → resend confirm email (best-effort, doesn't block response)
                sendSubscriptionConfirmation(normalizedEmail, newToken).catch(() => {})
            } else if (existing.status === 'PENDING' && existing.confirmToken) {
                // Resend the same confirm email — user may have lost the previous one
                sendSubscriptionConfirmation(normalizedEmail, existing.confirmToken).catch(() => {})
            }
            // Idempotent response — never confirm/deny existence beyond a generic message
            logSuccess({ method: 'POST', path: PATH, status: 200, durationMs: t.ms(), extra: { email: normalizedEmail, existed: true } })
            return NextResponse.json({ message: 'Subscription updated', success: true }, { status: 200, headers })
        }

        const confirmToken = randomBytes(24).toString('hex')
        const subscriber = await prisma.newsletterSubscriber.create({
            data: {
                email: normalizedEmail,
                source: source || null,
                ipAddress: ip,
                userAgent: req.headers.get('user-agent') || null,
                confirmToken,
                status: 'PENDING',
            },
            select: { id: true },
        })

        // Best-effort send. Failure must NOT block the response — the user
        // can retry; the token stays valid.
        sendSubscriptionConfirmation(normalizedEmail, confirmToken).catch((err) => {
            logError({ method: 'POST', path: PATH, error: err, extra: { reason: 'Confirm email send failed' } })
        })

        logSuccess({ method: 'POST', path: PATH, status: 201, durationMs: t.ms(), extra: { id: subscriber.id } })
        return NextResponse.json({ message: 'Subscribed. Check your inbox to confirm.', success: true }, { status: 201, headers })
    } catch (error) {
        logError({ method: 'POST', path: PATH, error })
        return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
    }
}
