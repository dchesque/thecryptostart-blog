import { NextResponse } from 'next/server'
import { getAllPosts } from '@/lib/posts'

export const revalidate = 1800 // 30 min

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://thecryptostart.example.com'
const SITE_NAME = 'The Crypto Start'
const SITE_DESCRIPTION = 'Plain-language guides on Bitcoin, Ethereum, DeFi and Web3.'

function escapeXml(s: string) {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}

function cdata(s: string) {
    return `<![CDATA[${s.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`
}

export async function GET() {
    const posts = await getAllPosts({ limit: 50 })

    const items = posts.map((p) => {
        const url = `${SITE_URL}/blog/${p.slug}`
        return `
    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>
      <author>noreply@thecryptostart.example.com (${escapeXml(p.author.name)})</author>
      <category>${escapeXml(p.category)}</category>
      <description>${cdata(p.description)}</description>
    </item>`
    }).join('')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`

    return new NextResponse(xml, {
        headers: {
            'content-type': 'application/rss+xml; charset=utf-8',
            'cache-control': 'public, s-maxage=1800, stale-while-revalidate=86400',
        },
    })
}
