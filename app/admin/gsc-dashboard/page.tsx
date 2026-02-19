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
    ExternalLink,
    CheckCircle2
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
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
                <Loader2 className="w-12 h-12 animate-spin mb-4 text-crypto-primary" />
                <p className="text-lg font-medium">Loading Search Console data...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-8 max-w-4xl mx-auto animate-in fade-in duration-500">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-red-800 font-bold text-lg">Integration Error</h3>
                        <p className="text-red-700 mt-1">{error}</p>
                        <p className="text-red-600 text-sm mt-4">
                            Check if Google Cloud credentials are correctly configured in <code>.env.local</code>.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    if (!analytics) return <div className="p-8 text-center text-gray-500">No data available.</div>

    const stats = [
        { label: 'Total Impressions', value: analytics.totalImpressions.toLocaleString(), icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Total Clicks', value: analytics.totalClicks.toLocaleString(), icon: MousePointerClick, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Average CTR', value: `${(analytics.avgCTR * 100).toFixed(2)}%`, icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Average Position', value: analytics.avgPosition.toFixed(1), icon: MapPin, color: 'text-purple-600', bg: 'bg-purple-50' },
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Search Console Dashboard</h1>
                <p className="text-gray-500 mt-2">Organic performance over the last 90 days.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Top Queries Table */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex items-center gap-2">
                            <Search className="text-gray-400" size={20} />
                            <h2 className="text-xl font-bold text-gray-900">Top 10 Queries</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-500 uppercase text-[11px] font-bold tracking-wider">
                                    <tr>
                                        <th className="text-left px-6 py-4">Query</th>
                                        <th className="text-right px-6 py-4">Impressions</th>
                                        <th className="text-right px-6 py-4">Clicks</th>
                                        <th className="text-right px-6 py-4">CTR</th>
                                        <th className="text-right px-6 py-4">Position</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {analytics.topQueries.slice(0, 10).map((q, i) => (
                                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-gray-800">{q.query}</td>
                                            <td className="px-6 py-4 text-right text-gray-600">{q.impressions.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right text-gray-600">{q.clicks.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right font-medium text-gray-900">{(q.ctr * 100).toFixed(2)}%</td>
                                            <td className="px-6 py-4 text-right text-gray-500">{q.position.toFixed(1)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Low CTR Pages */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex items-center gap-2 text-rose-600">
                            <AlertCircle size={20} />
                            <h2 className="text-xl font-bold">Low CTR Pages</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-rose-50 text-rose-700 uppercase text-[11px] font-bold tracking-wider">
                                    <tr>
                                        <th className="text-left px-6 py-4">Page</th>
                                        <th className="text-right px-6 py-4">Impressions</th>
                                        <th className="text-right px-6 py-4">CTR</th>
                                        <th className="text-right px-6 py-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-rose-100/50">
                                    {analytics.lowCTRPages.slice(0, 10).map((p, i) => (
                                        <tr key={i} className="hover:bg-rose-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-800 max-w-[250px] truncate" title={p.page}>{p.page}</td>
                                            <td className="px-6 py-4 text-right text-gray-600">{p.impressions.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right font-bold text-rose-600">{(p.ctr * 100).toFixed(2)}%</td>
                                            <td className="px-6 py-4 text-right">
                                                <a
                                                    href={p.page}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 font-bold text-xs uppercase"
                                                >
                                                    View <ExternalLink size={12} />
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 bg-gray-50 text-gray-500 text-xs flex items-center gap-2 border-t border-gray-100">
                            <Lightbulb size={14} className="text-amber-500 fill-amber-500" />
                            <span><span className="font-bold">Tip:</span> These pages appear in search but have low click rates. Optimize titles and meta descriptions.</span>
                        </div>
                    </div>
                </div>

                {/* Side Panel: Recommendations */}
                <div className="space-y-6">
                    <div className="bg-crypto-darker rounded-3xl p-6 text-white shadow-xl">
                        <div className="flex items-center gap-2 mb-6">
                            <TrendingUp className="text-crypto-primary" size={24} />
                            <h2 className="text-xl font-bold tracking-tight">Suggested Optimizations</h2>
                        </div>

                        <div className="space-y-4">
                            {analytics.recommendations.map((rec, i) => (
                                <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10 relative overflow-hidden group hover:bg-white/10 transition-colors">
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${rec.priority === 'high' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                                    <h3 className="font-bold text-white text-sm">{rec.title}</h3>
                                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">{rec.description}</p>
                                    <div className="mt-3 pt-3 border-t border-white/10 flex items-start gap-2 text-xs text-crypto-primary">
                                        <span className="font-bold flex-shrink-0 uppercase tracking-wider">Action:</span>
                                        <span>{rec.action}</span>
                                    </div>
                                </div>
                            ))}

                            {analytics.recommendations.length === 0 && (
                                <div className="text-gray-500 text-sm text-center py-8 italic">
                                    All good! No urgent recommendations at the moment.
                                </div>
                            )}
                        </div>

                        <div className="mt-8 p-4 bg-black/20 rounded-xl border border-white/5">
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2">System Status</p>
                            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                Connected to Search Console
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-gray-900 font-bold mb-4">Performance Target</h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-gray-500 font-medium">CTR Achievement</span>
                                    <span className="text-gray-900 font-bold">{(analytics.avgCTR * 100).toFixed(1)}% / 5.0%</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${analytics.avgCTR >= 0.05 ? 'bg-emerald-500' : 'bg-amber-400'}`}
                                        style={{ width: `${Math.min((analytics.avgCTR / 0.05) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-gray-500 font-medium">Position Goal (&lt; 10)</span>
                                    <span className="text-gray-900 font-bold">{analytics.avgPosition.toFixed(1)} / 10.0</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
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
