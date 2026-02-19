'use client'

import React, { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Trash2, AlertTriangle, Clock, Filter, Loader2 } from 'lucide-react'

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

    const handleAction = async (id: string, action: 'APPROVED' | 'REJECTED' | 'DELETE') => {
        try {
            if (action === 'DELETE') {
                if (!confirm('Permanently delete this comment?')) return
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
            PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            APPROVED: 'bg-green-100 text-green-700 border-green-200',
            REJECTED: 'bg-red-100 text-red-700 border-red-200',
            SPAM: 'bg-orange-100 text-orange-700 border-orange-200'
        }
        return (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles[status]}`}>
                {status}
            </span>
        )
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Comment Moderation</h1>
                    <p className="text-sm text-gray-500 font-medium">Manage discussions and combat spam on your blog</p>
                </div>

                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                    {['all', 'pending', 'approved', 'rejected', 'spam'].map((f) => (
                        <button
                            key={f}
                            onClick={() => { setFilter(f); setPage(1); }}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-widest ${filter === f ? 'bg-crypto-primary text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-50/50 overflow-hidden">
                {loading ? (
                    <div className="py-24 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-8 h-8 text-crypto-primary animate-spin" />
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Syncing database...</p>
                    </div>
                ) : comments.length === 0 ? (
                    <div className="py-24 text-center">
                        <Clock className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-800">No comments found</h3>
                        <p className="text-sm text-gray-400 mt-2">Comments will appear here as users participate.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Author</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Post</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Content</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Spam</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-black uppercase text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {comments.map((c) => (
                                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 text-sm">{c.authorName}</div>
                                            <div className="text-[10px] text-gray-400 font-medium">{c.authorEmail}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-crypto-primary truncate max-w-[150px]">{c.post?.title || c.postSlug}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600 line-clamp-2 max-w-[300px]">{c.content}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(c.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`text-[10px] font-bold ${c.spamScore > 0.5 ? 'text-red-500' : 'text-green-500'}`}>
                                                {(c.spamScore * 100).toFixed(0)}%
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {c.status !== 'APPROVED' && (
                                                    <button
                                                        onClick={() => handleAction(c.id, 'APPROVED')}
                                                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Approve"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {c.status !== 'REJECTED' && (
                                                    <button
                                                        onClick={() => handleAction(c.id, 'REJECTED')}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Reject"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleAction(c.id, 'DELETE')}
                                                    className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600 rounded-lg transition-colors" title="Delete"
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

            {pagination.pages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                    {Array.from({ length: pagination.pages }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${page === i + 1 ? 'bg-crypto-primary text-white shadow-lg' : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
