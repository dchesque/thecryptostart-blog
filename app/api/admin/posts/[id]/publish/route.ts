import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api-error'
import { checkApiAuth } from '@/lib/auth-check'

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authError = await checkApiAuth(req)
    if (authError) return authError

    try {
        const { id } = await params
        const body = await req.json()
        const { publish } = body

        const status = publish ? 'PUBLISHED' : 'DRAFT'

        const dataToUpdate: any = { status }
        if (publish) {
            dataToUpdate.publishDate = new Date()
        }

        const post = await prisma.post.update({
            where: { id },
            data: dataToUpdate,
            select: { id: true, status: true, publishDate: true, slug: true }
        })

        revalidatePath('/')
        revalidatePath('/blog')
        revalidatePath('/sitemap.xml')
        revalidatePath(`/blog/${post.slug}`)

        return NextResponse.json(post)
    } catch (error) {
        return handleApiError(error, 'Post')
    }
}
