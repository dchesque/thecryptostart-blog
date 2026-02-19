'use client'

import { useEffect, useState } from 'react'
import {
    TrendingUp,
    FileText,
    Link as LinkIcon,
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    ExternalLink,
    Search,
    Target
} from 'lucide-react'

interface SEOMetrics {
    totalPosts: number
    avgWordCount: number
    postsUnder1500Words: number
    avgInternalLinks: number
    avgExternalLinks: number
    contentExpansionOpportunities: any[]
    linkingSuggestions: any[]
}

export default function SEODashboard() {
    const [metrics, setMetrics] = useState<SEOMetrics | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchMetrics() {
            try {
                const res = await fetch('/api/seo/metrics')
                if (!res.ok) throw new Error('Failed to fetch metrics')
                const data = await res.json()
                setMetrics(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error')
            } finally {
                setLoading(false)
            }
        }

        fetchMetrics()
    }, [])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="w-12 h-12 border-4 border-crypto-primary/20 border-t-crypto-primary rounded-full animate-spin"></div>
                <p className="text-gray-400 font-medium">Analyzing Codebase SEO...</p>
            </div>
        )
    }

    if (error || !metrics) {
        return (
            <div className="p-8 bg-red-50 border border-red-200 rounded-2xl text-red-700">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <AlertTriangle size={24} />
                    Error loading metrics
                </h2>
                <p className="mt-2">{error || 'Could not retrieve data from server.'}</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-crypto-primary/10 rounded-lg">
                        <Target className="text-crypto-primary w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        SEO Intelligence
                    </h1>
                </div>
                <p className="text-gray-500">Analyze and optimize your content for search engines.</p>
            </header>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total Posts"
                    value={metrics.totalPosts}
                    icon={<FileText className="text-blue-500" />}
                />
                <StatCard
                    label="Avg Word Count"
                    value={metrics.avgWordCount}
                    icon={<TrendingUp className="text-emerald-500" />}
                    subValue="Goal: 1500+"
                />
                <StatCard
                    label="Posts < 1500 Words"
                    value={metrics.postsUnder1500Words}
                    icon={<AlertTriangle className="text-amber-500" />}
                    variant={metrics.postsUnder1500Words > 0 ? 'warning' : 'success'}
                />
                <StatCard
                    label="Internal Links/Post"
                    value={metrics.avgInternalLinks}
                    icon={<LinkIcon className="text-purple-500" />}
                    subValue="Healthy: 3-5"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Expansion Opportunities */}
                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <TrendingUp size={20} className="text-emerald-500" />
                            Expansion Opportunities
                        </h2>
                        <span className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded-full border border-red-100 uppercase tracking-wider">
                            High Priority
                        </span>
                    </div>
                    <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
                        {metrics.contentExpansionOpportunities.length > 0 ? (
                            metrics.contentExpansionOpportunities.slice(0, 8).map((opp) => (
                                <div key={opp.slug} className="p-5 hover:bg-gray-50 transition-colors group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-800 group-hover:text-crypto-primary transition-colors text-sm">
                                                {opp.title}
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {opp.currentWordCount} words → <span className="text-emerald-600 font-bold">{opp.targetWordCount} target</span>
                                            </p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${opp.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                                            }`}>
                                            {opp.priority}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex gap-2 flex-wrap">
                                        {opp.suggestions.map((s: string, i: number) => (
                                            <span key={i} className="px-2 py-1 bg-gray-50 border border-gray-100 rounded-md text-[10px] text-gray-500 font-medium">
                                                + {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-10 text-center text-gray-400 italic">
                                No opportunities found. All posts meet the word count goal!
                            </div>
                        )}
                    </div>
                </section>

                {/* Linking Suggestions */}
                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <LinkIcon size={20} className="text-purple-500" />
                            Internal Linking Suggestions
                        </h2>
                        <Search size={18} className="text-gray-400" />
                    </div>
                    <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
                        {metrics.linkingSuggestions.length > 0 ? (
                            metrics.linkingSuggestions.slice(0, 10).map((link, i) => (
                                <div key={i} className="p-5 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                                <span className="truncate max-w-[150px] font-medium text-gray-700" title={link.sourceTitle}>{link.sourceTitle}</span>
                                                <ArrowRight size={12} className="shrink-0 text-gray-300" />
                                                <span className="text-crypto-primary font-bold truncate shrink-0 max-w-[150px]" title={link.targetTitle}>{link.targetTitle}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                                <span className="font-bold text-gray-600 mr-1">Reason:</span> {link.reason}
                                            </p>
                                        </div>
                                        <div className="text-right pl-2 border-l border-gray-100">
                                            <div className="text-lg font-bold text-emerald-600">
                                                {Math.round(link.relevanceScore * 100)}%
                                            </div>
                                            <div className="text-[9px] text-gray-400 uppercase font-black tracking-tighter">Match</div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-10 text-center text-gray-400 italic">
                                No linking suggestions available at the moment.
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-gradient-to-br from-crypto-darker to-crypto-navy rounded-2xl p-8 flex items-center justify-between text-white shadow-xl">
                    <div>
                        <h3 className="text-2xl font-bold">Guest Post Strategy</h3>
                        <p className="text-gray-400 mt-2 max-w-md">
                            The guest post program is active. Use public guidelines to attract authors and generate authority backlinks.
                        </p>
                        <div className="mt-6">
                            <a
                                href="/guest-post-guidelines"
                                target="_blank"
                                className="px-6 py-3 bg-crypto-primary text-white font-bold rounded-xl hover:bg-white hover:text-crypto-primary transition-all inline-flex items-center gap-2 shadow-lg shadow-crypto-primary/20"
                            >
                                View Guidelines <ExternalLink size={16} />
                            </a>
                        </div>
                    </div>
                    <div className="hidden md:flex gap-12 border-l border-white/10 pl-12">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-white">0</div>
                            <div className="text-xs text-gray-400 uppercase font-bold tracking-widest mt-2">Pitches</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-white">0</div>
                            <div className="text-xs text-gray-400 uppercase font-bold tracking-widest mt-2">Live</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <CheckCircle2 size={20} className="text-green-500" />
                        Weekly Checklist
                    </h3>
                    <ul className="space-y-3">
                        <CheckItem label="Expand 1 'High Priority' post" />
                        <CheckItem label="Implement 5 suggested links" />
                        <CheckItem label="Audit Broken Links (Task 9)" />
                        <CheckItem label="Review Guest Post Pitches" />
                    </ul>
                </div>
            </div>
        </div>
    )
}

function StatCard({
    label,
    value,
    icon,
    subValue,
    variant = 'default'
}: {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    subValue?: string;
    variant?: 'default' | 'warning' | 'success';
}) {
    const variantStyles = {
        default: 'bg-white border-gray-100',
        warning: 'bg-amber-50 border-amber-100',
        success: 'bg-green-50 border-green-100',
    }

    return (
        <div className={`p-6 rounded-2xl border ${variantStyles[variant]} shadow-sm transition-all hover:-translate-y-1 hover:shadow-md duration-300`}>
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    {icon}
                </div>
                {subValue && <span className="text-[10px] text-gray-400 font-bold uppercase bg-gray-100 px-2 py-1 rounded-md">{subValue}</span>}
            </div>
            <div className="text-3xl font-bold text-gray-900">{value}</div>
            <p className="text-sm text-gray-500 mt-1 font-medium">{label}</p>
        </div>
    )
}

function CheckItem({ label }: { label: string }) {
    return (
        <li className="flex items-center gap-3 text-sm text-gray-600 group cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
            <div className="w-5 h-5 rounded border border-gray-200 flex items-center justify-center group-hover:border-crypto-primary transition-colors bg-white">
                <div className="w-2.5 h-2.5 rounded-sm bg-crypto-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <span className="font-medium group-hover:text-gray-900">{label}</span>
        </li>
    )
}
