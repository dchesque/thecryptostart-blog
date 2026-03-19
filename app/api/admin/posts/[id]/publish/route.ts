import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api-error'

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await req.json()
        const { publish } = body

        // publish is a boolean indicating whether to publish or unpublish
        const status = publish ? 'PUBLISHED' : 'DRAFT'

        // Data contains also publishDate if it is moving to PUBLISHED
        const dataToUpdate: any = { status }
        if (publish) {
            dataToUpdate.publishDate = new Date()
        }

        const post = await prisma.post.update({
            where: { id },
            data: dataToUpdate,
            // Fetch slug to invalidate the individual post page cache
            select: { id: true, status: true, publishDate: true, slug: true }
        })

        // Invalidar cache ISR das páginas que listam posts
        revalidatePath('/')
        revalidatePath('/blog')
        revalidatePath(`/blog/${post.slug}`)

        return NextResponse.json(post)
    } catch (error) {
        return handleApiError(error, 'Post')
    }
}
