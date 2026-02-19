import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getClientIP, checkRateLimit, detectSpam, validateEmail } from '@/lib/spam-prevention'

/**
 * GET /api/comments?postSlug=xxx
 * List approved comments for a specific post
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const postSlug = searchParams.get('postSlug')

    if (!postSlug) {
        return NextResponse.json({ error: 'postSlug is required' }, { status: 400 })
    }

    try {
        const comments = await prisma.comment.findMany({
            where: {
                postSlug,
                status: 'APPROVED'
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                replies: {
                    where: { status: 'APPROVED' },
                    orderBy: { createdAt: 'asc' }
                }
            }
        })

        return NextResponse.json(comments)
    } catch (error) {
        console.error('Error fetching comments:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

/**
 * POST /api/comments
 * Create a new comment with anti-spam checks
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { authorName, authorEmail, content, postSlug, website, parentId } = body

        // 1. Honeypot check
        if (website) {
            return NextResponse.json({ error: 'Spam detected' }, { status: 400 })
        }

        // 2. Base validation
        if (!authorName || !authorEmail || !content || !postSlug) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        if (!validateEmail(authorEmail)) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
        }

        // 3. Rate limiting
        const ip = getClientIP(req)
        const isAllowed = await checkRateLimit(ip, authorEmail)
        if (!isAllowed) {
            return NextResponse.json({ error: 'Too many comments. Try again later.' }, { status: 429 })
        }

        // 4. Spam detection
        const spamScore = detectSpam(content, authorEmail)
        let status: 'PENDING' | 'SPAM' = 'PENDING'

        if (spamScore > 0.7) {
            status = 'SPAM'
            await prisma.spamLog.create({
                data: {
                    authorEmail,
                    ipAddress: ip,
                    reason: `High spam score: ${spamScore}`,
                    severity: 'HIGH'
                }
            })
        }

        // 5. Create comment
        const comment = await prisma.comment.create({
            data: {
                authorName,
                authorEmail,
                content,
                postSlug,
                status,
                spamScore,
                ipAddress: ip,
                userAgent: req.headers.get('user-agent'),
                parentId: parentId || null
            }
        })

        return NextResponse.json(comment, { status: 201 })
    } catch (error) {
        console.error('Error creating comment:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
