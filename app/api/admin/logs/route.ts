import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '50')
        const level = searchParams.get('level')

        let logs = []
        try {
            logs = await (prisma as any).systemLog.findMany({
                where: level ? { level } : {},
                orderBy: { createdAt: 'desc' },
                take: limit,
            })
        } catch (err) {
            console.warn('[LogsAPI] SystemLog table might be missing:', err instanceof Error ? err.message : err)
            // Retorna vazio em vez de 500 se a tabela não existir
        }

        return NextResponse.json(logs)
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}
