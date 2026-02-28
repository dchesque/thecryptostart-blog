"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, ArrowLeft, Image as ImageIcon, Link as LinkIcon, Settings, DollarSign, LayoutTemplate, Tag, Calendar } from "lucide-react";
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
        featuredImageAlt: initialData?.featuredImageAlt || "",
        featuredImageWidth: initialData?.featuredImageWidth || null,
        featuredImageHeight: initialData?.featuredImageHeight || null,
        contentType: initialData?.contentType || "ARTICLE",
        categoryId: initialData?.categoryId || "",
        authorId: initialData?.authorId || "",

        // SEO
        seoTitle: initialData?.seoTitle || "",
        seoDescription: initialData?.seoDescription || "",
        seoImageUrl: initialData?.seoImageUrl || "",
        seoNoindex: initialData?.seoNoindex || false,
        targetKeyword: initialData?.targetKeyword || "",
        secondaryKeywords: initialData?.secondaryKeywords || [],
        canonicalUrl: initialData?.canonicalUrl || "",
        schemaType: initialData?.schemaType || "ARTICLE",

        // Classifications
        difficulty: initialData?.difficulty || "BEGINNER",
        isFeatured: initialData?.isFeatured || false,
        tags: initialData?.tags || [],
        publishDate: initialData?.publishDate ? new Date(initialData.publishDate).toISOString().slice(0, 16) : "",

        // Monetization
        adDensity: initialData?.adDensity || "NORMAL",
        monetizationDisabled: initialData?.monetizationDisabled || false,
        sponsoredBy: initialData?.sponsoredBy || "",
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
            const words = calculateWordCount(formData.content);
            const readingTime = calculateReadingTime(words);
            setStats({ words, readingTime });
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
                    status: initialData ? initialData.status : "DRAFT",
                    publishDate: formData.publishDate ? new Date(formData.publishDate).toISOString() : null
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

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
                                <select
                                    value={formData.contentType}
                                    onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crypto-primary/20 focus:border-crypto-primary transition-all text-sm"
                                >
                                    <option value="ARTICLE">Article</option>
                                    <option value="GUIDE">Guide</option>
                                    <option value="TUTORIAL">Tutorial</option>
                                    <option value="GLOSSARY">Glossary</option>
                                    <option value="REVIEW">Review</option>
                                    <option value="NEWS">News</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                                <select
                                    value={formData.difficulty}
                                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crypto-primary/20 focus:border-crypto-primary transition-all text-sm"
                                >
                                    <option value="BEGINNER">Beginner</option>
                                    <option value="INTERMEDIATE">Intermediate</option>
                                    <option value="ADVANCED">Advanced</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                            <input
                                type="checkbox"
                                id="isFeatured"
                                checked={formData.isFeatured}
                                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                className="w-4 h-4 text-crypto-primary bg-white border-gray-300 rounded focus:ring-crypto-primary"
                            />
                            <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700 select-none cursor-pointer">
                                Featured Post (Pinned)
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                <Tag className="w-4 h-4" /> Tags (comma separated)
                            </label>
                            <textarea
                                value={formData.tags.join(", ")}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(",").map(t => t.trim()).filter(t => t !== "") })}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crypto-primary/20 focus:border-crypto-primary transition-all resize-none h-20 text-sm"
                                placeholder="crypto, blockchain, future"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> Publish Date
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.publishDate}
                                onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crypto-primary/20 focus:border-crypto-primary transition-all text-sm"
                            />
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
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Image Alt Text</label>
                            <input
                                type="text"
                                value={formData.featuredImageAlt}
                                onChange={(e) => setFormData({ ...formData, featuredImageAlt: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crypto-primary/20 focus:border-crypto-primary transition-all text-sm"
                                placeholder="Describe the image..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                                <input
                                    type="number"
                                    value={formData.featuredImageWidth || ""}
                                    onChange={(e) => setFormData({ ...formData, featuredImageWidth: e.target.value ? parseInt(e.target.value) : null })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crypto-primary/20 focus:border-crypto-primary transition-all text-sm"
                                    placeholder="1200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                                <input
                                    type="number"
                                    value={formData.featuredImageHeight || ""}
                                    onChange={(e) => setFormData({ ...formData, featuredImageHeight: e.target.value ? parseInt(e.target.value) : null })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crypto-primary/20 focus:border-crypto-primary transition-all text-sm"
                                    placeholder="630"
                                />
                            </div>
                        </div>

                        {formData.featuredImageUrl && (
                            <div className="mt-4 aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                                <img src={formData.featuredImageUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>

                    {/* SEO Settings */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 text-gray-900 font-medium mb-4">
                            <Settings className="w-5 h-5 text-crypto-primary" />
                            SEO Metadata
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Target Keyword</label>
                                <input
                                    type="text"
                                    value={formData.targetKeyword}
                                    onChange={(e) => setFormData({ ...formData, targetKeyword: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crypto-primary/20 focus:border-crypto-primary transition-all text-sm"
                                    placeholder="main-keyword"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">SEO Description</label>
                            <textarea
                                value={formData.seoDescription}
                                onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crypto-primary/20 focus:border-crypto-primary transition-all resize-none h-20 text-sm"
                                placeholder={formData.excerpt || "Meta description..."}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Keywords (comma separated)</label>
                            <textarea
                                value={formData.secondaryKeywords.join(", ")}
                                onChange={(e) => setFormData({ ...formData, secondaryKeywords: e.target.value.split(",").map(k => k.trim()).filter(k => k !== "") })}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crypto-primary/20 focus:border-crypto-primary transition-all resize-none h-20 text-sm"
                                placeholder="crypto, bitcoin, guide"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">SEO Image URL</label>
                                <input
                                    type="url"
                                    value={formData.seoImageUrl}
                                    onChange={(e) => setFormData({ ...formData, seoImageUrl: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crypto-primary/20 focus:border-crypto-primary transition-all text-sm"
                                    placeholder="https://..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Canonical URL</label>
                                <input
                                    type="url"
                                    value={formData.canonicalUrl}
                                    onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crypto-primary/20 focus:border-crypto-primary transition-all text-sm"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-6">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                                <input
                                    type="checkbox"
                                    id="seoNoindex"
                                    checked={formData.seoNoindex}
                                    onChange={(e) => setFormData({ ...formData, seoNoindex: e.target.checked })}
                                    className="w-4 h-4 text-crypto-primary bg-white border-gray-300 rounded focus:ring-crypto-primary"
                                />
                                <label htmlFor="seoNoindex" className="text-sm font-medium text-gray-700 select-none cursor-pointer">
                                    Noindex (Prevent Indexing)
                                </label>
                            </div>

                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Schema Type</label>
                                <select
                                    value={formData.schemaType}
                                    onChange={(e) => setFormData({ ...formData, schemaType: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crypto-primary/20 focus:border-crypto-primary transition-all text-sm"
                                >
                                    <option value="ARTICLE">Article</option>
                                    <option value="HOW_TO">How-to Guide</option>
                                    <option value="REVIEW">Product Review</option>
                                    <option value="NEWS_ARTICLE">News Article</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Monetization */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 text-gray-900 font-medium mb-4">
                            <DollarSign className="w-5 h-5 text-crypto-primary" />
                            Monetization
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ad Density</label>
                            <select
                                value={formData.adDensity}
                                onChange={(e) => setFormData({ ...formData, adDensity: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crypto-primary/20 focus:border-crypto-primary transition-all text-sm"
                            >
                                <option value="LOW">Low</option>
                                <option value="NORMAL">Normal</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                            <input
                                type="checkbox"
                                id="monetizationDisabled"
                                checked={formData.monetizationDisabled}
                                onChange={(e) => setFormData({ ...formData, monetizationDisabled: e.target.checked })}
                                className="w-4 h-4 text-crypto-primary bg-white border-gray-300 rounded focus:ring-crypto-primary"
                            />
                            <label htmlFor="monetizationDisabled" className="text-sm font-medium text-gray-700 select-none cursor-pointer">
                                Disable Monetization
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sponsored By</label>
                            <input
                                type="text"
                                value={formData.sponsoredBy}
                                onChange={(e) => setFormData({ ...formData, sponsoredBy: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crypto-primary/20 focus:border-crypto-primary transition-all text-sm"
                                placeholder="Brand name..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
