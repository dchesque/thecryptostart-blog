"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { CategoryModal } from "@/components/admin/CategoryModal";

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string;
    color: string | null;
    order: number;
    createdAt: string;
    _count?: {
        posts: number;
    };
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/categories?limit=100");
            if (!res.ok) throw new Error("Failed to fetch categories");
            const data = await res.json();
            setCategories(data.categories || []);
        } catch (error) {
            console.error(error);
            alert("Failed to load categories.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this category?")) return;

        try {
            const res = await fetch(`/api/admin/categories/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete");
            fetchCategories();
        } catch (error) {
            console.error(error);
            alert("Failed to delete category.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Categories</h1>
                    <p className="text-gray-500 mt-1">Manage blog categories and their visual appearance.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingCategory(null);
                        setIsModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-crypto-primary text-white rounded-xl hover:bg-crypto-darker transition-colors font-medium shadow-sm shadow-crypto-primary/20"
                >
                    <Plus className="w-5 h-5" />
                    New Category
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-medium">Category</th>
                                <th className="px-6 py-4 font-medium">Slug</th>
                                <th className="px-6 py-4 font-medium text-center">Posts</th>
                                <th className="px-6 py-4 font-medium">Order</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Loading categories...
                                    </td>
                                </tr>
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No categories found. Create your first category to get started.
                                    </td>
                                </tr>
                            ) : (
                                categories.map((category) => (
                                    <tr key={category.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border border-gray-100"
                                                    style={category.color ? { backgroundColor: `${category.color}20`, borderColor: `${category.color}40` } : { backgroundColor: '#f3f4f6' }}
                                                >
                                                    {category.icon || "📚"}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">{category.name}</div>
                                                    {category.description && (
                                                        <div className="text-xs text-gray-500 line-clamp-1 max-w-xs">{category.description}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                            {category.slug}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                <span className="inline-flex items-center justify-center min-w-[2rem] h-6 px-2 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                                                    {category._count?.posts || 0}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {category.order}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingCategory(category);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-crypto-primary hover:bg-crypto-primary/10 rounded-lg transition-colors"
                                                    title="Edit category"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete category"
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

            <CategoryModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingCategory(null);
                }}
                category={editingCategory}
                onSuccess={fetchCategories}
            />
        </div>
    );
}
