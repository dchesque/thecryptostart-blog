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
    private searchconsole: any
    private siteUrl: string

    constructor(siteUrl: string) {
        this.siteUrl = siteUrl

        // Usar credentials do Google Cloud via variáveis de ambiente
        const auth = new google.auth.GoogleAuth({
            projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                // Tratar quebras de linha na private key que podem ser corrompidas no .env
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
        })

        this.searchconsole = google.searchconsole({ version: 'v1', auth })
    }

    /**
     * Obter top queries dos últimos 90 dias
     */
    async getTopQueries(days = 90, limit = 250): Promise<GSCQuery[]> {
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)

        const response = await this.searchconsole.searchanalytics.query({
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

        const response = await this.searchconsole.searchanalytics.query({
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

        const response = await this.searchconsole.searchanalytics.query({
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
    const siteUrl = process.env.SITE_URL || 'https://thecryptostart.com'
    return new GSCClient(siteUrl)
}
