import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { randomBytes } from 'crypto'
import { getClientIP } from '@/lib/spam-prevention'
import { logRequest, logSuccess, logWarn, logError, createTimer } from '@/lib/logger'

const PATH = '/api/newsletter/subscribe'

const subscribeSchema = z.object({
    email: z.string().email().max(254),
    source: z.string().max(80).optional(),
    website: z.string().optional(), // honeypot
})

const SOFT_RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const lastByIp = new Map<string, number>()

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
        const now = Date.now()
        const last = lastByIp.get(ip)
        if (last && now - last < SOFT_RATE_LIMIT_WINDOW_MS) {
            logWarn({ method: 'POST', path: PATH, status: 429, extra: { reason: 'Rate limit', ip } })
            return NextResponse.json({ error: 'Too many requests, slow down.' }, { status: 429 })
        }
        lastByIp.set(ip, now)

        const normalizedEmail = email.toLowerCase().trim()

        const existing = await prisma.newsletterSubscriber.findUnique({ where: { email: normalizedEmail } })
        if (existing) {
            if (existing.status === 'UNSUBSCRIBED') {
                await prisma.newsletterSubscriber.update({
                    where: { email: normalizedEmail },
                    data: { status: 'PENDING', confirmToken: randomBytes(24).toString('hex') },
                })
            }
            // Idempotent response — never confirm/deny existence beyond a generic message
            logSuccess({ method: 'POST', path: PATH, status: 200, durationMs: t.ms(), extra: { email: normalizedEmail, existed: true } })
            return NextResponse.json({ message: 'Subscription updated', success: true }, { status: 200 })
        }

        const subscriber = await prisma.newsletterSubscriber.create({
            data: {
                email: normalizedEmail,
                source: source || null,
                ipAddress: ip,
                userAgent: req.headers.get('user-agent') || null,
                confirmToken: randomBytes(24).toString('hex'),
                status: 'PENDING',
            },
            select: { id: true },
        })

        logSuccess({ method: 'POST', path: PATH, status: 201, durationMs: t.ms(), extra: { id: subscriber.id } })
        return NextResponse.json({ message: 'Subscribed. Check your inbox to confirm.', success: true }, { status: 201 })
    } catch (error) {
        logError({ method: 'POST', path: PATH, error })
        return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
    }
}
