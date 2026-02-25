"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, Search, Loader2, ArrowUpRight, Check, X } from "lucide-react";
import { format } from "date-fns";

interface Post {
    id: string;
    title: string;
    slug: string;
    status: "DRAFT" | "PUBLISHED";
    createdAt: string;
    publishDate: string | null;
    author: { name: string } | null;
    category: { name: string } | null;
}

export default function PostsPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchPosts = async () => {
        setIsLoading(true);
        try {
            const searchParam = debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : "";
            const res = await fetch(`/api/admin/posts?limit=50${searchParam}`);
            if (!res.ok) throw new Error("Failed to fetch posts");
            const data = await res.json();
            setPosts(data.posts || []);
        } catch (error) {
            console.error(error);
            alert("Failed to load posts.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [debouncedSearch]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) return;

        try {
            const res = await fetch(`/api/admin/posts/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete");
            fetchPosts();
        } catch (error) {
            console.error(error);
            alert("Failed to delete post.");
        }
    };

    const handlePublishToggle = async (id: string, currentStatus: string) => {
        if (!confirm(`Are you sure you want to ${currentStatus === 'PUBLISHED' ? 'unpublish' : 'publish'} this post?`)) return;

        try {
            const res = await fetch(`/api/admin/posts/${id}/publish`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ publish: currentStatus !== 'PUBLISHED' })
            });

            if (!res.ok) throw new Error("Failed to toggle publish status");
            fetchPosts();
        } catch (error) {
            console.error(error);
            alert("Failed to update post status.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Posts</h1>
                    <p className="text-gray-500 mt-1">Manage all your blog articles and content.</p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search posts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crypto-primary/20 focus:border-crypto-primary transition-all text-sm"
                        />
                    </div>
                    <Link
                        href="/admin/posts/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-crypto-primary text-white rounded-xl hover:bg-crypto-darker transition-colors font-medium shadow-sm shadow-crypto-primary/20 shrink-0"
                    >
                        <Plus className="w-5 h-5" />
                        New Post
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-medium">Post Details</th>
                                <th className="px-6 py-4 font-medium">Author</th>
                                <th className="px-6 py-4 font-medium">Category</th>
                                <th className="px-6 py-4 font-medium">Status / Date</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Loading posts...
                                    </td>
                                </tr>
                            ) : posts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No posts found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                posts.map((post) => (
                                    <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900 line-clamp-1">{post.title}</div>
                                            <div className="text-xs text-gray-500 font-mono mt-0.5">{post.slug}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {post.author?.name || "Unknown"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-700">
                                                {post.category?.name || "Uncategorized"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col items-start gap-1">
                                                <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${post.status === "PUBLISHED"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-amber-100 text-amber-800"
                                                    }`}>
                                                    {post.status}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {post.publishDate
                                                        ? format(new Date(post.publishDate), "MMM d, yyyy")
                                                        : format(new Date(post.createdAt), "MMM d, yyyy")}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handlePublishToggle(post.id, post.status)}
                                                    className={`p-2 rounded-lg transition-colors ${post.status === "PUBLISHED"
                                                            ? "text-amber-500 hover:bg-amber-50"
                                                            : "text-green-500 hover:bg-green-50"
                                                        }`}
                                                    title={post.status === 'PUBLISHED' ? "Unpublish" : "Publish"}
                                                >
                                                    {post.status === 'PUBLISHED' ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                                </button>

                                                <a
                                                    href={`/blog/${post.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-gray-400 hover:text-crypto-primary hover:bg-crypto-primary/10 rounded-lg transition-colors"
                                                    title="View post"
                                                >
                                                    <ArrowUpRight className="w-4 h-4" />
                                                </a>

                                                <Link
                                                    href={`/admin/posts/${post.id}/edit`}
                                                    className="p-2 text-gray-400 hover:text-crypto-primary hover:bg-crypto-primary/10 rounded-lg transition-colors"
                                                    title="Edit post"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Link>

                                                <button
                                                    onClick={() => handleDelete(post.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete post"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
