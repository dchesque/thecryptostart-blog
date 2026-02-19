# PROMPT ANTIGRAVITY — GOOGLE SEARCH CONSOLE INTEGRATION
## TheCryptoStart Blog — Implementação Completa da API + Dashboard

---

## 🎯 OBJETIVO

Implementar sistema completo de Google Search Console para:
- ✅ Monitorar impressões, cliques, CTR, posição
- ✅ Identificar queries com baixo CTR
- ✅ Rastrear erros de crawl
- ✅ Dashboard visual em /admin/gsc-dashboard
- ✅ API endpoint em /api/gsc/analytics

**Impacto**: +30% CTR optimization, +50% traffic discovery

---

## 📋 TAREFAS (8 TAREFAS - 6 HORAS)

### Tarefa 1: Analisar .context e Arquitetura

**O que fazer**:
1. Verificar estrutura existente:
   - app/api/ - padrão de API routes
   - app/admin/ - padrão de admin pages
   - lib/ - padrão de utilities
   - types/ - padrão de TypeScript interfaces

2. Entender:
   - Como auth funciona (NextAuth? Prisma?)
   - Como outros API endpoints estão estruturados
   - Pattern de error handling
   - Pattern de logging

3. Verificar package.json:
   - Qual versão de googleapis está instalada?
   - Existe dotenv?
   - Qual ORM usa (Prisma)?

---

### Tarefa 2: Criar `lib/gsc-client.ts`

**Arquivo**: `lib/gsc-client.ts` (NOVO)

**O que fazer**:
```typescript
/**
 * Google Search Console API Client
 * Conecta com GSC usando Service Account
 */

import { google } from 'googleapis'

export interface GSCQuery {
  query: string
  impressions: number
  clicks: number
  ctr: number
  position: number
}

export interface GSCPage {
  page: string
  impressions: number
  clicks: number
  ctr: number
  position: number
}

export interface GSCAnalytics {
  topQueries: GSCQuery[]
  topPages: GSCPage[]
  lowCTRPages: GSCPage[]
  totalImpressions: number
  totalClicks: number
  avgCTR: number
  avgPosition: number
}

export class GSCClient {
  private webmasters: any
  private siteUrl: string

  constructor(siteUrl: string) {
    this.siteUrl = siteUrl

    // Usar credentials do Google Cloud
    const auth = new google.auth.GoogleAuth({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    })

    this.webmasters = google.webmasters({ version: 'v3', auth })
  }

  /**
   * Obter top queries dos últimos 90 dias
   */
  async getTopQueries(days = 90, limit = 250): Promise<GSCQuery[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const response = await this.webmasters.searchanalytics.query({
      siteUrl: this.siteUrl,
      requestBody: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        dimensions: ['query'],
        rowLimit: limit,
      },
    })

    const rows = response.data.rows || []
    return rows.map((row: any) => ({
      query: row.keys[0],
      impressions: row.impressions,
      clicks: row.clicks,
      ctr: row.ctr,
      position: row.position,
    }))
  }

  /**
   * Obter top páginas dos últimos 90 dias
   */
  async getTopPages(days = 90, limit = 250): Promise<GSCPage[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const response = await this.webmasters.searchanalytics.query({
      siteUrl: this.siteUrl,
      requestBody: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        dimensions: ['page'],
        rowLimit: limit,
      },
    })

    const rows = response.data.rows || []
    return rows.map((row: any) => ({
      page: row.keys[0],
      impressions: row.impressions,
      clicks: row.clicks,
      ctr: row.ctr,
      position: row.position,
    }))
  }

  /**
   * Obter páginas com CTR baixo (< 5%)
   */
  async getLowCTRPages(ctrThreshold = 0.05): Promise<GSCPage[]> {
    const allPages = await this.getTopPages()
    return allPages
      .filter(p => p.ctr < ctrThreshold && p.impressions > 10)
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 50)
  }

  /**
   * Obter query x page matrix
   */
  async getQueryPageMatrix(days = 90, limit = 250): Promise<any[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const response = await this.webmasters.searchanalytics.query({
      siteUrl: this.siteUrl,
      requestBody: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        dimensions: ['query', 'page'],
        rowLimit: limit,
      },
    })

    return response.data.rows || []
  }

  /**
   * Obter erros de crawl
   */
  async getCrawlErrors(): Promise<any[]> {
    const response = await this.webmasters.urlcrawlErrorsCounts.query({
      siteUrl: this.siteUrl,
    })

    return response.data.countPerTypes || []
  }

  /**
   * Obter cover errors (páginas não indexadas)
   */
  async getCoverageErrors(): Promise<any> {
    const response = await this.webmasters.searchanalytics.query({
      siteUrl: this.siteUrl,
      requestBody: {
        dimensions: ['query'],
        rowLimit: 1, // Dummy query para trigger
      },
    })

    return response.data || {}
  }

  /**
   * Compilar analytics completo
   */
  async getAnalytics(): Promise<GSCAnalytics> {
    const [topQueries, topPages, lowCTRPages] = await Promise.all([
      this.getTopQueries(),
      this.getTopPages(),
      this.getLowCTRPages(),
    ])

    const totalImpressions = topQueries.reduce((sum, q) => sum + q.impressions, 0)
    const totalClicks = topQueries.reduce((sum, q) => sum + q.clicks, 0)
    const avgCTR = totalClicks / totalImpressions || 0
    const avgPosition = topQueries.reduce((sum, q) => sum + q.position, 0) / topQueries.length || 0

    return {
      topQueries,
      topPages,
      lowCTRPages,
      totalImpressions,
      totalClicks,
      avgCTR,
      avgPosition,
    }
  }
}

// Factory
export function createGSCClient(): GSCClient {
  const siteUrl = process.env.SITE_URL || 'https://cryptoacademy.example.com'
  return new GSCClient(siteUrl)
}
```

