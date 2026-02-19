import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    try {
        const body = await req.json()
        const { status } = body

        if (!['APPROVED', 'REJECTED', 'SPAM'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
        }

        const comment = await prisma.comment.update({
            where: { id },
            data: {
                status: status as any,
                modifiedAt: new Date(),
                modifiedBy: 'ADMIN' // Temporal until auth is wired
            }
        })

        return NextResponse.json(comment)
    } catch (error) {
        console.error('Admin PATCH Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    try {
        // Delete comment and its replies
        await prisma.comment.deleteMany({
            where: {
                OR: [
                    { id },
                    { parentId: id }
                ]
            }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('Admin DELETE Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
