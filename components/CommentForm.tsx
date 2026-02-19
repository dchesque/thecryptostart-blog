'use client'

import React, { useState } from 'react'
import { Send, Loader2, CheckCircle2 } from 'lucide-react'

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
                body: JSON.stringify({
                    ...formData,
                    postSlug,
                    parentId,
                    website: formData.website // Explicitly send honeypot
                })
            })

            const data = await resp.json()

            if (!resp.ok) {
                throw new Error(data.error || 'Something went wrong')
            }

            setStatus('SUCCESS')
            setFormData({ authorName: '', authorEmail: '', content: '', website: '' })
            if (onSuccess) onSuccess()

            // Return to IDLE after some time to allow another comment
            setTimeout(() => setStatus('IDLE'), 5000)
        } catch (err: any) {
            setStatus('ERROR')
            setErrorMsg(err.message)
        }
    }

    if (status === 'SUCCESS') {
        return (
            <div className="p-8 bg-green-50 border border-green-100 rounded-[2rem] text-center animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-white text-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm shadow-green-100/50">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-2 tracking-tight">Comment Received!</h3>
                <p className="text-sm text-green-700 font-medium max-w-xs mx-auto mb-6">
                    Thanks for joining the discussion. Your message is awaiting moderation to prevent spam.
                </p>
                <button
                    onClick={() => setStatus('IDLE')}
                    className="text-xs font-black text-green-800 uppercase tracking-[0.2em] hover:opacity-70 transition-opacity"
                >
                    Post another message
                </button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Honeypot - Hidden from users */}
            <div className="hidden" aria-hidden="true">
                <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    tabIndex={-1}
                    autoComplete="off"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Screen Name *</label>
                    <input
                        required
                        type="text"
                        placeholder="Ex: CryptoPioneer"
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-crypto-primary focus:ring-4 focus:ring-crypto-primary/5 transition-all outline-none text-sm font-bold placeholder:text-gray-300 placeholder:font-medium"
                        value={formData.authorName}
                        onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email (Private) *</label>
                    <input
                        required
                        type="email"
                        placeholder="Ex: john@email.com"
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-crypto-primary focus:ring-4 focus:ring-crypto-primary/5 transition-all outline-none text-sm font-bold placeholder:text-gray-300 placeholder:font-medium"
                        value={formData.authorEmail}
                        onChange={(e) => setFormData({ ...formData, authorEmail: e.target.value })}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Your Perspective *</label>
                <textarea
                    required
                    rows={5}
                    placeholder="Share your insights or questions..."
                    className="w-full px-5 py-5 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:bg-white focus:border-crypto-primary focus:ring-4 focus:ring-crypto-primary/5 transition-all outline-none text-sm font-bold placeholder:text-gray-300 placeholder:font-medium resize-none leading-relaxed"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
            </div>

            {status === 'ERROR' && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <div className="w-8 h-8 shrink-0 bg-white text-red-500 rounded-xl flex items-center justify-center shadow-sm">
                        <span className="font-bold text-xs">!</span>
                    </div>
                    <p className="text-xs font-bold text-red-600">{errorMsg}</p>
                </div>
            )}

            <button
                disabled={status === 'LOADING'}
                type="submit"
                className="group relative w-full inline-flex items-center justify-center gap-3 px-8 py-5 bg-crypto-primary text-white font-black uppercase tracking-[0.25em] rounded-2xl hover:bg-blue-700 transition-all disabled:opacity-50 shadow-xl shadow-crypto-primary/20 active:scale-[0.98]"
            >
                {status === 'LOADING' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <>
                        Submit Comment
                        <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                )}
            </button>

            <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-tight">
                🔒 Secure, spam-free environment. Emails are never shared.
            </p>
        </form>
    )
}
