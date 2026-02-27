import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { postSchema } from '@/lib/validations/admin'
import { PrismaClientKnownRequestError, PrismaClientInitializationError } from '@prisma/client/runtime/library'
import { z } from 'zod'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const post = await prisma.post.findUnique({
            where: { id },
            include: {
                category: { select: { id: true, name: true, slug: true } },
                author: { select: { id: true, name: true, slug: true } }
            }
        })

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }

        return NextResponse.json(post)
    } catch (error) {
        console.error('API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        let body: any
        try {
            body = await req.json()
        } catch {
            return NextResponse.json({ error: 'Invalid or empty JSON body' }, { status: 400 })
        }
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

        const post = await prisma.post.update({
            where: { id },
            data
        })

        return NextResponse.json(post)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: (error as any).errors }, { status: 400 })
        }
        if (error instanceof PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return NextResponse.json({ error: 'Post not found' }, { status: 404 })
            }
            if (error.code === 'P2002') {
                return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
            }
            if (error.code === 'P2003') {
                return NextResponse.json({ error: 'Invalid relational reference (author/category)' }, { status: 400 })
            }
        }
        if (error instanceof PrismaClientInitializationError) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 503 })
        }
        console.error('API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        await prisma.post.delete({
            where: { id }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }
        if (error instanceof PrismaClientInitializationError) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 503 })
        }
        console.error('API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
