import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const [total, published, future, categories] = await Promise.all([
            prisma.post.count(),
            prisma.post.count({ where: { status: 'PUBLISHED' } }),
            prisma.post.count({ 
                where: { 
                    status: 'PUBLISHED',
                    publishDate: { gt: new Date() } 
                } 
            }),
            prisma.category.count()
        ])

        return NextResponse.json({
            total,
            published,
            future,
            categories,
            now: new Date().toISOString()
        })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
