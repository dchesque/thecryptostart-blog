import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api-error'
import { checkApiAuth } from '@/lib/auth-check'
import { dispatchWebhook } from '@/lib/webhooks'

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
            select: {
                id: true,
                status: true,
                publishDate: true,
                slug: true,
                title: true,
                excerpt: true,
                category: { select: { slug: true, name: true } },
                author: { select: { name: true, slug: true } },
            }
        })

        revalidatePath('/')
        revalidatePath('/blog')
        revalidatePath('/sitemap.xml')
        revalidatePath(`/blog/${post.slug}`)

        // Fire-and-forget webhook dispatch. Failure must NOT block the API.
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || ''
        dispatchWebhook({
            type: publish ? 'post.published' : 'post.unpublished',
            occurredAt: new Date().toISOString(),
            data: {
                id: post.id,
                slug: post.slug,
                title: post.title,
                excerpt: post.excerpt,
                url: siteUrl ? `${siteUrl}/blog/${post.slug}` : undefined,
                publishDate: post.publishDate?.toISOString() ?? null,
                category: post.category,
                author: post.author,
            },
        }).catch(() => {})

        return NextResponse.json(post)
    } catch (error) {
        return handleApiError(error, 'Post')
    }
}
