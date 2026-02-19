import { prisma } from './prisma'
import { NextRequest } from 'next/server'

const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour
const MAX_COMMENTS_PER_HOUR = 5
const MIN_COMMENT_LENGTH = 5
const MAX_COMMENT_LENGTH = 2000

// Spam keywords (common spam patterns)
const SPAM_KEYWORDS = [
    'viagra', 'cialis', 'casino', 'poker', 'betting', 'lottery', 'forex',
    'quick money', 'bitcoin mining', 'click here', 'buy now', 'limited offer',
    'act now', 'call now', 'free money', 'get rich', 'work from home',
    'amazing offer', 'incredible deal', 'guaranteed', 'make $', 'earn $',
    'crypto return', 'guaranteed profit', 'buy tokens', 'invest now', 'sex'
]

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(email: string): boolean {
    return EMAIL_REGEX.test(email) && email.length < 255
}

export function getClientIP(request: Request | NextRequest): string {
    const headers = request instanceof NextRequest ? request.headers : (request as Request).headers
    return (
        headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        headers.get('x-real-ip') ||
        headers.get('cf-connecting-ip') ||
        '127.0.0.1'
    )
}

export async function checkRateLimit(
    ipAddress: string,
    email: string
): Promise<boolean> {
    try {
        const oneHourAgo = new Date(Date.now() - RATE_LIMIT_WINDOW)

        const recentCount = await prisma.comment.count({
            where: {
                OR: [
                    { ipAddress, createdAt: { gte: oneHourAgo } },
                    { authorEmail: email, createdAt: { gte: oneHourAgo } },
                ],
            },
        })

        return recentCount < MAX_COMMENTS_PER_HOUR
    } catch (error) {
        console.error('Rate limit check error:', error)
        return true // Allow on error to avoid blocking legitimate users
    }
}

export function detectSpam(content: string, email: string): number {
    let score = 0
    const lowerContent = content.toLowerCase()

    // 1. Check length
    if (content.length < MIN_COMMENT_LENGTH) score += 0.5
    if (content.length > MAX_COMMENT_LENGTH) score += 0.3

    // 2. Check for spam keywords
    SPAM_KEYWORDS.forEach(keyword => {
        if (lowerContent.includes(keyword)) score += 0.15
    })

    // 3. Check for excessive links
    const linkCount = (content.match(/https?:\/\//g) || []).length
    if (linkCount > 2) score += 0.3
    if (linkCount > 5) score += 0.4

    // 4. Check for excessive caps (more than 30% caps)
    const capsCount = (content.match(/[A-Z]/g) || []).length
    if (content.length > 20) {
        const capsRatio = capsCount / content.length
        if (capsRatio > 0.3) score += 0.15
        if (capsRatio > 0.5) score += 0.25
    }

    // 5. Check for excessive punctuation
    const exclamationCount = (content.match(/!/g) || []).length
    if (exclamationCount > 3) score += 0.1
    if (exclamationCount > 10) score += 0.3

    const questionCount = (content.match(/\?/g) || []).length
    if (questionCount > 5) score += 0.1

    // 6. Check for multiple consecutive characters (repetitive)
    if (/(.)\1{4,}/.test(content)) score += 0.2

    // 7. Email red flags
    if (email.includes('@test') || email.includes('@fake')) score += 0.4

    return Math.min(score, 1) // Cap at 1.0
}

export async function logSpam(
    email: string,
    ipAddress: string | null,
    reason: string,
    severity: string = 'low',
    content?: string
) {
    try {
        await prisma.spamLog.create({
            data: {
                authorEmail: email,
                ipAddress: ipAddress || 'unknown',
                reason,
                severity,
                content,
            },
        })
    } catch (error) {
        console.error('Error logging spam:', error)
    }
}
