import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { randomBytes } from 'crypto'
import { sendPasswordReset } from '@/lib/email'
import { checkRateLimit } from '@/lib/rate-limit'
import { getIP } from '@/lib/rate-limit'
import { rateLimitHeaders } from '@/lib/rate-limit-headers'
import { logRequest, logSuccess, logWarn, logError, createTimer } from '@/lib/logger'

const PATH = '/api/auth/password-reset/request'

const schema = z.object({
    email: z.string().email().max(254),
})

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 min
const RATE_LIMIT_MAX = 3
const TOKEN_TTL_MS = 60 * 60 * 1000 // 60 min

export async function POST(req: NextRequest) {
    const t = createTimer()
    logRequest('POST', PATH)

    try {
        const body = await req.json()
        const parsed = schema.safeParse(body)
        if (!parsed.success) {
            logWarn({ method: 'POST', path: PATH, status: 400, extra: { reason: 'Validation failed' } })
            // Still return generic success to avoid email enumeration
            return NextResponse.json({ message: 'If the account exists, an email was sent.', success: true })
        }

        const ip = getIP(req)
        const rl = await checkRateLimit(`pwreset:ip:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)
        const rlInfo = { limit: RATE_LIMIT_MAX, remaining: rl.remaining, resetAt: rl.resetAt }
        if (rl.limited) {
            logWarn({ method: 'POST', path: PATH, status: 429, extra: { reason: 'Rate limit', ip } })
            return NextResponse.json(
                { error: 'Too many requests, slow down.' },
                { status: 429, headers: rateLimitHeaders(rlInfo, { include429: true }) },
            )
        }

        const headers = rateLimitHeaders(rlInfo)
        const email = parsed.data.email.toLowerCase().trim()

        // Always respond identically — never leak whether the email exists.
        const user = await prisma.user.findUnique({ where: { email }, select: { id: true } })
        if (!user) {
            logSuccess({ method: 'POST', path: PATH, durationMs: t.ms(), extra: { email, found: false } })
            return NextResponse.json({ message: 'If the account exists, an email was sent.', success: true }, { headers })
        }

        // Invalidate previous tokens for this user (only the latest is usable)
        await prisma.passwordReset.deleteMany({ where: { userId: user.id } })

        const token = randomBytes(32).toString('hex')
        await prisma.passwordReset.create({
            data: {
                userId: user.id,
                token,
                expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
            },
        })

        sendPasswordReset(email, token).catch((err) => {
            logError({ method: 'POST', path: PATH, error: err, extra: { reason: 'Reset email failed' } })
        })

        logSuccess({ method: 'POST', path: PATH, durationMs: t.ms(), extra: { email, found: true } })
        return NextResponse.json({ message: 'If the account exists, an email was sent.', success: true }, { headers })
    } catch (error) {
        logError({ method: 'POST', path: PATH, error })
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
    }
}
