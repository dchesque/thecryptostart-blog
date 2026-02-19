import { prisma } from './prisma'

/**
 * Validates email format
 */
export function validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
}

/**
 * Gets real client IP from request headers
 */
export function getClientIP(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for')
    if (forwarded) {
        return forwarded.split(',')[0].trim()
    }
    return '127.0.0.1'
}

/**
 * Simple rate limiting: Max 5 comments per hour per IP/Email
 */
export async function checkRateLimit(ip: string, email: string): Promise<boolean> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

    const count = await prisma.comment.count({
        where: {
            OR: [
                { ipAddress: ip },
                { authorEmail: email }
            ],
            createdAt: {
                gte: oneHourAgo
            }
        }
    })

    return count < 5
}

/**
 * Detects spam based on keywords, links and character patterns
 * Returns a score between 0 and 1
 */
export function detectSpam(content: string, email: string): number {
    let score = 0
    const normalizedContent = content.toLowerCase()

    // 1. Spam keywords
    const spamKeywords = ['crypto return', 'guaranteed profit', 'buy tokens', 'invest now', 'sex', 'casino', 'lottery', 'viagra']
    spamKeywords.forEach(keyword => {
        if (normalizedContent.includes(keyword)) score += 0.3
    })

    // 2. Excessive links
    const links = content.match(/https?:\/\/[^\s]+/g) || []
    if (links.length > 2) score += 0.4
    if (links.length > 5) score += 0.6

    // 3. Excessive CAPS
    const capsCount = (content.match(/[A-Z]/g) || []).length
    if (content.length > 20 && capsCount / content.length > 0.5) score += 0.3

    // 4. Multiple exclamation marks
    if (/!!!/.test(content)) score += 0.2

    // 5. Short and generic
    if (content.length < 10 && (normalizedContent.includes('nice') || normalizedContent.includes('thanks'))) {
        score += 0.2
    }

    return Math.min(score, 1)
}
