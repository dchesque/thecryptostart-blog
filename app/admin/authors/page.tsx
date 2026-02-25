"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { AuthorModal } from "@/components/admin/AuthorModal";

interface Author {
    id: string;
    name: string;
    slug: string;
    bio: string | null;
    avatar: string | null;
    socialLinks: any | null;
    createdAt: string;
    _count?: {
        posts: number;
    };
}

export default function AuthorsPage() {
    const [authors, setAuthors] = useState<Author[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);

    const fetchAuthors = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/authors?limit=100");
            if (!res.ok) throw new Error("Failed to fetch authors");
            const data = await res.json();
            setAuthors(data.authors || []);
        } catch (error) {
            console.error(error);
            alert("Failed to load authors.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAuthors();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this author?")) return;

        try {
            const res = await fetch(`/api/admin/authors/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete");
            fetchAuthors();
        } catch (error) {
            console.error(error);
            alert("Failed to delete author.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Authors</h1>
                    <p className="text-gray-500 mt-1">Manage blog authors and their public profiles.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingAuthor(null);
                        setIsModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-crypto-primary text-white rounded-xl hover:bg-crypto-darker transition-colors font-medium shadow-sm shadow-crypto-primary/20"
                >
                    <Plus className="w-5 h-5" />
                    New Author
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-medium">Author</th>
                                <th className="px-6 py-4 font-medium px-4">Slug</th>
                                <th className="px-6 py-4 font-medium text-center">Posts published</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Loading authors...
                                    </td>
                                </tr>
                            ) : authors.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        No authors found. Create your first author to get started.
                                    </td>
                                </tr>
                            ) : (
                                authors.map((author) => (
                                    <tr key={author.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 bg-gray-100 border border-gray-200 overflow-hidden">
                                                    {author.avatar ? (
                                                        <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-sm font-bold text-gray-400 uppercase">{author.name.substring(0, 2)}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">{author.name}</div>
                                                    {author.bio && (
                                                        <div className="text-xs text-gray-500 line-clamp-1 max-w-xs">{author.bio}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                            {author.slug}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                <span className="inline-flex items-center justify-center min-w-[2rem] h-6 px-2 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                                                    {author._count?.posts || 0}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingAuthor(author);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-crypto-primary hover:bg-crypto-primary/10 rounded-lg transition-colors"
                                                    title="Edit author"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(author.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete author"
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

            <AuthorModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingAuthor(null);
                }}
                author={editingAuthor}
                onSuccess={fetchAuthors}
            />
        </div>
    );
}
