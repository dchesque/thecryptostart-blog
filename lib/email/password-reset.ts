import { sendEmail } from './index'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://thecryptostart.example.com'
const SITE_NAME = 'The Crypto Start'

export async function sendPasswordReset(email: string, token: string) {
    const resetUrl = `${SITE_URL}/login?resetToken=${encodeURIComponent(token)}`

    const subject = `Reset your password — ${SITE_NAME}`

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#fafaf7;margin:0;padding:32px;color:#1a1a1a;">
  <table role="presentation" align="center" style="max-width:560px;width:100%;background:#ffffff;border:1px solid #ececec;border-radius:12px;padding:32px;">
    <tr><td>
      <h1 style="font-size:22px;margin:0 0 16px;font-weight:600;letter-spacing:-0.01em;">Reset your password</h1>
      <p style="margin:0 0 16px;line-height:1.6;color:#3a3a3a;">Click the button below to set a new password. This link is valid for 60 minutes.</p>
      <p style="margin:24px 0;">
        <a href="${resetUrl}" style="display:inline-block;background:#1a1a1a;color:#ffffff;padding:12px 28px;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px;">Reset password</a>
      </p>
      <p style="margin:0 0 8px;color:#6a6a6a;font-size:13px;line-height:1.6;">If the button doesn't work, paste this link in your browser:</p>
      <p style="margin:0 0 24px;color:#3a3a3a;font-size:13px;word-break:break-all;">${resetUrl}</p>
      <hr style="border:none;border-top:1px solid #ececec;margin:24px 0;">
      <p style="margin:0;color:#9a9a9a;font-size:12px;line-height:1.6;">If you didn't request this, you can ignore this email — your password is unchanged.</p>
    </td></tr>
  </table>
</body></html>`

    const text = `Reset your password\n\nOpen: ${resetUrl}\n\nIf you didn't request this, ignore this email.`

    return sendEmail({ to: email, subject, html, text, tag: 'password-reset' })
}
