'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

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
                    <p className="text-gray-500 animate-pulse">Calculating AI optimization scores...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-8 bg-red-50 border border-red-200 rounded-2xl text-red-700">
                <h2 className="font-bold text-lg mb-2">Error Loading Dashboard</h2>
                <p>{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                    Try Again
                </button>
            </div>
        )
    }

    const avgScore = scores.length > 0
        ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)
        : 0

    const stats = [
        { label: 'Average AI Score', value: `${avgScore}/100`, color: avgScore >= 80 ? 'text-green-600' : 'text-yellow-600' },
        { label: 'With Quick Answer', value: scores.filter(s => s.hasQuickAnswer).length, total: scores.length },
        { label: 'With FAQ Schema', value: scores.filter(s => s.hasFAQ).length, total: scores.length },
        { label: 'Citable Sentences', value: scores.reduce((sum, s) => sum + s.citableSentences, 0), icon: '📊' },
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">AI Search Optimization</h1>
                    <p className="text-gray-500">Monitor and improve how AI models (ChatGPT, Claude, Perplexity) see your content.</p>
                </div>
                <Link
                    href="/docs/AI_SEARCH_OPTIMIZATION"
                    className="text-sm font-bold text-crypto-primary hover:underline flex items-center gap-1"
                >
                    View Guide ↗
                </Link>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm font-medium mb-2">{stat.label}</h3>
                        <div className={`text-3xl font-bold ${stat.color || 'text-gray-900'}`}>
                            {stat.value}
                            {stat.total !== undefined && (
                                <span className="text-sm text-gray-400 font-normal ml-1">/ {stat.total}</span>
                            )}
                        </div>
                        {stat.icon && <span className="absolute top-4 right-4 opacity-10 text-4xl">{stat.icon}</span>}
                    </div>
                ))}
            </div>

            {/* Posts Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Post Optimization Scores</h2>
                    <div className="flex gap-2 text-xs">
                        <span className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full font-bold">80+ Excellent</span>
                        <span className="flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full font-bold">60-79 Good</span>
                        <span className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-full font-bold">Below 60 Needs Work</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Post Title</th>
                                <th className="px-6 py-4 font-semibold text-center">Score</th>
                                <th className="px-6 py-4 font-semibold text-center">Quick Ans.</th>
                                <th className="px-6 py-4 font-semibold text-center">FAQ</th>
                                <th className="px-6 py-4 font-semibold text-center">Authority</th>
                                <th className="px-6 py-4 font-semibold text-center">Citations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {scores
                                .sort((a, b) => b.score - a.score)
                                .map((post, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 truncate max-w-md">{post.title}</div>
                                            <div className="text-xs text-gray-400 mt-1">/blog/{post.slug}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-black text-sm border-2 ${post.score >= 80 ? 'bg-green-50 text-green-700 border-green-200' :
                                                    post.score >= 60 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                        'bg-red-50 text-red-700 border-red-200'
                                                }`}>
                                                {post.score}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {post.hasQuickAnswer ? '✅' : '❌'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {post.hasFAQ ? '✅' : '❌'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {post.authorBio ? '✅' : '❌'}
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
                <div className="bg-gray-900 rounded-3xl p-8 text-white">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        🚀 Quick Wins
                    </h2>
                    <div className="space-y-4">
                        {scores
                            .filter(s => s.score < 80)
                            .slice(0, 4)
                            .map((post, i) => (
                                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition">
                                    <h4 className="font-bold text-crypto-primary mb-2 line-clamp-1">{post.title}</h4>
                                    <ul className="text-sm text-gray-400 space-y-1">
                                        {post.recommendations.slice(0, 2).map((rec, j) => (
                                            <li key={j} className="flex gap-2">
                                                <span className="text-crypto-primary">→</span> {rec}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                    </div>
                </div>

                <div className="bg-crypto-primary/10 rounded-3xl p-8 border border-crypto-primary/20">
                    <h2 className="text-2xl font-bold text-crypto-navy mb-6">AI Search Best Practices</h2>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-8 h-8 bg-crypto-primary text-white rounded-lg flex items-center justify-center font-bold shrink-0">1</div>
                            <div>
                                <h4 className="font-bold text-gray-900">Direct Answers First</h4>
                                <p className="text-sm text-gray-600">Start your posts with a 40-60 word paragraph that directly defines the topic or answers the main question.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 bg-crypto-primary text-white rounded-lg flex items-center justify-center font-bold shrink-0">2</div>
                            <div>
                                <h4 className="font-bold text-gray-900">Citable Statistics</h4>
                                <p className="text-sm text-gray-600">AI loves numbers. Include specific dates, percentages, and amounts to increase your chances of being cited.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 bg-crypto-primary text-white rounded-lg flex items-center justify-center font-bold shrink-0">3</div>
                            <div>
                                <h4 className="font-bold text-gray-900">E-E-A-T Signals</h4>
                                <p className="text-sm text-gray-600">Ensure every post has an author with a complete biography and verified expertise in the field.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
