import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { hash } from 'bcryptjs'
import { logRequest, logSuccess, logWarn, logError, createTimer } from '@/lib/logger'

const PATH = '/api/auth/password-reset/confirm'

const schema = z.object({
    token: z.string().min(32),
    password: z.string().min(8).max(200),
})

export async function POST(req: NextRequest) {
    const t = createTimer()
    logRequest('POST', PATH)

    try {
        const body = await req.json()
        const parsed = schema.safeParse(body)
        if (!parsed.success) {
            logWarn({ method: 'POST', path: PATH, status: 400, extra: { reason: 'Validation failed' } })
            return NextResponse.json({ error: 'Invalid token or password' }, { status: 400 })
        }

        const { token, password } = parsed.data

        const reset = await prisma.passwordReset.findUnique({
            where: { token },
            select: { id: true, userId: true, expiresAt: true },
        })

        if (!reset || reset.expiresAt < new Date()) {
            if (reset) {
                await prisma.passwordReset.delete({ where: { id: reset.id } }).catch(() => {})
            }
            logWarn({ method: 'POST', path: PATH, status: 400, extra: { reason: 'Token invalid/expired' } })
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
        }

        const passwordHash = await hash(password, 12)

        await prisma.$transaction([
            prisma.user.update({
                where: { id: reset.userId },
                data: { passwordHash },
            }),
            prisma.passwordReset.deleteMany({ where: { userId: reset.userId } }),
        ])

        logSuccess({ method: 'POST', path: PATH, durationMs: t.ms(), extra: { userId: reset.userId } })
        return NextResponse.json({ message: 'Password updated.', success: true })
    } catch (error) {
        logError({ method: 'POST', path: PATH, error })
        return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
    }
}
