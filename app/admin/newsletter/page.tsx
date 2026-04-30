"use client";

import { useState, useEffect, useCallback } from "react";
import { Trash2, Loader2, Mail, Download, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface Subscriber {
    id: string;
    email: string;
    status: "PENDING" | "CONFIRMED" | "UNSUBSCRIBED";
    source: string | null;
    confirmedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

interface Pagination {
    total: number;
    pages: number;
    currentPage: number;
    limit: number;
}

const STATUS_FILTERS = [
    { value: "all", label: "All" },
    { value: "PENDING", label: "Pending" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "UNSUBSCRIBED", label: "Unsubscribed" },
] as const;

const STATUS_STYLES: Record<Subscriber["status"], string> = {
    PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
    CONFIRMED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    UNSUBSCRIBED: "bg-gray-100 text-gray-600 ring-gray-200",
};

export default function NewsletterAdminPage() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<string>("all");
    const [page, setPage] = useState<number>(1);

    const fetchSubscribers = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: "50" });
            if (filter !== "all") params.set("status", filter);
            const res = await fetch(`/api/admin/newsletter/subscribers?${params}`);
            if (!res.ok) throw new Error("Failed to load subscribers");
            const data = await res.json();
            setSubscribers(data.subscribers || []);
            setPagination(data.pagination || null);
        } catch (error) {
            console.error(error);
            alert("Failed to load subscribers.");
        } finally {
            setIsLoading(false);
        }
    }, [filter, page]);

    useEffect(() => { fetchSubscribers(); }, [fetchSubscribers]);

    const handleDelete = async (email: string) => {
        if (!confirm(`Hard-delete ${email}? This cannot be undone.`)) return;
        try {
            const res = await fetch(`/api/admin/newsletter/subscribers?email=${encodeURIComponent(email)}`, { method: "DELETE" });
            if (!res.ok && res.status !== 204) throw new Error("Failed to delete");
            fetchSubscribers();
        } catch (error) {
            console.error(error);
            alert("Failed to delete subscriber.");
        }
    };

    const exportCSV = () => {
        const rows = [
            ["email", "status", "source", "confirmedAt", "createdAt"],
            ...subscribers.map(s => [
                s.email,
                s.status,
                s.source || "",
                s.confirmedAt || "",
                s.createdAt,
            ]),
        ];
        const csv = rows.map(r =>
            r.map(cell => {
                const v = String(cell ?? "");
                return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
            }).join(",")
        ).join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `subscribers-${filter}-${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Mail className="w-6 h-6 text-crypto-primary" />
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Newsletter</h1>
                    </div>
                    <p className="text-gray-500">Subscribers, double opt-in status, exports.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchSubscribers}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
                        title="Refresh"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                    <button
                        onClick={exportCSV}
                        disabled={subscribers.length === 0}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-crypto-primary text-white rounded-xl hover:bg-crypto-darker transition-colors text-sm font-medium shadow-sm shadow-crypto-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                {STATUS_FILTERS.map(f => (
                    <button
                        key={f.value}
                        onClick={() => { setFilter(f.value); setPage(1); }}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            filter === f.value
                                ? "bg-crypto-primary text-white shadow-sm"
                                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
                {pagination && (
                    <span className="ml-auto text-sm text-gray-500">
                        {pagination.total.toLocaleString()} {pagination.total === 1 ? "subscriber" : "subscribers"}
                    </span>
                )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-medium">Email</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Source</th>
                                <th className="px-6 py-4 font-medium">Subscribed</th>
                                <th className="px-6 py-4 font-medium">Confirmed</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Loading subscribers...
                                    </td>
                                </tr>
                            ) : subscribers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No subscribers in <strong>{filter}</strong> yet.
                                    </td>
                                </tr>
                            ) : (
                                subscribers.map(sub => (
                                    <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{sub.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${STATUS_STYLES[sub.status]}`}>
                                                {sub.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-xs">{sub.source || "—"}</td>
                                        <td className="px-6 py-4 text-gray-500 text-xs">{format(new Date(sub.createdAt), "MMM d, yyyy HH:mm")}</td>
                                        <td className="px-6 py-4 text-gray-500 text-xs">{sub.confirmedAt ? format(new Date(sub.confirmedAt), "MMM d, yyyy HH:mm") : "—"}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handleDelete(sub.email)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Hard delete"
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

                {pagination && pagination.pages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                        <span className="text-sm text-gray-500">
                            Page {pagination.currentPage} of {pagination.pages}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(p - 1, 1))}
                                disabled={page <= 1}
                                className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(p + 1, pagination.pages))}
                                disabled={page >= pagination.pages}
                                className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
