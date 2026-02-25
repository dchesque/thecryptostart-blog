import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { categorySchema } from '@/lib/validations/admin'
import { z } from 'zod'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    try {
        const [categories, total] = await Promise.all([
            prisma.category.findMany({
                orderBy: { order: 'asc' },
                skip,
                take: limit,
                include: {
                    _count: {
                        select: { posts: true }
                    }
                }
            }),
            prisma.category.count()
        ])

        return NextResponse.json({
            categories,
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
        const data = categorySchema.parse(body)

        const category = await prisma.category.create({
            data
        })

        return NextResponse.json(category, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: (error as any).errors }, { status: 400 })
        }
        console.error('API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