---

### Tarefa 3: Criar `/api/gsc/analytics/route.ts`

**Arquivo**: `app/api/gsc/analytics/route.ts` (NOVO)

**O que fazer**:
```typescript
/**
 * API Route para GSC Analytics
 * GET /api/gsc/analytics
 */

import { createGSCClient } from '@/lib/gsc-client'
import { NextResponse } from 'next/server'

// Rate limit (opcional)
const CACHE_TTL = 3600 // 1 hora em cache

export async function GET(request: Request) {
  try {
    // Verificar auth (adicionar depois)
    // const session = await getSession({ req })
    // if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const gsc = createGSCClient()

    // Buscar analytics
    const analytics = await gsc.getAnalytics()

    // Adicionar metadata
    const response = {
      ...analytics,
      lastFetched: new Date().toISOString(),
      dataPoints: {
        topQueriesCount: analytics.topQueries.length,
        topPagesCount: analytics.topPages.length,
        lowCTRPagesCount: analytics.lowCTRPages.length,
      },
      recommendations: generateRecommendations(analytics),
    }

    // Cache com revalidation
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': `public, max-age=${CACHE_TTL}`,
      },
    })
  } catch (error) {
    console.error('[GSC API Error]', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch GSC analytics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

function generateRecommendations(analytics: any) {
  const recommendations = []

  // Recommendation 1: CTR optimization
  if (analytics.avgCTR < 0.05) {
    recommendations.push({
      priority: 'high',
      title: 'Optimize Low CTR Pages',
      description: `${analytics.lowCTRPages.length} pages have CTR < 5%`,
      action: 'Improve titles and meta descriptions',
    })
  }

  // Recommendation 2: Position optimization
  if (analytics.avgPosition > 15) {
    recommendations.push({
      priority: 'high',
      title: 'Improve Average Ranking Position',
      description: `Average position is ${analytics.avgPosition.toFixed(1)}`,
      action: 'Add more internal links and improve content quality',
    })
  }

  // Recommendation 3: High impression pages not ranking
  const highImpressionLowClick = analytics.topPages.filter(
    (p: any) => p.impressions > 100 && p.clicks < 5
  )
  if (highImpressionLowClick.length > 0) {
    recommendations.push({
      priority: 'high',
      title: 'Fix High Impression/Low Click Pages',
      description: `${highImpressionLowClick.length} pages have high impressions but low CTR`,
      action: 'These pages are being shown but not clicked. Optimize titles/descriptions.',
    })
  }

  return recommendations
}
```

