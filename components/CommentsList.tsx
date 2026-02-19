'use client'

import React, { useEffect, useState } from 'react'
import { MessageSquare, Calendar, User, CornerDownRight, Loader2 } from 'lucide-react'

interface Comment {
    id: string
    authorName: string
    content: string
    createdAt: string
    replies?: Comment[]
}

interface CommentsListProps {
    postSlug: string
    refreshKey: number
}

export default function CommentsList({ postSlug, refreshKey }: CommentsListProps) {
    const [comments, setComments] = useState<Comment[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const resp = await fetch(`/api/comments?postSlug=${postSlug}`)
                if (!resp.ok) throw new Error('Failed to fetch comments')
                const data = await resp.json()

                if (Array.isArray(data)) {
                    setComments(data)
                } else {
                    console.error('Data is not an array:', data)
                    setComments([])
                }
            } catch (err) {
                console.error('Failed to fetch comments:', err)
                setComments([])
            } finally {
                setLoading(false)
            }
        }
        fetchComments()
    }, [postSlug, refreshKey])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="w-8 h-8 text-crypto-primary animate-spin" />
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading discussions...</p>
            </div>
        )
    }

    if (!Array.isArray(comments) || comments.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-800">Be the first to comment</h3>
                <p className="text-sm text-gray-500 mt-2">No conversations started yet. What do you think of this article?</p>
            </div>
        )
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }


    return (
        <div className="space-y-8">
            {comments.map((comment) => (
                <div key={comment.id} className="space-y-4">
                    {/* Main Comment */}
                    <div className="group bg-white p-6 rounded-2xl border border-gray-100 hover:border-crypto-primary/20 transition-all shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center border border-gray-200">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-black text-crypto-darker text-sm">{comment.authorName}</h4>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                        <Calendar className="w-3 h-3" />
                                        {formatDate(comment.createdAt)}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed pl-1">
                            {comment.content}
                        </p>
                    </div>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                        <div className="ml-8 md:ml-12 space-y-4 relative">
                            <div className="absolute left-[-20px] top-[-10px] bottom-10 border-l-2 border-dashed border-gray-100" />
                            {comment.replies.map((reply) => (
                                <div key={reply.id} className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 relative group transition-all hover:bg-white hover:border-crypto-primary/10">
                                    <div className="absolute left-[-20px] top-6 w-4 border-t-2 border-dashed border-gray-100" />
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 bg-white text-crypto-primary rounded-full flex items-center justify-center border border-crypto-primary/10 shadow-sm">
                                            <CornerDownRight className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-crypto-darker text-xs flex items-center gap-2">
                                                {reply.authorName}
                                                <span className="px-1.5 py-0.5 bg-crypto-primary/10 text-crypto-primary text-[8px] rounded uppercase">Staff</span>
                                            </h4>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">
                                                {formatDate(reply.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-600 leading-relaxed italic">
                                        {reply.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>

    )
}
