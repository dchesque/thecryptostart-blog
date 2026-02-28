import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
    validateEmail,
    getClientIP,
    checkRateLimit,
    detectSpam,
    logSpam,
} from '@/lib/spam-prevention'
import { logRequest, logSuccess, logWarn, logError, createTimer } from '@/lib/logger'

const HONEYPOT_FIELD = 'website'
const PATH = '/api/comments'

export async function POST(request: NextRequest) {
    const t = createTimer()
    logRequest('POST', PATH)

    try {
        const body = await request.json()
        const { postSlug, authorName, authorEmail, content, website, parentId } = body

        // 1. Validate required fields
        if (!postSlug || !authorName || !authorEmail || !content) {
            logWarn({ method: 'POST', path: PATH, status: 400, extra: { reason: 'Missing required fields', postSlug } })
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const clientIP = getClientIP(request)

        // 2. Honeypot check
        if (website && website.trim() !== '') {
            await logSpam(authorEmail, clientIP, 'honeypot', 'high')
            logWarn({ method: 'POST', path: PATH, extra: { reason: 'Honeypot triggered', ip: clientIP } })
            return NextResponse.json(
                { message: 'Comment submitted', success: true },
                { status: 201 }
            )
        }

        // 3. Validate email format
        if (!validateEmail(authorEmail)) {
            await logSpam(authorEmail, clientIP, 'invalid_email', 'medium')
            logWarn({ method: 'POST', path: PATH, status: 400, extra: { reason: 'Invalid email', email: authorEmail } })
            return NextResponse.json(
                { error: 'Invalid email address' },
                { status: 400 }
            )
        }

        // 4. Rate limiting check
        const isAllowed = await checkRateLimit(clientIP, authorEmail)
        if (!isAllowed) {
            await logSpam(authorEmail, clientIP, 'rate_limit', 'medium')
            logWarn({ method: 'POST', path: PATH, status: 429, extra: { reason: 'Rate limit exceeded', ip: clientIP } })
            return NextResponse.json(
                { error: 'Too many comments. Please try again later.' },
                { status: 429 }
            )
        }

        // 5. Spam detection
        const spamScore = detectSpam(content, authorEmail)
        const isSpam = spamScore > 0.7

        if (isSpam) {
            await logSpam(
                authorEmail,
                clientIP,
                'spam_keywords',
                'high',
                content.substring(0, 500)
            )
            logWarn({ method: 'POST', path: PATH, extra: { reason: 'Spam detected', spamScore, ip: clientIP } })
        }

        // 6. Trim and validate content
        const trimmedContent = content.trim()
        if (trimmedContent.length < 5 || trimmedContent.length > 2000) {
            logWarn({ method: 'POST', path: PATH, status: 400, extra: { reason: 'Content length invalid', length: trimmedContent.length } })
            return NextResponse.json(
                { error: 'Comment must be between 5 and 2000 characters' },
                { status: 400 }
            )
        }

        // 7. Create comment
        const comment = await prisma.comment.create({
            data: {
                postSlug,
                authorName: authorName.trim(),
                authorEmail: authorEmail.toLowerCase().trim(),
                content: trimmedContent,
                status: isSpam ? 'SPAM' : 'PENDING',
                spamScore,
                ipAddress: clientIP,
                userAgent: request.headers.get('user-agent') || '',
                parentId: parentId || null,
            },
        })

        logSuccess({ method: 'POST', path: PATH, status: 201, durationMs: t.ms(), extra: { commentId: comment.id, postSlug, status: comment.status } })
        return NextResponse.json(
            {
                message: 'Comment submitted successfully',
                commentId: comment.id,
                status: isSpam ? 'SPAM' : 'PENDING',
            },
            { status: 201 }
        )
    } catch (error) {
        logError({ method: 'POST', path: PATH, error })
        return NextResponse.json(
            { error: 'Failed to submit comment' },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    const t = createTimer()
    const { searchParams } = new URL(request.url)
    const postSlug = searchParams.get('postSlug')
    logRequest('GET', PATH, { postSlug })

    try {
        if (!postSlug) {
            logWarn({ method: 'GET', path: PATH, status: 400, extra: { reason: 'Missing postSlug param' } })
            return NextResponse.json(
                { error: 'postSlug parameter required' },
                { status: 400 }
            )
        }

        const comments = await prisma.comment.findMany({
            where: {
                postSlug,
                status: 'APPROVED',
            },
            select: {
                id: true,
                authorName: true,
                content: true,
                createdAt: true,
                replies: {
                    where: { status: 'APPROVED' },
                    select: {
                        id: true,
                        authorName: true,
                        content: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        })

        logSuccess({ method: 'GET', path: PATH, durationMs: t.ms(), extra: { postSlug, returned: comments.length } })
        return NextResponse.json(comments, { status: 200 })
    } catch (error) {
        logError({ method: 'GET', path: PATH, error, extra: { postSlug } })
        return NextResponse.json(
            { error: 'Failed to fetch comments' },
            { status: 500 }
        )
    }
}
