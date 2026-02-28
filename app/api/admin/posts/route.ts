import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { postSchema } from '@/lib/validations/admin'
import { PrismaClientKnownRequestError, PrismaClientInitializationError } from '@prisma/client/runtime/library'
import { z } from 'zod'
import { logRequest, logSuccess, logWarn, logError, createTimer } from '@/lib/logger'

const PATH = '/api/admin/posts'

export async function GET(req: NextRequest) {
    const t = createTimer()
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const skip = (page - 1) * limit

    logRequest('GET', PATH, { page, limit, status, search, category })

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

        logSuccess({ method: 'GET', path: PATH, status: 200, durationMs: t.ms(), extra: { total, returned: posts.length } })
        return NextResponse.json({
            posts,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            }
        })
    } catch (error) {
        logError({ method: 'GET', path: PATH, error })
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const t = createTimer()
    logRequest('POST', PATH)

    try {
        let body: any
        try {
            body = await req.json()
        } catch {
            logWarn({ method: 'POST', path: PATH, status: 400, extra: { reason: 'Invalid JSON body' } })
            return NextResponse.json({ error: 'Invalid or empty JSON body' }, { status: 400 })
        }
        const data = postSchema.parse(body)

        logRequest('POST', PATH, { slug: data.slug, title: data.title })

        const [author, category] = await Promise.all([
            prisma.author.findUnique({ where: { id: data.authorId }, select: { id: true } }),
            prisma.category.findUnique({ where: { id: data.categoryId }, select: { id: true } }),
        ])

        if (!author) {
            logWarn({ method: 'POST', path: PATH, status: 400, extra: { reason: 'Invalid authorId', authorId: data.authorId } })
            return NextResponse.json({ error: 'Invalid authorId' }, { status: 400 })
        }

        if (!category) {
            logWarn({ method: 'POST', path: PATH, status: 400, extra: { reason: 'Invalid categoryId', categoryId: data.categoryId } })
            return NextResponse.json({ error: 'Invalid categoryId' }, { status: 400 })
        }

        // Ensure slug is unique — append numeric suffix if needed
        let uniqueSlug = data.slug
        let suffix = 2
        while (true) {
            const existing = await prisma.post.findUnique({ where: { slug: uniqueSlug }, select: { id: true } })
            if (!existing) break
            uniqueSlug = `${data.slug}-${suffix}`
            suffix++
        }

        if (uniqueSlug !== data.slug) {
            logWarn({ method: 'POST', path: PATH, extra: { reason: 'Slug collision resolved', original: data.slug, resolved: uniqueSlug } })
        }

        const post = await prisma.post.create({
            data: { ...data, slug: uniqueSlug }
        })

        logSuccess({ method: 'POST', path: PATH, status: 201, durationMs: t.ms(), extra: { postId: post.id, slug: uniqueSlug } })
        return NextResponse.json(post, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            logWarn({ method: 'POST', path: PATH, status: 400, extra: { reason: 'Validation error', errors: (error as any).errors } })
            return NextResponse.json({ error: (error as any).errors }, { status: 400 })
        }
        if ((error as any) instanceof PrismaClientKnownRequestError) {
            const e = error as PrismaClientKnownRequestError
            if (e.code === 'P2002') {
                logWarn({ method: 'POST', path: PATH, status: 409, extra: { reason: 'Slug constraint', prismaCode: e.code } })
                return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
            }
            if (e.code === 'P2003') {
                logWarn({ method: 'POST', path: PATH, status: 400, extra: { reason: 'Invalid FK reference', prismaCode: e.code } })
                return NextResponse.json({ error: 'Invalid relational reference (author/category)' }, { status: 400 })
            }
        }
        if ((error as any) instanceof PrismaClientInitializationError) {
            logError({ method: 'POST', path: PATH, status: 503, error, extra: { reason: 'DB connection failed' } })
            return NextResponse.json({ error: 'Database connection failed' }, { status: 503 })
        }
        logError({ method: 'POST', path: PATH, error })
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
