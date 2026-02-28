"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, ArrowLeft, Image as ImageIcon, Link as LinkIcon, Settings, DollarSign, LayoutTemplate } from "lucide-react";
import { calculateWordCount, calculateReadingTime, generateSlugFromTitle } from "@/lib/posts";

interface PostFormProps {
    initialData?: any;
}

export function PostForm({ initialData }: PostFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [authors, setAuthors] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        slug: initialData?.slug || "",
        content: initialData?.content || "",
        excerpt: initialData?.excerpt || "",
        featuredImageUrl: initialData?.featuredImageUrl || "",
        contentType: initialData?.contentType || "ARTICLE",
        categoryId: initialData?.categoryId || "",
        authorId: initialData?.authorId || "",

        // SEO
        seoTitle: initialData?.seoTitle || "",
        seoDescription: initialData?.seoDescription || "",
        seoKeywords: initialData?.seoKeywords || "",

        // Monetization
        isPremium: initialData?.isPremium || false,
        requiredTier: initialData?.requiredTier || "FREE",
    });

    const [stats, setStats] = useState({ words: 0, readingTime: 0 });

    useEffect(() => {
        // Fetch Categories and Authors
        Promise.all([
            fetch("/api/admin/categories").then(res => res.json()),
            fetch("/api/admin/authors").then(res => res.json())
        ]).then(([catsData, authsData]) => {
            setCategories(catsData.categories || []);
            setAuthors(authsData.authors || []);

            // Auto select if creating new and lists have items
            if (!initialData) {
                if (catsData.categories?.length > 0) {
                    setFormData(prev => ({ ...prev, categoryId: catsData.categories[0].id }));
                }
                if (authsData.authors?.length > 0) {
                    setFormData(prev => ({ ...prev, authorId: authsData.authors[0].id }));
                }
            }
        }).catch(err => console.error("Failed to load categories/authors", err));
    }, [initialData]);

    useEffect(() => {
        // Auto update stats when content changes
        if (formData.content) {
            setStats({
                words: calculateWordCount(formData.content),
                readingTime: calculateReadingTime(formData.content)
            });
        } else {
            setStats({ words: 0, readingTime: 0 });
        }
    }, [formData.content]);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setFormData(prev => ({
            ...prev,
            title,
            slug: !initialData ? generateSlugFromTitle(title) : prev.slug
        }));
    };

    const handleSubmit = async (e: React.FormEvent, publish: boolean = false) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const url = initialData
                ? `/api/admin/posts/${initialData.id}`
                : `/api/admin/posts`;

            const method = initialData ? "PUT" : "POST";

            // Submit basic post data
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    wordCount: stats.words,
                    readingTime: stats.readingTime,
                    status: initialData ? initialData.status : "DRAFT"
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to save post");
            }

            const savedPost = await res.json();

            // If requested to publish specifically
            if (publish) {
                const pubRes = await fetch(`/api/admin/posts/${savedPost.id}/publish`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ publish: true })
                });
                if (!pubRes.ok) throw new Error("Saved, but failed to publish.");
            }

            router.push("/admin/posts");
            router.refresh();
        } catch (error: any) {
            console.error(error);
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
            {/* Action Bar */}
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm sticky top-[4.5rem] z-30">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400 font-medium px-4">
                        {stats.words} words • {stats.readingTime} min read
                    </span>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Draft
                    </button>
                    <button
                        type="button"
                        onClick={(e) => handleSubmit(e, true)}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-crypto-primary text-white font-medium rounded-xl hover:bg-crypto-darker transition-colors shadow-sm shadow-crypto-primary/20"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {initialData?.status === 'PUBLISHED' ? 'Update & Publish' : 'Publish Now'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* General Settings */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 text-gray-900 font-medium mb-4">
                            <LayoutTemplate className="w-5 h-5 text-crypto-primary" />
                            General Information
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Post Title</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={handleTitleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crypto-primary/20 focus:border-crypto-primary transition-all text-lg font-semibold"
                                placeholder="E.g. The Future of Bitcoin"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
                            <input
                                type="text"
                                required
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crypto-primary/20 focus:border-crypto-primary transition-all font-mono text-sm"
                                placeholder="the-future-of-bitcoin"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Short Excerpt</label>
                            <textarea
                                required
                                value={formData.excerpt}
                                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crypto-primary/20 focus:border-crypto-primary transition-all resize-none h-24 text-sm"
                                placeholder="A brief summary of the post..."
                            />
                        </div>
                    </div>

                    {/* Editor */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[800px]">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-2xl">
                            <div className="font-medium text-gray-900">Markdown Content</div>
                        </div>
                        <textarea
                            required
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="flex-1 w-full p-6 bg-transparent border-none focus:ring-0 resize-none font-mono text-sm leading-relaxed"
                            placeholder="Write your article content here using Markdown..."
                        />
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    {/* Organization */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 text-gray-900 font-medium mb-4">
                            <LinkIcon className="w-5 h-5 text-crypto-primary" />
                            Organization
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                            <select
                                required
                                value={formData.authorId}
                                onChange={(e) => setFormData({ ...formData, authorId: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crypto-primary/20 focus:border-crypto-primary transition-all text-sm"
                            >
                                <option value="" disabled>Select an author</option>
                                {authors.map(a => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                required
                                value={formData.categoryId}
                                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crypto-primary/20 focus:border-crypto-primary transition-all text-sm"
                            >
                                <option value="" disabled>Select a category</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
                            <select
                                value={formData.contentType}
                                onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crypto-primary/20 focus:border-crypto-primary transition-all text-sm"
                            >
                                <option value="article">Article</option>
                                <option value="tutorial">Tutorial</option>
                                <option value="report">Market Report</option>
                            </select>
                        </div>
                    </div>

                    {/* Media */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 text-gray-900 font-medium mb-4">
                            <ImageIcon className="w-5 h-5 text-crypto-primary" />
                            Media
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
                            <input
                                type="url"
                                value={formData.featuredImageUrl}
                                onChange={(e) => setFormData({ ...formData, featuredImageUrl: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crypto-primary/20 focus:border-crypto-primary transition-all text-sm"
                                placeholder="https://..."
                            />
                            {formData.featuredImageUrl && (
                                <div className="mt-4 aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                                    <img src={formData.featuredImageUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SEO Settings */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 text-gray-900 font-medium mb-4">
                            <Settings className="w-5 h-5 text-crypto-primary" />
                            SEO Metadata
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
                            <input
                                type="text"
                                value={formData.seoTitle}
                                onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crypto-primary/20 focus:border-crypto-primary transition-all text-sm"
                                placeholder={formData.title || "SEO Title"}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">SEO Description</label>
                            <textarea
                                value={formData.seoDescription}
                                onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crypto-primary/20 focus:border-crypto-primary transition-all resize-none h-24 text-sm"
                                placeholder={formData.excerpt || "Meta description..."}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
                            <input
                                type="text"
                                value={formData.seoKeywords}
                                onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crypto-primary/20 focus:border-crypto-primary transition-all text-sm"
                                placeholder="bitcoin, crypto, trading"
                            />
                        </div>
                    </div>

                    {/* Monetization */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 text-gray-900 font-medium mb-4">
                            <DollarSign className="w-5 h-5 text-crypto-primary" />
                            Monetization
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                            <input
                                type="checkbox"
                                id="isPremium"
                                checked={formData.isPremium}
                                onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                                className="w-4 h-4 text-crypto-primary bg-white border-gray-300 rounded focus:ring-crypto-primary"
                            />
                            <label htmlFor="isPremium" className="text-sm font-medium text-gray-700 select-none cursor-pointer">
                                Premium Content
                            </label>
                        </div>

                        {formData.isPremium && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Required Tier</label>
                                <select
                                    value={formData.requiredTier}
                                    onChange={(e) => setFormData({ ...formData, requiredTier: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crypto-primary/20 focus:border-crypto-primary transition-all text-sm"
                                >
                                    <option value="FREE">Free User</option>
                                    <option value="PRO">Pro Tier</option>
                                    <option value="VIP">VIP Tier</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </form>
    );
}
