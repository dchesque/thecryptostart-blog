'use client'

import { useEffect, useState } from 'react'
import {
    TrendingUp,
    FileText,
    Link as LinkIcon,
    AlertTriangle,
    ArrowRight,
    ChevronRight,
    CheckCircle2,
    ExternalLink,
    Search
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
                <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                <p className="text-gray-400 font-medium">Analisando SEO do Codebase...</p>
            </div>
        )
    }

    if (error || !metrics) {
        return (
            <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <AlertTriangle size={24} />
                    Erro ao carregar métricas
                </h2>
                <p className="mt-2">{error || 'Não foi possível obter os dados do servidor.'}</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <TrendingUp className="text-cyan-400" />
                    SEO Intelligence Dashboard
                </h1>
                <p className="text-gray-400 mt-2">Insights baseados em análise real de conteúdo e estrutura de links.</p>
            </header>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total de Posts"
                    value={metrics.totalPosts}
                    icon={<FileText className="text-blue-400" />}
                />
                <StatCard
                    label="Média de Palavras"
                    value={metrics.avgWordCount}
                    icon={<TrendingUp className="text-emerald-400" />}
                    subValue="Meta: 1500+"
                />
                <StatCard
                    label="Posts < 1500 Palavras"
                    value={metrics.postsUnder1500Words}
                    icon={<AlertTriangle className="text-amber-400" />}
                    variant={metrics.postsUnder1500Words > 0 ? 'warning' : 'success'}
                />
                <StatCard
                    label="Links Internos/Post"
                    value={metrics.avgInternalLinks}
                    icon={<LinkIcon className="text-purple-400" />}
                    subValue="Saudável: 3-5"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Expansion Opportunities */}
                <section className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <TrendingUp size={20} className="text-emerald-400" />
                            Oportunidades de Expansão
                        </h2>
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">
                            Top Priority
                        </span>
                    </div>
                    <div className="divide-y divide-white/10 max-h-[500px] overflow-y-auto">
                        {metrics.contentExpansionOpportunities.length > 0 ? (
                            metrics.contentExpansionOpportunities.slice(0, 8).map((opp) => (
                                <div key={opp.slug} className="p-5 hover:bg-white/[0.02] transition-colors group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors uppercase text-sm tracking-wider">
                                                {opp.title}
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {opp.currentWordCount} palavras → <span className="text-emerald-400">{opp.targetWordCount} meta</span>
                                            </p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${opp.priority === 'high' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'
                                            }`}>
                                            {opp.priority}
                                        </span>
                                    </div>
                                    <div className="mt-4 flex gap-2 flex-wrap">
                                        {opp.suggestions.map((s: string, i: number) => (
                                            <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] text-gray-400 italic">
                                                + {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-10 text-center text-gray-500 italic">
                                Nenhuma oportunidade encontrada. Todos os posts estão acima da meta!
                            </div>
                        )}
                    </div>
                </section>

                {/* Linking Suggestions */}
                <section className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <LinkIcon size={20} className="text-purple-400" />
                            Sugestões de Links Internos
                        </h2>
                        <Search size={18} className="text-gray-500" />
                    </div>
                    <div className="divide-y divide-white/10 max-h-[500px] overflow-y-auto">
                        {metrics.linkingSuggestions.length > 0 ? (
                            metrics.linkingSuggestions.slice(0, 10).map((link, i) => (
                                <div key={i} className="p-5 hover:bg-white/[0.02] transition-colors">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                                <span className="truncate max-w-[150px]">{link.sourceTitle}</span>
                                                <ArrowRight size={12} className="shrink-0" />
                                                <span className="text-cyan-400 font-medium truncate shrink-0 max-w-[150px]">{link.targetTitle}</span>
                                            </div>
                                            <p className="text-xs text-gray-400">
                                                <span className="text-white/40 mr-1 italic">Reason:</span> {link.reason}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-white">
                                                {Math.round(link.relevanceScore * 100)}%
                                            </div>
                                            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Match</div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-10 text-center text-gray-500 italic">
                                Nenhuma sugestão de link disponível no momento.
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-gradient-to-br from-blue-600/10 to-transparent border border-white/10 rounded-2xl p-8 flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-white">Estratégia Guest Post</h3>
                        <p className="text-gray-400 mt-2 max-w-md">
                            O programa de guest posts está ativo. Utilize as guidelines públicas para atrair autores e gerar backlinks de autoridade.
                        </p>
                        <div className="mt-6 flex gap-4">
                            <a
                                href="/guest-post-guidelines"
                                target="_blank"
                                className="px-6 py-2 bg-white text-black font-bold rounded-xl hover:bg-cyan-400 transition-colors flex items-center gap-2"
                            >
                                Ver Guidelines <ExternalLink size={16} />
                            </a>
                        </div>
                    </div>
                    <div className="hidden md:flex gap-8">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white">0</div>
                            <div className="text-xs text-gray-500 uppercase mt-1">Pitches</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white">0</div>
                            <div className="text-xs text-gray-500 uppercase mt-1">Live</div>
                        </div>
                    </div>
                </div>

                <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-cyan-400" />
                        Checklist Semanal
                    </h3>
                    <ul className="space-y-3">
                        <CheckItem label="Expandir 1 post 'High Priority'" />
                        <CheckItem label="Implementar 5 links sugeridos" />
                        <CheckItem label="Auditar Broken Links (Tarefa 9)" />
                        <CheckItem label="Revisar Pitches de Guest Post" />
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
        default: 'bg-white/5 border-white/10',
        warning: 'bg-amber-500/5 border-amber-500/20 text-amber-500',
        success: 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500',
    }

    return (
        <div className={`p-6 rounded-2xl border ${variantStyles[variant]} transition-all hover:scale-[1.02] duration-300`}>
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                    {icon}
                </div>
                {subValue && <span className="text-[10px] text-gray-500 font-bold uppercase">{subValue}</span>}
            </div>
            <div className="text-4xl font-bold text-white">{value}</div>
            <p className="text-sm text-gray-400 mt-1 font-medium">{label}</p>
        </div>
    )
}

function CheckItem({ label }: { label: string }) {
    return (
        <li className="flex items-center gap-3 text-sm text-gray-400 group cursor-default">
            <div className="w-4 h-4 rounded border border-white/20 flex items-center justify-center group-hover:border-cyan-500/50 transition-colors">
                <div className="w-2 h-2 rounded-sm bg-cyan-500 opacity-0 group-hover:opacity-40 transition-opacity"></div>
            </div>
            {label}
        </li>
    )
}
