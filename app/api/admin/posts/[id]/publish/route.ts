import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await req.json()
        const { publish } = body

        // publish is a boolean to indicating whether to publish or unpublish
        const status = publish ? 'PUBLISHED' : 'DRAFT'

        // Data contains also publishDate if it is moving to PUBLISHED
        const dataToUpdate: any = { status }
        if (publish) {
            dataToUpdate.publishDate = new Date()
        }

        const post = await prisma.post.update({
            where: { id },
            data: dataToUpdate,
            select: { id: true, status: true, publishDate: true }
        })

        return NextResponse.json(post)
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }
        if (error instanceof Prisma.PrismaClientInitializationError) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 503 })
        }
        console.error('API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
