import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorSchema } from '@/lib/validations/admin'
import { z } from 'zod'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    try {
        const [authors, total] = await Promise.all([
            prisma.author.findMany({
                orderBy: { name: 'asc' },
                skip,
                take: limit,
                include: {
                    _count: {
                        select: { posts: true }
                    }
                }
            }),
            prisma.author.count()
        ])

        return NextResponse.json({
            authors,
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
        const data = authorSchema.parse(body)

        const author = await prisma.author.create({
            data
        })

        return NextResponse.json(author, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: (error as any).errors }, { status: 400 })
        }
        console.error('API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
