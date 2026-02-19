'use client'

import React, { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Trash2, Clock, Loader2, ShieldAlert, MessageSquare } from 'lucide-react'

export default function AdminCommentsPage() {
    const [comments, setComments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [page, setPage] = useState(1)
    const [pagination, setPagination] = useState({ total: 0, pages: 1, currentPage: 1 })

    const fetchComments = async () => {
        setLoading(true)
        try {
            const resp = await fetch(`/api/admin/comments?status=${filter}&page=${page}`)
            const data = await resp.json()
            setComments(data.comments || [])
            setPagination(data.pagination)
        } catch (err) {
            console.error('Failed to fetch admin comments')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchComments()
    }, [filter, page])

    const handleAction = async (id: string, action: 'APPROVED' | 'REJECTED' | 'SPAM' | 'DELETE') => {
        try {
            if (action === 'DELETE') {
                if (!confirm('Permanently delete this comment? This action cannot be undone.')) return
                await fetch(`/api/admin/comments/${id}`, { method: 'DELETE' })
            } else {
                await fetch(`/api/admin/comments/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: action })
                })
            }
            fetchComments()
        } catch (err) {
            alert('Error processing action')
        }
    }

    const getStatusBadge = (status: string) => {
        const styles: any = {
            PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
            APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            REJECTED: 'bg-rose-100 text-rose-700 border-rose-200',
            SPAM: 'bg-gray-100 text-gray-700 border-gray-200'
        }
        return (
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${styles[status] || styles.PENDING}`}>
                {status}
            </span>
        )
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-crypto-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-crypto-primary/20">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight italic">Comment <span className="text-crypto-primary">Control</span></h1>
                    </div>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest ml-13">Vanguard Protection & Moderation Hub</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                    {['all', 'pending', 'approved', 'rejected', 'spam'].map((f) => (
                        <button
                            key={f}
                            onClick={() => { setFilter(f); setPage(1); }}
                            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-crypto-primary shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-100/50 overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/50 backdrop-blur-sm z-10">
                        <Loader2 className="w-10 h-10 text-crypto-primary animate-spin" />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Synching with blockchain...</p>
                    </div>
                ) : null}

                {comments.length === 0 && !loading ? (
                    <div className="py-32 text-center">
                        <div className="w-20 h-20 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 tracking-tight">Zero Activity Detected</h3>
                        <p className="text-sm text-gray-400 mt-2 font-medium">No comments found matching the current filters.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Contributor</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Post Context</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Perspective</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Status / Risk</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {comments.map((c) => (
                                    <tr key={c.id} className="hover:bg-gray-50/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-black text-gray-900 text-sm italic">{c.authorName}</span>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{c.authorEmail}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-sm font-bold text-crypto-primary truncate max-w-[200px]">
                                                {c.post?.title || c.postSlug}
                                            </div>
                                            <div className="text-[9px] text-gray-300 font-medium uppercase mt-0.5 tracking-tighter">{new Date(c.createdAt).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm text-gray-600 line-clamp-2 max-w-[400px] font-medium leading-relaxed italic">
                                                "{c.content}"
                                            </p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col items-center gap-2">
                                                {getStatusBadge(c.status)}
                                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 rounded-md border border-gray-100">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${c.spamScore > 0.7 ? 'bg-rose-500 animate-pulse' : c.spamScore > 0.3 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                                    <span className="text-[9px] font-black uppercase text-gray-500">{(c.spamScore * 100).toFixed(0)}% Score</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {c.status !== 'APPROVED' && (
                                                    <button
                                                        onClick={() => handleAction(c.id, 'APPROVED')}
                                                        className="p-2.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all shadow-sm shadow-emerald-100/50" title="Verify & Release"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {c.status !== 'REJECTED' && c.status !== 'SPAM' && (
                                                    <button
                                                        onClick={() => handleAction(c.id, 'REJECTED')}
                                                        className="p-2.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all shadow-sm shadow-rose-100/50" title="Flag & Reject"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {c.status !== 'SPAM' && (
                                                    <button
                                                        onClick={() => handleAction(c.id, 'SPAM')}
                                                        className="p-2.5 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all shadow-sm shadow-gray-100/50" title="Mark as Malware/Spam"
                                                    >
                                                        <ShieldAlert className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <div className="w-px h-6 bg-gray-100 mx-1" />
                                                <button
                                                    onClick={() => handleAction(c.id, 'DELETE')}
                                                    className="p-2.5 text-gray-400 hover:text-white hover:bg-rose-500 rounded-xl transition-all shadow-sm" title="Erase from Archive"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-3 py-4">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="px-4 py-2 border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-all"
                    >
                        Previous
                    </button>
                    <div className="flex gap-2">
                        {Array.from({ length: pagination.pages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i + 1)}
                                className={`w-10 h-10 rounded-2xl text-[10px] font-black transition-all ${page === i + 1 ? 'bg-crypto-primary text-white shadow-xl shadow-crypto-primary/20 scale-110' : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <button
                        disabled={page === pagination.pages}
                        onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                        className="px-4 py-2 border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-all"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}