---

### Tarefa 4: Criar `/app/admin/gsc-dashboard.tsx`

**Arquivo**: `app/admin/gsc-dashboard.tsx` (NOVO)

**O que fazer**:
```typescript
'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui'

interface Analytics {
  topQueries: any[]
  topPages: any[]
  lowCTRPages: any[]
  totalImpressions: number
  totalClicks: number
  avgCTR: number
  avgPosition: number
  recommendations: any[]
}

export default function GSCDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/gsc/analytics')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setAnalytics(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) return <div className="p-8">Loading GSC data...</div>
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>
  if (!analytics) return <div className="p-8">No data available</div>

  return (
    <div className="space-y-8 p-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-3xl font-bold">
            {analytics.totalImpressions.toLocaleString()}
          </div>
          <p className="text-sm text-gray-500">Total Impressions</p>
        </Card>
        
        <Card>
          <div className="text-3xl font-bold">
            {analytics.totalClicks.toLocaleString()}
          </div>
          <p className="text-sm text-gray-500">Total Clicks</p>
        </Card>
        
        <Card>
          <div className="text-3xl font-bold">
            {(analytics.avgCTR * 100).toFixed(2)}%
          </div>
          <p className="text-sm text-gray-500">Average CTR</p>
        </Card>
        
        <Card>
          <div className="text-3xl font-bold">
            {analytics.avgPosition.toFixed(1)}
          </div>
          <p className="text-sm text-gray-500">Average Position</p>
        </Card>
      </div>

      {/* Top Queries */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Top 10 Queries</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Query</th>
                <th className="text-right py-2">Impressions</th>
                <th className="text-right py-2">Clicks</th>
                <th className="text-right py-2">CTR</th>
                <th className="text-right py-2">Position</th>
              </tr>
            </thead>
            <tbody>
              {analytics.topQueries.slice(0, 10).map((q, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="py-2 font-medium">{q.query}</td>
                  <td className="text-right">{q.impressions}</td>
                  <td className="text-right">{q.clicks}</td>
                  <td className="text-right">{(q.ctr * 100).toFixed(2)}%</td>
                  <td className="text-right">{q.position.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Low CTR Pages */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">
          Pages Needing CTR Optimization ({analytics.lowCTRPages.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Page</th>
                <th className="text-right py-2">Impressions</th>
                <th className="text-right py-2">Clicks</th>
                <th className="text-right py-2">CTR</th>
                <th className="text-right py-2">Current Position</th>
              </tr>
            </thead>
            <tbody>
              {analytics.lowCTRPages.slice(0, 10).map((p, i) => (
                <tr key={i} className="border-b bg-red-50 hover:bg-red-100">
                  <td className="py-2 font-medium text-red-700">{p.page}</td>
                  <td className="text-right">{p.impressions}</td>
                  <td className="text-right">{p.clicks}</td>
                  <td className="text-right font-bold text-red-600">
                    {(p.ctr * 100).toFixed(2)}%
                  </td>
                  <td className="text-right">{p.position.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          💡 Tip: These pages have good impressions but low CTR. 
          Update their titles and meta descriptions to improve clicks.
        </p>
      </Card>

      {/* Recommendations */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Recommendations</h2>
        <div className="space-y-3">
          {analytics.recommendations.map((rec, i) => (
            <div
              key={i}
              className={`p-4 rounded border-l-4 ${
                rec.priority === 'high'
                  ? 'border-red-500 bg-red-50'
                  : 'border-yellow-500 bg-yellow-50'
              }`}
            >
              <div className="font-bold">{rec.title}</div>
              <div className="text-sm text-gray-700 mt-1">{rec.description}</div>
              <div className="text-sm text-gray-600 mt-2">
                👉 {rec.action}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
```

---

### Tarefa 5: Criar `.env.local` Variables

