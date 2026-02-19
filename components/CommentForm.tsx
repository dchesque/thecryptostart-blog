'use client'

import React, { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'

interface CommentFormProps {
    postSlug: string
    parentId?: string | null
    onSuccess?: () => void
}

export default function CommentForm({ postSlug, parentId = null, onSuccess }: CommentFormProps) {
    const [formData, setFormData] = useState({
        authorName: '',
        authorEmail: '',
        content: '',
        website: '' // Honeypot
    })
    const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE')
    const [errorMsg, setErrorMsg] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('LOADING')
        setErrorMsg('')

        try {
            const resp = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, postSlug, parentId })
            })

            const data = await resp.json()

            if (!resp.ok) {
                throw new Error(data.error || 'Something went wrong')
            }

            setStatus('SUCCESS')
            setFormData({ authorName: '', authorEmail: '', content: '', website: '' })
            if (onSuccess) onSuccess()
        } catch (err: any) {
            setStatus('ERROR')
            setErrorMsg(err.message)
        }
    }

    if (status === 'SUCCESS') {
        return (
            <div className="p-8 bg-green-50 border border-green-100 rounded-2xl text-center">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-green-800 mb-2">Comment submitted!</h3>
                <p className="text-sm text-green-700">Your comment has been received and is awaiting moderation to keep our community safe.</p>
                <button
                    onClick={() => setStatus('IDLE')}
                    className="mt-4 text-xs font-bold text-green-800 uppercase tracking-widest hover:underline"
                >
                    Submit another
                </button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Honeypot - Hidden from users */}
            <input
                type="text"
                name="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="hidden"
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Your Name</label>
                    <input
                        required
                        type="text"
                        placeholder="Ex: John Doe"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-crypto-primary focus:ring-4 focus:ring-crypto-primary/5 transition-all outline-none text-sm font-medium"
                        value={formData.authorName}
                        onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email (Not published)</label>
                    <input
                        required
                        type="email"
                        placeholder="Ex: john@email.com"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-crypto-primary focus:ring-4 focus:ring-crypto-primary/5 transition-all outline-none text-sm font-medium"
                        value={formData.authorEmail}
                        onChange={(e) => setFormData({ ...formData, authorEmail: e.target.value })}
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Comment</label>
                <textarea
                    required
                    rows={4}
                    placeholder="Share your thoughts on this article..."
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-crypto-primary focus:ring-4 focus:ring-crypto-primary/5 transition-all outline-none text-sm font-medium resize-none"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
            </div>

            {status === 'ERROR' && (
                <p className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">{errorMsg}</p>
            )}

            <button
                disabled={status === 'LOADING'}
                type="submit"
                className="group relative w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-crypto-primary text-white font-black uppercase tracking-[0.2em] rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-crypto-primary/20"
            >
                {status === 'LOADING' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <>
                        Post Comment
                        <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </button>

            <p className="text-[10px] text-center text-gray-400 font-medium">
                Your email address will not be published. Required fields are marked with *
            </p>
        </form>
    )
}
