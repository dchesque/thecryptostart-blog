"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string;
    color: string | null;
    order: number;
}

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    category?: Category | null;
    onSuccess: () => void;
}

export function CategoryModal({ isOpen, onClose, category, onSuccess }: CategoryModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        icon: "📚",
        color: "",
        order: "0",
    });

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || "",
                slug: category.slug || "",
                description: category.description || "",
                icon: category.icon || "📚",
                color: category.color || "",
                order: category.order ? category.order.toString() : "0",
            });
        } else {
            setFormData({
                name: "",
                slug: "",
                description: "",
                icon: "📚",
                color: "",
                order: "0",
            });
        }
    }, [category, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const url = category
                ? `/api/admin/categories/${category.id}`
                : "/api/admin/categories";
            const method = category ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    slug: formData.slug,
                    description: formData.description || null,
                    icon: formData.icon || "📚",
                    color: formData.color || null,
                    order: parseInt(formData.order) || 0,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to save category");
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
            // Auto-generate slug if it's a new category
            slug: !category ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : prev.slug
        }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">
                        {category ? "Edit Category" : "New Category"}
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
                                Category Name
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleNameChange}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crypto-primary/20 focus:border-crypto-primary transition-all"
                                placeholder="e.g. Cryptocurrency"
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
                                placeholder="e.g. cryptocurrency"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crypto-primary/20 focus:border-crypto-primary transition-all resize-none h-24"
                                placeholder="Brief description of this category..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Emoji Icon
                                </label>
                                <input
                                    type="text"
                                    required
                                    maxLength={2}
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crypto-primary/20 focus:border-crypto-primary transition-all text-center text-xl"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Display Order
                                </label>
                                <input
                                    type="number"
                                    required
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crypto-primary/20 focus:border-crypto-primary transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Brand Color (Hex)
                            </label>
                            <div className="flex gap-3">
                                <input
                                    type="color"
                                    value={formData.color || "#000000"}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    className="w-10 h-10 p-1 rounded-xl cursor-pointer bg-white border border-gray-200"
                                />
                                <input
                                    type="text"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-crypto-primary/20 focus:border-crypto-primary transition-all font-mono text-sm"
                                    placeholder="#000000"
                                    pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
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
                            ) : category ? (
                                "Save Changes"
                            ) : (
                                "Create Category"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
