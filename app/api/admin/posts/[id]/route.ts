import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { postSchema } from '@/lib/validations/admin'
import { PrismaClientKnownRequestError, PrismaClientInitializationError } from '@prisma/client/runtime/library'
import { z } from 'zod'
import { logRequest, logSuccess, logWarn, logError, createTimer } from '@/lib/logger'

const PATH = '/api/admin/posts/[id]'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const t = createTimer()
    const { id } = await params
    logRequest('GET', PATH, { id })

    try {
        const post = await prisma.post.findUnique({
            where: { id },
            include: {
                category: { select: { id: true, name: true, slug: true } },
                author: { select: { id: true, name: true, slug: true } }
            }
        })

        if (!post) {
            logWarn({ method: 'GET', path: PATH, status: 404, extra: { id, reason: 'Post not found' } })
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }

        logSuccess({ method: 'GET', path: PATH, status: 200, durationMs: t.ms(), extra: { id } })
        return NextResponse.json(post)
    } catch (error) {
        logError({ method: 'GET', path: PATH, error, extra: { id } })
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const t = createTimer()
    const { id } = await params
    logRequest('PUT', PATH, { id })

    try {
        let body: any
        try {
            body = await req.json()
        } catch {
            logWarn({ method: 'PUT', path: PATH, status: 400, extra: { id, reason: 'Invalid JSON body' } })
            return NextResponse.json({ error: 'Invalid or empty JSON body' }, { status: 400 })
        }
        const data = postSchema.parse(body)

        const [author, category] = await Promise.all([
            prisma.author.findUnique({ where: { id: data.authorId }, select: { id: true } }),
            prisma.category.findUnique({ where: { id: data.categoryId }, select: { id: true } }),
        ])

        if (!author) {
            logWarn({ method: 'PUT', path: PATH, status: 400, extra: { id, reason: 'Invalid authorId' } })
            return NextResponse.json({ error: 'Invalid authorId' }, { status: 400 })
        }

        if (!category) {
            logWarn({ method: 'PUT', path: PATH, status: 400, extra: { id, reason: 'Invalid categoryId' } })
            return NextResponse.json({ error: 'Invalid categoryId' }, { status: 400 })
        }

        const post = await prisma.post.update({
            where: { id },
            data
        })

        logSuccess({ method: 'PUT', path: PATH, status: 200, durationMs: t.ms(), extra: { id } })
        return NextResponse.json(post)
    } catch (error) {
        if (error instanceof z.ZodError) {
            logWarn({ method: 'PUT', path: PATH, status: 400, extra: { id, reason: 'Validation error', errors: (error as any).errors } })
            return NextResponse.json({ error: (error as any).errors }, { status: 400 })
        }
        if (error instanceof PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                logWarn({ method: 'PUT', path: PATH, status: 404, extra: { id, reason: 'Post not found', prismaCode: error.code } })
                return NextResponse.json({ error: 'Post not found' }, { status: 404 })
            }
            if (error.code === 'P2002') {
                logWarn({ method: 'PUT', path: PATH, status: 409, extra: { id, reason: 'Slug conflict', prismaCode: error.code } })
                return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
            }
            if (error.code === 'P2003') {
                logWarn({ method: 'PUT', path: PATH, status: 400, extra: { id, reason: 'Invalid FK reference', prismaCode: error.code } })
                return NextResponse.json({ error: 'Invalid relational reference (author/category)' }, { status: 400 })
            }
        }
        if (error instanceof PrismaClientInitializationError) {
            logError({ method: 'PUT', path: PATH, status: 503, error, extra: { id, reason: 'DB connection failed' } })
            return NextResponse.json({ error: 'Database connection failed' }, { status: 503 })
        }
        logError({ method: 'PUT', path: PATH, error, extra: { id } })
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const t = createTimer()
    const { id } = await params
    logRequest('DELETE', PATH, { id })

    try {
        await prisma.post.delete({
            where: { id }
        })

        logSuccess({ method: 'DELETE', path: PATH, status: 204, durationMs: t.ms(), extra: { id } })
        return new NextResponse(null, { status: 204 })
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
            logWarn({ method: 'DELETE', path: PATH, status: 404, extra: { id, reason: 'Post not found' } })
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }
        if (error instanceof PrismaClientInitializationError) {
            logError({ method: 'DELETE', path: PATH, status: 503, error, extra: { id } })
            return NextResponse.json({ error: 'Database connection failed' }, { status: 503 })
        }
        logError({ method: 'DELETE', path: PATH, error, extra: { id } })
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
