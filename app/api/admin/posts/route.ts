import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { postSchema } from '@/lib/validations/admin'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

export async function GET(req: NextRequest) {
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
        console.error('API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const data = postSchema.parse(body)

        const [author, category] = await Promise.all([
            prisma.author.findUnique({ where: { id: data.authorId }, select: { id: true } }),
            prisma.category.findUnique({ where: { id: data.categoryId }, select: { id: true } }),
        ])

        if (!author) {
            return NextResponse.json({ error: 'Invalid authorId' }, { status: 400 })
        }

        if (!category) {
            return NextResponse.json({ error: 'Invalid categoryId' }, { status: 400 })
        }

        const post = await prisma.post.create({
            data
        })

        return NextResponse.json(post, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: (error as any).errors }, { status: 400 })
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
            }
            if (error.code === 'P2003') {
                return NextResponse.json({ error: 'Invalid relational reference (author/category)' }, { status: 400 })
            }
        }
        if (error instanceof Prisma.PrismaClientInitializationError) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 503 })
        }
        console.error('API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
