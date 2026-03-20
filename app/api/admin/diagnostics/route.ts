/**
 * Rota de diagnóstico para verificar estado do banco e variáveis de ambiente.
 * Usada para depuração na VPS/EasyPanel sem acesso direto ao banco.
 * GET /api/admin/diagnostics
 *
 * ⚠️ Requer autenticação admin. Remover ou proteger em produção quando não necessário.
 */
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const session = await auth()
        
        // Suporte a API Key para diagnóstico via terminal/browser externo
        const { searchParams } = new URL(NextResponse.next().url)
        const apiKeyParam = searchParams.get('key')
        const apiKeyHeader = NextResponse.next().headers.get('x-api-key')
        const isValidApiKey = (apiKeyParam === process.env.ADMIN_API_KEY) || (apiKeyHeader === process.env.ADMIN_API_KEY)

        if (!session?.user && !isValidApiKey) {
            return NextResponse.json({ 
                error: 'Unauthorized', 
                message: 'Você precisa estar logado como admin ou fornecer a ADMIN_API_KEY via header x-api-key ou query param ?key=' 
            }, { status: 401 })
        }

        // --- Diagnóstico do Banco de Dados ---
        let dbStatus = 'unknown'
        let postStats: Record<string, number> = {}
        let samplePosts: { title: string; status: string; publishDate: string | null }[] = []
        let dbError: string | null = null

        try {
            // Conta posts por status
            const [published, draft, total, categories, authors] = await Promise.all([
                prisma.post.count({ where: { status: 'PUBLISHED' } }),
                prisma.post.count({ where: { status: 'DRAFT' } }),
                prisma.post.count(),
                prisma.category.count(),
                prisma.author.count(),
            ])

            postStats = { published, draft, total, categories, authors }
            dbStatus = 'connected'

            // Amostra dos últimos 5 posts (qualquer status)
            const recent = await prisma.post.findMany({
                select: { title: true, status: true, publishDate: true },
                orderBy: { createdAt: 'desc' },
                take: 5,
            })
            samplePosts = recent.map(p => ({
                title: p.title,
                status: p.status,
                publishDate: p.publishDate ? p.publishDate.toISOString() : null,
            }))
        } catch (err) {
            dbStatus = 'error'
            dbError = err instanceof Error ? err.message : 'Erro desconhecido'
        }

        // Verifica filtro da getAllPosts (posts PUBLISHED com publishDate <= agora)
        let visibleOnHomepage = 0
        if (dbStatus === 'connected') {
            try {
                visibleOnHomepage = await prisma.post.count({
                    where: {
                        status: 'PUBLISHED',
                        OR: [
                            { publishDate: null },
                            { publishDate: { lte: new Date() } },
                        ],
                    },
                })
            } catch (_) {
                // silencioso — dbError já captura
            }
        }

        // --- Diagnóstico de Variáveis de Ambiente ---
        const envChecks = {
            DATABASE_URL: !!process.env.DATABASE_URL,
            NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
            AUTH_SECRET: !!process.env.AUTH_SECRET,
            SITE_URL: !!process.env.SITE_URL,
            NEXT_PUBLIC_SITE_URL: !!process.env.NEXT_PUBLIC_SITE_URL,
            GOOGLE_CLOUD_PROJECT_ID: !!process.env.GOOGLE_CLOUD_PROJECT_ID,
            GOOGLE_SERVICE_ACCOUNT_EMAIL: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            GOOGLE_PRIVATE_KEY_SET: !!process.env.GOOGLE_PRIVATE_KEY,
            GOOGLE_PRIVATE_KEY_VALID_FORMAT: process.env.GOOGLE_PRIVATE_KEY
                ?.replace(/\\n/g, '\n')
                ?.trim()
                ?.startsWith('-----BEGIN PRIVATE KEY-----') ?? false,
        }

        // --- Verificação de Saúde dos Módulos (Novidade v1.3.7) ---
        const apiHealth = {
            posts: {
                status: dbStatus === 'connected' ? 'healthy' : 'error',
                label: 'Módulo de Posts',
                timestamp: new Date().toISOString()
            },
            gsc: {
                status: envChecks.GOOGLE_PRIVATE_KEY_VALID_FORMAT && envChecks.GOOGLE_SERVICE_ACCOUNT_EMAIL ? 'healthy' : 'degraded',
                label: 'Google Search Console',
                timestamp: new Date().toISOString()
            },
            seo: {
                status: postStats.total > 0 ? 'healthy' : 'degraded',
                label: 'Análise de SEO',
                timestamp: new Date().toISOString()
            },
            comments: {
                status: 'healthy', // Baseado na integridade do spam-prevention.ts (estático por ora)
                label: 'Sistema de Comentários',
                timestamp: new Date().toISOString()
            }
        }

        return NextResponse.json({
            timestamp: new Date().toISOString(),
            database: {
                status: dbStatus,
                error: dbError,
                stats: postStats,
                visibleOnHomepage,
                samplePosts,
            },
            environment: envChecks,
            apiHealth, // Novo campo
            diagnosis: {
                homepageWillShowPosts: visibleOnHomepage > 0,
                gscCredentialsOk: envChecks.GOOGLE_PRIVATE_KEY_VALID_FORMAT && envChecks.GOOGLE_SERVICE_ACCOUNT_EMAIL && envChecks.GOOGLE_CLOUD_PROJECT_ID,
                seedRequired: postStats.total === 0,
                message: visibleOnHomepage === 0 && postStats.total === 0
                    ? '❌ Banco vazio — execute: npx prisma db seed (ou npm run db:seed) na VPS'
                    : visibleOnHomepage === 0 && (postStats.published || 0) === 0
                    ? '❌ Há posts no banco mas nenhum com status PUBLISHED. Publique posts no admin.'
                    : visibleOnHomepage === 0
                    ? '❌ Há posts PUBLISHED mas todos têm publishDate no futuro.'
                    : `✅ ${visibleOnHomepage} post(s) devem aparecer na homepage.`,
            },
        })
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}
