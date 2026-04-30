import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { postSchema } from '@/lib/validations/admin'
import { handleApiError } from '@/lib/api-error'
import { z } from 'zod'
import { checkApiAuth } from '@/lib/auth-check'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authError = await checkApiAuth(req)
    if (authError) return authError

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
        return handleApiError(error, 'Post')
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authError = await checkApiAuth(req)
    if (authError) return authError

    try {
        const { id } = await params
        const body = await req.json()
        const data = postSchema.parse(body)

        const previous = await prisma.post.findUnique({
            where: { id },
            select: { slug: true }
        })

        const post = await prisma.post.update({
            where: { id },
            data
        })

        revalidatePath('/')
        revalidatePath('/blog')
        revalidatePath('/sitemap.xml')
        revalidatePath(`/blog/${post.slug}`)
        if (previous && previous.slug !== post.slug) {
            revalidatePath(`/blog/${previous.slug}`)
        }

        return NextResponse.json(post)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: (error as any).errors }, { status: 400 })
        }
        return handleApiError(error, 'Post')
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authError = await checkApiAuth(req)
    if (authError) return authError

    try {
        const { id } = await params
        const removed = await prisma.post.delete({
            where: { id },
            select: { slug: true }
        })

        revalidatePath('/')
        revalidatePath('/blog')
        revalidatePath('/sitemap.xml')
        revalidatePath(`/blog/${removed.slug}`)

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        return handleApiError(error, 'Post')
    }
}
