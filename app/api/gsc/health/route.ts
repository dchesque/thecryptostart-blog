/**
 * Health check das credenciais do Google Search Console.
 * GET /api/gsc/health
 *
 * Valida as variáveis de ambiente sem fazer chamadas reais à API do Google
 * (sem consumo de cota). Usar para diagnóstico antes de acessar /api/gsc/analytics.
 */
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

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

        const rawKey = process.env.GOOGLE_PRIVATE_KEY
        const processedKey = rawKey
            ?.replace(/\\\\n/g, '\n')
            ?.replace(/\\n/g, '\n')
            ?.trim()

        const checks = {
            GOOGLE_CLOUD_PROJECT_ID: !!process.env.GOOGLE_CLOUD_PROJECT_ID,
            GOOGLE_SERVICE_ACCOUNT_EMAIL: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            GOOGLE_PRIVATE_KEY_SET: !!rawKey,
            GOOGLE_PRIVATE_KEY_VALID_FORMAT: processedKey?.startsWith('-----BEGIN PRIVATE KEY-----') ?? false,
            SITE_URL: !!process.env.SITE_URL,
        }

        const allPassed = Object.values(checks).every(Boolean)

        const diagnosis: string[] = []
        if (!checks.GOOGLE_CLOUD_PROJECT_ID) diagnosis.push('❌ GOOGLE_CLOUD_PROJECT_ID ausente')
        if (!checks.GOOGLE_SERVICE_ACCOUNT_EMAIL) diagnosis.push('❌ GOOGLE_SERVICE_ACCOUNT_EMAIL ausente')
        if (!checks.GOOGLE_PRIVATE_KEY_SET) diagnosis.push('❌ GOOGLE_PRIVATE_KEY ausente')
        if (checks.GOOGLE_PRIVATE_KEY_SET && !checks.GOOGLE_PRIVATE_KEY_VALID_FORMAT) {
            diagnosis.push(
                '❌ GOOGLE_PRIVATE_KEY presente mas malformada. ' +
                'Remova as aspas duplas no EasyPanel e garanta que os \\n estejam como texto literal.'
            )
        }
        if (!checks.SITE_URL) diagnosis.push('⚠️ SITE_URL ausente (usando valor padrão)')
        if (allPassed) diagnosis.push('✅ Todas as credenciais GSC estão configuradas corretamente.')

        return NextResponse.json(
            {
                status: allPassed ? 'healthy' : 'degraded',
                checks,
                diagnosis,
                timestamp: new Date().toISOString(),
            },
            { status: allPassed ? 200 : 503 }
        )
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}