**O que fazer**:
```bash
# .env.local (adicionar estas variáveis)

# Google Cloud
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./google-service-account-key.json

# Site
SITE_URL=https://cryptoacademy.example.com
```

---

### Tarefa 6: Criar instruções de setup

**Arquivo**: `docs/GSC_SETUP.md` (NOVO)

**O que fazer**:
```markdown
# Google Search Console Integration Setup

## 1. Create Google Cloud Project
1. Go to https://console.cloud.google.com/
2. Create new project: "CryptoAcademy Blog"
3. Enable these APIs:
   - Google Search Console API
   - Webmasters API

## 2. Create Service Account
1. Go to Service Accounts
2. Create new service account
3. Grant "Editor" role
4. Create JSON key
5. Download and save as `google-service-account-key.json`

## 3. Add Service Account to GSC
1. Go to https://search.google.com/search-console
2. Go to Settings → Users and permissions
3. Add your service account email (from JSON key)
4. Grant "Full" access

## 4. Verify Installation
Run: `npm run dev`
Visit: http://localhost:3000/admin/gsc-dashboard
Should show data if connected correctly
```

---

### Tarefa 7: Testar Integração

**O que fazer**:
```bash
# 1. Verificar se lib/gsc-client.ts compila
npm run build

# 2. Testar API endpoint
curl http://localhost:3000/api/gsc/analytics

# 3. Verificar dashboard
npm run dev
Visit: http://localhost:3000/admin/gsc-dashboard

# 4. Verificar errors
tail -f logs/gsc.log (se houver)
```

---

### Tarefa 8: Criar Monitoring Automático (Opcional)

**O que fazer**:
```typescript
// lib/gsc-monitor.ts (NOVO - Opcional)

/**
 * Monitoramento automático de GSC
 * Pode ser rodado via cron job
 */

export async function monitorGSC() {
  const gsc = createGSCClient()
  
  // Fetch analytics
  const analytics = await gsc.getAnalytics()
  
  // Salvar no banco (Prisma):
  // await db.gscMetrics.create({ data: analytics })
  
  // Alert se CTR cair abaixo de 4%
  if (analytics.avgCTR < 0.04) {
    // Enviar email de alerta
    // await sendAlertEmail('CTR dropped below 4%')
  }
  
  // Log
  console.log(`[GSC Monitor] Impressions: ${analytics.totalImpressions}`)
}

// Pode ser chamado via:
// - API route: GET /api/gsc/monitor
// - Cron job (vercel.json)
// - Manual script
```

---

## ✅ VERIFICATION CHECKLIST

- [ ] lib/gsc-client.ts criado e compila sem erros
- [ ] app/api/gsc/analytics/route.ts criado e funciona
- [ ] app/admin/gsc-dashboard.tsx criado e exibe dados
- [ ] .env.local configurado com credenciais
- [ ] Service account JSON key salvo e secreto
- [ ] npm run build executa sem erros
- [ ] Dashboard mostra:
  - [ ] Total Impressions
  - [ ] Total Clicks
  - [ ] Average CTR
  - [ ] Average Position
  - [ ] Top 10 queries
  - [ ] Low CTR pages
  - [ ] Recommendations

---

## 📊 RESULTADO ESPERADO

Após implementação:

✅ **Dashboard em** `/admin/gsc-dashboard`
✅ **Dados atualizados** a cada 1 hora (cache)
✅ **Monitoramento** de CTR, posição, impressões
✅ **Identificação** automática de problemas
✅ **Recomendações** acionáveis para SEO

**Impacto**:
- +30% CTR optimization
- +50% traffic discovery
- +20% ranking improvement

---

## 🎯 PRÓXIMAS TAREFAS

1. **Integração com Banco**: Salvar histórico em Prisma
2. **Email Alerts**: Notificar de drops de CTR
3. **Advanced Filtering**: Filtrar por data, categoria
4. **Export**: Exportar relatórios em PDF/CSV
5. **Comparação**: Compare semanas/meses

---

**Antigravity: Implemente estas 8 tarefas para Google Search Console integration completa! 🚀**
