import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkApiAuth } from '@/lib/auth-check'
import { clampInt, pastDate } from '@/lib/cleanup'
import { logRequest, logSuccess, logError, createTimer } from '@/lib/logger'

const PATH = '/api/admin/cleanup'

/**
 * Retention sweeps. Designed to be called by an external cron (GitHub
 * Actions, Vercel Cron, EasyPanel cron, etc.) once a day. Idempotent —
 * each call only deletes rows past the retention window.
 *
 * Defaults (override via body):
 *   systemLogDays:        30 — SystemLog older than this is deleted
 *   spamLogDays:          90 — SpamLog kept longer for forensics
 *   pendingSubscriberDays: 30 — never-confirmed subscribers are GDPR-purged
 *   passwordResetExpired:  true — every expired token is deleted
 *
 * Body example:
 *   { "systemLogDays": 14 }   // override one knob
 *   { "dryRun": true }        // count what would be deleted, no writes
 */

type Body = {
    systemLogDays?: number
    spamLogDays?: number
    pendingSubscriberDays?: number
    passwordResetExpired?: boolean
    dryRun?: boolean
}

export async function POST(req: NextRequest) {
    const authError = await checkApiAuth(req)
    if (authError) return authError

    const t = createTimer()
    logRequest('POST', PATH)

    try {
        const body: Body = await req.json().catch(() => ({}))
        const dryRun = body.dryRun === true

        const systemLogDays = clampInt(body.systemLogDays, 1, 365, 30)
        const spamLogDays = clampInt(body.spamLogDays, 7, 730, 90)
        const pendingSubscriberDays = clampInt(body.pendingSubscriberDays, 1, 365, 30)
        const passwordResetExpired = body.passwordResetExpired !== false // default true

        const result: Record<string, { deleted: number; horizon?: string }> = {}

        // --- SystemLog ---
        const systemLogHorizon = pastDate(systemLogDays)
        if (dryRun) {
            const n = await prisma.systemLog.count({ where: { createdAt: { lt: systemLogHorizon } } })
            result.systemLog = { deleted: n, horizon: systemLogHorizon.toISOString() }
        } else {
            const r = await prisma.systemLog.deleteMany({ where: { createdAt: { lt: systemLogHorizon } } })
            result.systemLog = { deleted: r.count, horizon: systemLogHorizon.toISOString() }
        }

        // --- SpamLog ---
        const spamLogHorizon = pastDate(spamLogDays)
        if (dryRun) {
            const n = await prisma.spamLog.count({ where: { createdAt: { lt: spamLogHorizon } } })
            result.spamLog = { deleted: n, horizon: spamLogHorizon.toISOString() }
        } else {
            const r = await prisma.spamLog.deleteMany({ where: { createdAt: { lt: spamLogHorizon } } })
            result.spamLog = { deleted: r.count, horizon: spamLogHorizon.toISOString() }
        }

        // --- Pending newsletter subscribers ---
        const pendingHorizon = pastDate(pendingSubscriberDays)
        if (dryRun) {
            const n = await prisma.newsletterSubscriber.count({
                where: { status: 'PENDING', createdAt: { lt: pendingHorizon } },
            })
            result.pendingSubscribers = { deleted: n, horizon: pendingHorizon.toISOString() }
        } else {
            const r = await prisma.newsletterSubscriber.deleteMany({
                where: { status: 'PENDING', createdAt: { lt: pendingHorizon } },
            })
            result.pendingSubscribers = { deleted: r.count, horizon: pendingHorizon.toISOString() }
        }

        // --- Expired password reset tokens ---
        if (passwordResetExpired) {
            const horizon = new Date()
            if (dryRun) {
                const n = await prisma.passwordReset.count({ where: { expiresAt: { lt: horizon } } })
                result.passwordResetExpired = { deleted: n, horizon: horizon.toISOString() }
            } else {
                const r = await prisma.passwordReset.deleteMany({ where: { expiresAt: { lt: horizon } } })
                result.passwordResetExpired = { deleted: r.count, horizon: horizon.toISOString() }
            }
        }

        const totalDeleted = Object.values(result).reduce((sum, r) => sum + r.deleted, 0)

        logSuccess({ method: 'POST', path: PATH, durationMs: t.ms(), extra: { dryRun, totalDeleted, ...result } })
        return NextResponse.json({
            success: true,
            dryRun,
            result,
            totalDeleted,
            ranAt: new Date().toISOString(),
        })
    } catch (error) {
        logError({ method: 'POST', path: PATH, error })
        return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 })
    }
}

