import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { categorySchema } from '@/lib/validations/admin'
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
        const category = await prisma.category.findUnique({
            where: { id }
        })

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 })
        }

        return NextResponse.json(category)
    } catch (error) {
        return handleApiError(error, 'Category')
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
        const data = categorySchema.parse(body)

        const category = await prisma.category.update({
            where: { id },
            data
        })

        revalidatePath('/')
        revalidatePath('/blog')
        revalidatePath('/sitemap.xml')

        return NextResponse.json(category)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: (error as any).errors }, { status: 400 })
        }
        return handleApiError(error, 'Category')
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
        await prisma.category.delete({
            where: { id }
        })

        revalidatePath('/')
        revalidatePath('/blog')
        revalidatePath('/sitemap.xml')

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        return handleApiError(error, 'Category')
    }
}
