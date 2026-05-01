import { sendEmail } from './index'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://thecryptostart.example.com'
const SITE_NAME = 'The Crypto Start'

export async function sendSubscriptionConfirmation(email: string, token: string) {
    const confirmUrl = `${SITE_URL}/api/newsletter/confirm?token=${encodeURIComponent(token)}`

    const subject = `Confirm your subscription to ${SITE_NAME}`

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#fafaf7;margin:0;padding:32px;color:#1a1a1a;">
  <table role="presentation" align="center" style="max-width:560px;width:100%;background:#ffffff;border:1px solid #ececec;border-radius:12px;padding:32px;">
    <tr><td>
      <h1 style="font-size:22px;margin:0 0 16px;font-weight:600;letter-spacing:-0.01em;">Almost there.</h1>
      <p style="margin:0 0 16px;line-height:1.6;color:#3a3a3a;">Thanks for subscribing to <strong>${SITE_NAME}</strong>. Click the button below to confirm your email — it takes one tap.</p>
      <p style="margin:24px 0;">
        <a href="${confirmUrl}" style="display:inline-block;background:#1a1a1a;color:#ffffff;padding:12px 28px;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px;">Confirm subscription</a>
      </p>
      <p style="margin:0 0 8px;color:#6a6a6a;font-size:13px;line-height:1.6;">If the button doesn't work, paste this link in your browser:</p>
      <p style="margin:0 0 24px;color:#3a3a3a;font-size:13px;word-break:break-all;">${confirmUrl}</p>
      <hr style="border:none;border-top:1px solid #ececec;margin:24px 0;">
      <p style="margin:0;color:#9a9a9a;font-size:12px;line-height:1.6;">If you didn't sign up, just ignore this email — we won't bother you again.</p>
    </td></tr>
  </table>
</body></html>`

    const text = `Confirm your subscription to ${SITE_NAME}\n\nClick to confirm: ${confirmUrl}\n\nIf you didn't sign up, ignore this email.`

    return sendEmail({ to: email, subject, html, text, tag: 'subscription-confirmation' })
}
