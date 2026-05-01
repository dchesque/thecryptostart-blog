import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { postSchema } from '@/lib/validations/admin'
import { handleApiError } from '@/lib/api-error'
import { z } from 'zod'
import { checkApiAuth } from '@/lib/auth-check'
import { calculateWordCount, calculateReadingTime } from '@/lib/posts'

function ensureMetrics(data: z.infer<typeof postSchema>) {
    const wc = data.wordCount && data.wordCount > 0
        ? data.wordCount
        : calculateWordCount(data.content || '')
    const rt = data.readingTime && data.readingTime > 0
        ? data.readingTime
        : calculateReadingTime(wc)
    return { ...data, wordCount: wc, readingTime: rt }
}

export async function GET(req: NextRequest) {
    const authError = await checkApiAuth(req)
    if (authError) return authError

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const skip = (page - 1) * limit

    try {
        const whereClause: any = {}

        if (status && status !== 'all') {
            whereClause.status = status.toUpperCase()
        }

        if (category) {
            whereClause.categoryId = category
        }

        if (search) {
            whereClause.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { slug: { contains: search, mode: 'insensitive' } },
            ]
        }

        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where: whereClause,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    category: { select: { id: true, name: true, slug: true } },
                    author: { select: { id: true, name: true } }
                }
            }),
            prisma.post.count({ where: whereClause })
        ])

        return NextResponse.json({
            posts,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            }
        })
    } catch (error) {
        return handleApiError(error, 'Post')
    }
}

export async function POST(req: NextRequest) {
    try {
        const authError = await checkApiAuth(req)
        if (authError) return authError

        const body = await req.json()
        const data = ensureMetrics(postSchema.parse(body))

        const post = await prisma.post.create({
            data
        })

        return NextResponse.json(post, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: (error as any).errors }, { status: 400 })
        }
        return handleApiError(error, 'Post')
    }
}
