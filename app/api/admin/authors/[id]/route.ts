import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { authorSchema } from '@/lib/validations/admin'
import { handleApiError } from '@/lib/api-error'
import { checkApiAuth } from '@/lib/auth-check'
import { z } from 'zod'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authError = await checkApiAuth(req)
    if (authError) return authError

    try {
        const { id } = await params
        const author = await prisma.author.findUnique({
            where: { id }
        })

        if (!author) {
            return NextResponse.json({ error: 'Author not found' }, { status: 404 })
        }

        return NextResponse.json(author)
    } catch (error) {
        return handleApiError(error, 'Author')
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
        const data = authorSchema.parse(body)

        const author = await prisma.author.update({
            where: { id },
            data
        })

        revalidatePath('/')
        revalidatePath('/blog')
        revalidatePath('/sitemap.xml')

        return NextResponse.json(author)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: (error as any).errors }, { status: 400 })
        }
        return handleApiError(error, 'Author')
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
        await prisma.author.delete({
            where: { id }
        })

        revalidatePath('/')
        revalidatePath('/blog')
        revalidatePath('/sitemap.xml')

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        return handleApiError(error, 'Author')
    }
}
