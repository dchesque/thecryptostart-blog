import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorSchema } from '@/lib/validations/admin'
import { z } from 'zod'

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const author = await prisma.author.findUnique({
            where: { id: params.id }
        })

        if (!author) {
            return NextResponse.json({ error: 'Author not found' }, { status: 404 })
        }

        return NextResponse.json(author)
    } catch (error) {
        console.error('API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await req.json()
        const data = authorSchema.parse(body)

        const author = await prisma.author.update({
            where: { id: params.id },
            data
        })

        return NextResponse.json(author)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: (error as any).errors }, { status: 400 })
        }
        console.error('API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.author.delete({
            where: { id: params.id }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
