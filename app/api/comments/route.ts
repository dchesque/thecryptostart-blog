import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
    validateEmail,
    getClientIP,
    checkRateLimit,
    detectSpam,
    logSpam,
} from '@/lib/spam-prevention'

const HONEYPOT_FIELD = 'website'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { postSlug, authorName, authorEmail, content, website, parentId } = body

        // 1. Validate required fields
        if (!postSlug || !authorName || !authorEmail || !content) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const clientIP = getClientIP(request)

        // 2. Honeypot check (if filled, it's a bot)
        if (website && website.trim() !== '') {
            await logSpam(authorEmail, clientIP, 'honeypot', 'high')
            // Return success but don't save (trick bots)
            return NextResponse.json(
                { message: 'Comment submitted', success: true },
                { status: 201 }
            )
        }

        // 3. Validate email format
        if (!validateEmail(authorEmail)) {
            await logSpam(authorEmail, clientIP, 'invalid_email', 'medium')
            return NextResponse.json(
                { error: 'Invalid email address' },
                { status: 400 }
            )
        }

        // 4. Rate limiting check
        const isAllowed = await checkRateLimit(clientIP, authorEmail)
        if (!isAllowed) {
            await logSpam(authorEmail, clientIP, 'rate_limit', 'medium')
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
        }

        // 6. Trim and validate content
        const trimmedContent = content.trim()
        if (trimmedContent.length < 5 || trimmedContent.length > 2000) {
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

        return NextResponse.json(
            {
                message: 'Comment submitted successfully',
                commentId: comment.id,
                status: isSpam ? 'SPAM' : 'PENDING',
            },
            { status: 201 }
        )
    } catch (error) {
        console.error('Comment submission error:', error)
        return NextResponse.json(
            { error: 'Failed to submit comment' },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const postSlug = searchParams.get('postSlug')

        if (!postSlug) {
            return NextResponse.json(
                { error: 'postSlug parameter required' },
                { status: 400 }
            )
        }

        // Fetch approved comments only (public API)
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

        return NextResponse.json(comments, { status: 200 })
    } catch (error) {
        console.error('Error fetching comments:', error)
        return NextResponse.json(
            { error: 'Failed to fetch comments' },
            { status: 500 }
        )
    }
}
