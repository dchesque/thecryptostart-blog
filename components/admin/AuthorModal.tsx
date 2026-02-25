"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

interface Author {
    id: string;
    name: string;
    slug: string;
    bio: string | null;
    avatar: string | null;
    socialLinks: any | null;
}

interface AuthorModalProps {
    isOpen: boolean;
    onClose: () => void;
    author?: Author | null;
    onSuccess: () => void;
}

export function AuthorModal({ isOpen, onClose, author, onSuccess }: AuthorModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        bio: "",
        avatar: "",
        socialLinks: { twitter: "" },
    });

    useEffect(() => {
        if (author) {
            setFormData({
                name: author.name || "",
                slug: author.slug || "",
                bio: author.bio || "",
                avatar: author.avatar || "",
                socialLinks: author.socialLinks || { twitter: "" },
            });
        } else {
            setFormData({
                name: "",
                slug: "",
                bio: "",
                avatar: "",
                socialLinks: { twitter: "" },
            });
        }
    }, [author, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const url = author
                ? `/api/admin/authors/${author.id}`
                : "/api/admin/authors";
            const method = author ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    slug: formData.slug,
                    bio: formData.bio || null,
                    avatar: formData.avatar || null,
                    socialLinks: formData.socialLinks,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to save author");
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setFormData(prev => ({
            ...prev,
            name,
            // Auto-generate slug if it's a new author
            slug: !author ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : prev.slug
        }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">
                        {author ? "Edit Author" : "New Author"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Author Name
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleNameChange}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crypto-primary/20 focus:border-crypto-primary transition-all"
                                placeholder="e.g. John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Slug
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crypto-primary/20 focus:border-crypto-primary transition-all font-mono text-sm"
                                placeholder="e.g. john-doe"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Avatar URL
                            </label>
                            <input
                                type="url"
                                value={formData.avatar}
                                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crypto-primary/20 focus:border-crypto-primary transition-all text-sm"
                                placeholder="https://..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Short Bio
                            </label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crypto-primary/20 focus:border-crypto-primary transition-all resize-none h-24"
                                placeholder="Brief author bio..."
                                maxLength={250}
                            />
                            <div className="text-right mt-1">
                                <span className="text-xs text-gray-400">{formData.bio.length}/250</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Twitter / X Handle
                            </label>
                            <div className="flex">
                                <span className="inline-flex items-center px-4 py-2 text-sm text-gray-500 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl">
                                    @
                                </span>
                                <input
                                    type="text"
                                    value={formData.socialLinks.twitter || ""}
                                    onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, twitter: e.target.value } })}
                                    className="flex-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-r-xl focus:ring-2 focus:ring-crypto-primary/20 focus:border-crypto-primary transition-all text-sm"
                                    placeholder="username"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-crypto-primary text-white font-medium rounded-xl hover:bg-crypto-darker transition-colors shadow-sm shadow-crypto-primary/20 min-w-[120px]"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : author ? (
                                "Save Changes"
                            ) : (
                                "Create Author"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
