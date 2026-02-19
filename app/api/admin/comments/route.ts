import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
// import { auth } from '@/auth' // Assume auth exists

export async function GET(req: NextRequest) {
    // const session = await auth()
    // if (!session || session.user.role !== 'ADMIN') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20
    const skip = (page - 1) * limit

    try {
        const whereClause: any = {}
        if (status && status !== 'all') {
            whereClause.status = status.toUpperCase()
        }

        const [comments, total] = await Promise.all([
            prisma.comment.findMany({
                where: whereClause,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    post: { select: { title: true } }
                }
            }),
            prisma.comment.count({ where: whereClause })
        ])

        return NextResponse.json({
            comments,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            }
        })
    } catch (error) {
        console.error('Admin API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
