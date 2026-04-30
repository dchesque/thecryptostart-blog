import { sendEmail } from './index'
import { getFeaturedPosts } from '@/lib/posts'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://thecryptostart.example.com'
const SITE_NAME = 'The Crypto Start'

export async function sendWelcome(email: string) {
    const posts = await getFeaturedPosts(5).catch(() => [])

    const postsHtml = posts.length > 0
        ? `<h2 style="font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#9a9a9a;margin:24px 0 12px;">Editor's picks to start</h2>
           <ul style="list-style:none;padding:0;margin:0;">
             ${posts.map(p => `
               <li style="padding:14px 0;border-bottom:1px solid #ececec;">
                 <a href="${SITE_URL}/blog/${p.slug}" style="color:#1a1a1a;text-decoration:none;font-weight:600;font-size:15px;line-height:1.4;display:block;">${escapeHtml(p.title)}</a>
                 <span style="color:#6a6a6a;font-size:13px;">${p.readingTime} min read</span>
               </li>`).join('')}
           </ul>`
        : ''

    const unsubscribeUrl = `${SITE_URL}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}`

    const subject = `Welcome to ${SITE_NAME} — let's start.`

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#fafaf7;margin:0;padding:32px;color:#1a1a1a;">
  <table role="presentation" align="center" style="max-width:560px;width:100%;background:#ffffff;border:1px solid #ececec;border-radius:12px;padding:32px;">
    <tr><td>
      <h1 style="font-size:24px;margin:0 0 16px;font-weight:600;letter-spacing:-0.01em;">Welcome.</h1>
      <p style="margin:0 0 16px;line-height:1.6;color:#3a3a3a;">You're in. We send concise, security-first explainers about Bitcoin, Ethereum and Web3 — written for people learning their way around digital money. No hype, no shilling.</p>
      ${postsHtml}
      <p style="margin:24px 0 0;line-height:1.6;color:#3a3a3a;">— The team at <strong>${SITE_NAME}</strong></p>
      <hr style="border:none;border-top:1px solid #ececec;margin:24px 0;">
      <p style="margin:0;color:#9a9a9a;font-size:12px;line-height:1.6;">Don't want these? <a href="${unsubscribeUrl}" style="color:#9a9a9a;">Unsubscribe</a> in one click.</p>
    </td></tr>
  </table>
</body></html>`

    const text = `Welcome to ${SITE_NAME}.\n\n${posts.length > 0 ? "Editor's picks:\n" + posts.map(p => `- ${p.title} (${SITE_URL}/blog/${p.slug})`).join('\n') + '\n\n' : ''}Unsubscribe: ${unsubscribeUrl}`

    return sendEmail({ to: email, subject, html, text, tag: 'welcome' })
}

function escapeHtml(s: string) {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}
