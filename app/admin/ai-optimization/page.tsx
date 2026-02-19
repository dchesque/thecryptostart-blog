'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
    Bot,
    CheckCircle2,
    XCircle,
    BarChart3,
    ExternalLink,
    ArrowRight,
    MessageSquare,
    BookOpen,
    AlertCircle
} from 'lucide-react'

interface AIScore {
    slug: string
    title: string
    score: number
    hasQuickAnswer: boolean
    hasFAQ: boolean
    citableSentences: number
    authorBio: boolean
    recommendations: string[]
}

export default function AIOptimizationDashboard() {
    const [scores, setScores] = useState<AIScore[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchScores() {
            try {
                const res = await fetch('/api/ai-optimization/scores')
                if (!res.ok) throw new Error('Failed to fetch scores')
                const data = await res.json()
                setScores(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchScores()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-crypto-primary/30 border-t-crypto-primary rounded-full animate-spin"></div>
                    <p className="text-gray-500 animate-pulse font-medium">Calculating AI optimization scores...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-8 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-start gap-4">
                <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
                <div>
                    <h2 className="font-bold text-lg mb-2">Error Loading Dashboard</h2>
                    <p>{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    const avgScore = scores.length > 0
        ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)
        : 0

    const stats = [
        {
            label: 'Average AI Score',
            value: `${avgScore}/100`,
            color: avgScore >= 80 ? 'text-green-600 bg-green-50' : 'text-amber-600 bg-amber-50',
            icon: BarChart3
        },
        {
            label: 'With Quick Answer',
            value: scores.filter(s => s.hasQuickAnswer).length,
            total: scores.length,
            color: 'text-blue-600 bg-blue-50',
            icon: MessageSquare
        },
        {
            label: 'With FAQ Schema',
            value: scores.filter(s => s.hasFAQ).length,
            total: scores.length,
            color: 'text-purple-600 bg-purple-50',
            icon: BookOpen
        },
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-gray-900">AI Search Optimization</h1>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider border border-amber-200">Beta</span>
                    </div>
                    <p className="text-gray-500 mt-2">Monitor how well your content is optimized for AI-powered search engines.</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                            <div className="text-2xl font-bold text-gray-900">
                                {stat.value}
                                {stat.total !== undefined && (
                                    <span className="text-sm text-gray-400 font-normal ml-1">/ {stat.total}</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Posts Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">Optimization Scores</h2>
                    <div className="flex gap-2 text-xs">
                        <span className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full font-bold border border-green-100">80+ Excellent</span>
                        <span className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded-full font-bold border border-amber-100">60-79 Good</span>
                        <span className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-full font-bold border border-red-100">&lt; 60 Needs Work</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Post Title</th>
                                <th className="px-6 py-4 text-center">AI Score</th>
                                <th className="px-6 py-4 text-center">Quick Answer</th>
                                <th className="px-6 py-4 text-center">FAQ</th>
                                <th className="px-6 py-4 text-center">Authority</th>
                                <th className="px-6 py-4 text-center">Citations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {scores
                                .sort((a, b) => b.score - a.score)
                                .map((post, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <Link href={`/blog/${post.slug}`} target="_blank" className="font-bold text-gray-900 truncate max-w-md hover:text-crypto-primary hover:underline block">
                                                {post.title}
                                            </Link>
                                            <div className="text-xs text-gray-400 mt-1 font-mono">/blog/{post.slug}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded-lg font-bold text-sm border ${post.score >= 80 ? 'bg-green-50 text-green-700 border-green-200' :
                                                post.score >= 60 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                    'bg-red-50 text-red-700 border-red-200'
                                                }`}>
                                                {post.score}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {post.hasQuickAnswer ?
                                                <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /> :
                                                <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                                            }
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {post.hasFAQ ?
                                                <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /> :
                                                <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                                            }
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {post.authorBio ?
                                                <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /> :
                                                <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                                            }
                                        </td>
                                        <td className="px-6 py-4 text-center font-medium text-gray-600">
                                            {post.citableSentences}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Actionable Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-crypto-darker rounded-3xl p-8 text-white shadow-xl">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Bot className="text-crypto-primary" />
                        Quick Wins
                    </h2>
                    <div className="space-y-4">
                        {scores
                            .filter(s => s.score < 80)
                            .slice(0, 4)
                            .map((post, i) => (
                                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition">
                                    <h4 className="font-bold text-crypto-primary mb-2 line-clamp-1">{post.title}</h4>
                                    <ul className="text-sm text-gray-400 space-y-2">
                                        {post.recommendations.slice(0, 2).map((rec, j) => (
                                            <li key={j} className="flex gap-2 items-start">
                                                <ArrowRight className="w-4 h-4 text-crypto-primary shrink-0 mt-0.5" />
                                                <span>{rec}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        {scores.filter(s => s.score < 80).length === 0 && (
                            <div className="text-center py-8 text-gray-400 italic">
                                Great job! All valid posts have excellent optimization scores.
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">AI Search Best Practices</h2>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-8 h-8 bg-crypto-primary/10 text-crypto-primary rounded-lg flex items-center justify-center font-bold shrink-0">1</div>
                            <div>
                                <h4 className="font-bold text-gray-900">Direct Answers First</h4>
                                <p className="text-sm text-gray-600 mt-1">Start your posts with a 40-60 word paragraph that directly defines the topic or answers the main question.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 bg-crypto-primary/10 text-crypto-primary rounded-lg flex items-center justify-center font-bold shrink-0">2</div>
                            <div>
                                <h4 className="font-bold text-gray-900">Citable Statistics</h4>
                                <p className="text-sm text-gray-600 mt-1">AI loves numbers. Include specific dates, percentages, and amounts to increase your chances of being cited.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 bg-crypto-primary/10 text-crypto-primary rounded-lg flex items-center justify-center font-bold shrink-0">3</div>
                            <div>
                                <h4 className="font-bold text-gray-900">E-E-A-T Signals</h4>
                                <p className="text-sm text-gray-600 mt-1">Ensure every post has an author with a complete biography and verified expertise in the field.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
