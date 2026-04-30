/**
 * Email gateway. Wraps Resend with two safety nets:
 *  1. If RESEND_API_KEY is missing (dev/preview), log + no-op instead of throwing.
 *  2. If Resend itself errors, log + return null (callers must NOT block UX on this).
 */
import { logger } from '@/lib/logger'

type SendArgs = {
    to: string | string[]
    subject: string
    html: string
    text?: string
    tag?: string // for SystemLog correlation
}

type SendResult = { id: string | null; skipped: boolean; error?: string }

const FROM_EMAIL = process.env.NEWSLETTER_FROM || 'newsletter@thecryptostart.example.com'
const FROM_NAME = process.env.NEWSLETTER_FROM_NAME || 'The Crypto Start'

export async function sendEmail({ to, subject, html, text, tag }: SendArgs): Promise<SendResult> {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
        // Dev/preview: don't throw, don't fail the request that called us.
        logger.warn('Email', `Skipped (no RESEND_API_KEY)`, { to, subject, tag })
        return { id: null, skipped: true }
    }

    try {
        const { Resend } = await import('resend')
        const resend = new Resend(apiKey)
        const { data, error } = await resend.emails.send({
            from: `${FROM_NAME} <${FROM_EMAIL}>`,
            to,
            subject,
            html,
            text,
        } as any)

        if (error) {
            logger.error('Email', `Resend error`, { to, subject, tag, error: String(error) })
            return { id: null, skipped: false, error: String(error) }
        }

        logger.info('Email', `Sent`, { to, subject, tag, id: data?.id })
        return { id: data?.id ?? null, skipped: false }
    } catch (err: any) {
        logger.error('Email', `Send failed`, { to, subject, tag, error: err?.message || String(err) })
        return { id: null, skipped: false, error: err?.message || String(err) }
    }
}

export { sendSubscriptionConfirmation } from './subscription-confirmation'
export { sendWelcome } from './welcome'
export { sendPasswordReset } from './password-reset'
