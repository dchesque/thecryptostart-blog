import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { categorySchema } from '@/lib/validations/admin'
import { handleApiError } from '@/lib/api-error'
import { z } from 'zod'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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
    try {
        const { id } = await params
        const body = await req.json()
        const data = categorySchema.parse(body)

        const category = await prisma.category.update({
            where: { id },
            data
        })

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
    try {
        const { id } = await params
        await prisma.category.delete({
            where: { id }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        return handleApiError(error, 'Category')
    }
}
