'use client'

import React, { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Trash2, Clock, Loader2, ShieldAlert, MessageSquare, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

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

        const label = status.charAt(0) + status.slice(1).toLowerCase();

        return (
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status] || styles.PENDING}`}>
                {label}
            </span>
        )
    }

    const tabs = [
        { id: 'all', label: 'All Comments' },
        { id: 'pending', label: 'Pending' },
        { id: 'approved', label: 'Approved' },
        { id: 'rejected', label: 'Rejected' },
        { id: 'spam', label: 'Spam' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Comment Management</h1>
                    <p className="text-gray-500 mt-2">Moderate and manage reader comments across your blog.</p>
                </div>

                {pagination.total > 0 && (
                    <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm text-sm font-medium text-gray-600">
                        Total: <span className="font-bold text-gray-900">{pagination.total}</span> comments
                    </div>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="bg-white p-1 rounded-xl border border-gray-100 inline-flex flex-wrap gap-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => { setFilter(tab.id); setPage(1); }}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                            filter === tab.id
                                ? "bg-crypto-primary text-white shadow-sm"
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px] relative">
                {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/80 backdrop-blur-sm z-10">
                        <Loader2 className="w-10 h-10 text-crypto-primary animate-spin" />
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading comments...</p>
                    </div>
                )}

                {comments.length === 0 && !loading ? (
                    <div className="py-32 text-center">
                        <div className="w-20 h-20 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MessageSquare className="w-10 h-10" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">No Comments Found</h3>
                        <p className="text-sm text-gray-500 mt-2">There are no comments matching the current filter.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">Author</th>
                                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">Post</th>
                                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">Comment</th>
                                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-400 text-center">Status / Risk</th>
                                    <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {comments.map((c) => (
                                    <tr key={c.id} className="hover:bg-gray-50/30 transition-colors group">
                                        <td className="px-6 py-4 align-top">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 uppercase">
                                                    {c.authorName?.charAt(0) || '?'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900 text-sm">{c.authorName}</span>
                                                    <span className="text-xs text-gray-400">{c.authorEmail}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <div className="text-sm font-bold text-crypto-primary truncate max-w-[180px]" title={c.post?.title || c.postSlug}>
                                                {c.post?.title || c.postSlug}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                {new Date(c.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <p className="text-sm text-gray-600 line-clamp-2 max-w-[350px] italic bg-gray-50 p-2 rounded-lg border border-gray-100">
                                                "{c.content}"
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <div className="flex flex-col items-center gap-2">
                                                {getStatusBadge(c.status)}
                                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 rounded-md border border-gray-100 mt-1" title="Spam Likelihood">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${c.spamScore > 0.7 ? 'bg-rose-500 animate-pulse' : c.spamScore > 0.3 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                                    <span className="text-[9px] font-bold uppercase text-gray-500">{(c.spamScore * 100).toFixed(0)}% Risk</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                {c.status !== 'APPROVED' && (
                                                    <button
                                                        onClick={() => handleAction(c.id, 'APPROVED')}
                                                        className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-all border border-emerald-100" title="Approve"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {c.status !== 'REJECTED' && c.status !== 'SPAM' && (
                                                    <button
                                                        onClick={() => handleAction(c.id, 'REJECTED')}
                                                        className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all border border-rose-100" title="Reject"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {c.status !== 'SPAM' && (
                                                    <button
                                                        onClick={() => handleAction(c.id, 'SPAM')}
                                                        className="p-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all border border-gray-200" title="Mark as Spam"
                                                    >
                                                        <ShieldAlert className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <div className="w-px h-6 bg-gray-200 mx-1" />
                                                <button
                                                    onClick={() => handleAction(c.id, 'DELETE')}
                                                    className="p-2 text-gray-400 hover:text-white hover:bg-rose-500 rounded-lg transition-all" title="Delete Permanently"
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
                <div className="flex justify-center items-center gap-3 pb-8">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-500 hover:bg-white hover:text-gray-900 disabled:opacity-30 transition-all bg-gray-50"
                    >
                        Previous
                    </button>
                    <div className="flex gap-2">
                        {Array.from({ length: pagination.pages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i + 1)}
                                className={cn(
                                    "w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center",
                                    page === i + 1
                                        ? "bg-crypto-primary text-white shadow-md"
                                        : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-200"
                                )}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <button
                        disabled={page === pagination.pages}
                        onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-500 hover:bg-white hover:text-gray-900 disabled:opacity-30 transition-all bg-gray-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}
