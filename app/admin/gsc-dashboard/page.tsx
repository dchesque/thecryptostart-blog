'use client'

import { useEffect, useState } from 'react'
import {
    BarChart3,
    MousePointerClick,
    TrendingUp,
    MapPin,
    Search,
    AlertCircle,
    Lightbulb,
    Loader2,
    ExternalLink
} from 'lucide-react'

interface GSCQuery {
    query: string
    impressions: number
    clicks: number
    ctr: number
    position: number
}

interface GSCPage {
    page: string
    impressions: number
    clicks: number
    ctr: number
    position: number
}

interface Recommendation {
    priority: 'high' | 'medium' | 'low'
    title: string
    description: string
    action: string
}

interface Analytics {
    topQueries: GSCQuery[]
    topPages: GSCPage[]
    lowCTRPages: GSCPage[]
    totalImpressions: number
    totalClicks: number
    avgCTR: number
    avgPosition: number
    recommendations: Recommendation[]
}

export default function GSCDashboard() {
    const [analytics, setAnalytics] = useState<Analytics | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchAnalytics() {
            try {
                const res = await fetch('/api/gsc/analytics')
                if (!res.ok) {
                    if (res.status === 401) throw new Error('Unauthorized - Admin session required')
                    throw new Error('Failed to fetch GSC data')
                }
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-600">
                <Loader2 className="w-12 h-12 animate-spin mb-4 text-blue-600" />
                <p className="text-lg font-medium">Carregando dados do Search Console...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-8 max-w-4xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-red-800 font-bold text-lg">Erro na Integração</h3>
                        <p className="text-red-700 mt-1">{error}</p>
                        <p className="text-red-600 text-sm mt-4">
                            Verifique se as credenciais do Google Cloud estão configuradas corretamente no arquivo <code>.env.local</code>.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    if (!analytics) return <div className="p-8 text-center text-slate-500">Nenhum dado disponível.</div>

    const stats = [
        { label: 'Impressões Totais', value: analytics.totalImpressions.toLocaleString(), icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Cliques Totais', value: analytics.totalClicks.toLocaleString(), icon: MousePointerClick, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'CTR Médio', value: `${(analytics.avgCTR * 100).toFixed(2)}%`, icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Posição Média', value: analytics.avgPosition.toFixed(1), icon: MapPin, color: 'text-purple-600', bg: 'bg-purple-50' },
    ]

    return (
        <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Search Console Insights</h1>
                <p className="text-slate-500 mt-2">Performance orgânica dos últimos 90 dias</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Top Queries Table */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
                            <Search className="text-slate-400" size={20} />
                            <h2 className="text-xl font-bold text-slate-900">Top 10 Queries</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold tracking-wider">
                                    <tr>
                                        <th className="text-left px-6 py-4">Query</th>
                                        <th className="text-right px-6 py-4">Impressões</th>
                                        <th className="text-right px-6 py-4">Cliques</th>
                                        <th className="text-right px-6 py-4">CTR</th>
                                        <th className="text-right px-6 py-4">Posição</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 italic">
                                    {analytics.topQueries.slice(0, 10).map((q, i) => (
                                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-slate-800 not-italic">{q.query}</td>
                                            <td className="px-6 py-4 text-right text-slate-600">{q.impressions.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right text-slate-600">{q.clicks.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right font-medium text-slate-900">{(q.ctr * 100).toFixed(2)}%</td>
                                            <td className="px-6 py-4 text-right text-slate-500">{q.position.toFixed(1)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Low CTR Pages */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center gap-2 text-rose-600">
                            <AlertCircle size={20} />
                            <h2 className="text-xl font-bold">Páginas com Baixo CTR</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-rose-50 text-rose-700 uppercase text-[11px] font-bold tracking-wider">
                                    <tr>
                                        <th className="text-left px-6 py-4">Página</th>
                                        <th className="text-right px-6 py-4">Impressões</th>
                                        <th className="text-right px-6 py-4">CTR</th>
                                        <th className="text-right px-6 py-4">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-rose-100">
                                    {analytics.lowCTRPages.slice(0, 10).map((p, i) => (
                                        <tr key={i} className="hover:bg-rose-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-800 max-w-[300px] truncate">{p.page}</td>
                                            <td className="px-6 py-4 text-right text-slate-600">{p.impressions.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right font-bold text-rose-600">{(p.ctr * 100).toFixed(2)}%</td>
                                            <td className="px-6 py-4 text-right">
                                                <a
                                                    href={p.page}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                                                >
                                                    Ver <ExternalLink size={14} />
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 bg-slate-50 text-slate-500 text-xs flex items-center gap-2 border-t border-slate-100">
                            <Lightbulb size={14} className="text-amber-500" />
                            <span>Dica: Estas páginas aparecem mas são pouco clicadas. Otimize os títulos e meta-descrições.</span>
                        </div>
                    </div>
                </div>

                {/* Side Panel: Recommendations */}
                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-200">
                        <div className="flex items-center gap-2 mb-6">
                            <TrendingUp className="text-cyan-400" size={24} />
                            <h2 className="text-xl font-bold tracking-tight">Otimizações Sugeridas</h2>
                        </div>

                        <div className="space-y-4">
                            {analytics.recommendations.map((rec, i) => (
                                <div key={i} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 relative overflow-hidden group">
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${rec.priority === 'high' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                                    <h3 className="font-bold text-slate-100">{rec.title}</h3>
                                    <p className="text-sm text-slate-400 mt-1">{rec.description}</p>
                                    <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-start gap-2 text-sm text-cyan-400">
                                        <span className="font-bold flex-shrink-0">Ação:</span>
                                        <span>{rec.action}</span>
                                    </div>
                                </div>
                            ))}

                            {analytics.recommendations.length === 0 && (
                                <div className="text-slate-500 text-sm text-center py-8 italic">
                                    Tudo certo! Nenhuma recomendação urgente no momento.
                                </div>
                            )}
                        </div>

                        <div className="mt-8 p-4 bg-slate-800 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Status</p>
                            <div className="flex items-center gap-2 text-emerald-400 font-bold">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                Conectado ao Search Console
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <h3 className="text-slate-900 font-bold mb-4">Meta de Performance</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-500 font-medium">CTR Atendimento</span>
                                    <span className="text-slate-900 font-bold">{(analytics.avgCTR * 100).toFixed(1)}% / 5.0%</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${analytics.avgCTR >= 0.05 ? 'bg-emerald-500' : 'bg-amber-400'}`}
                                        style={{ width: `${Math.min((analytics.avgCTR / 0.05) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-500 font-medium">Posição Objetivo (&lt; 10)</span>
                                    <span className="text-slate-900 font-bold">{analytics.avgPosition.toFixed(1)} / 10.0</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${analytics.avgPosition <= 10 ? 'bg-emerald-500' : 'bg-amber-400'}`}
                                        style={{ width: `${Math.min((10 / analytics.avgPosition) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
