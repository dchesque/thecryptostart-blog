"use client";

import { useState, useEffect } from "react";

import { User } from "../../app/admin/users/page";

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    user?: User | null;
}

export default function UserModal({ isOpen, onClose, onSuccess, user }: UserModalProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [roles, setRoles] = useState<string[]>(["AUTHOR"]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setEmail(user.email || "");
            setRoles(user.roles || ["AUTHOR"]);
            setPassword(""); // Don't show hashed password
        } else {
            setName("");
            setEmail("");
            setRoles(["AUTHOR"]);
            setPassword("");
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const method = user ? "PATCH" : "POST";
        const url = user ? `/api/users/${user.id}` : "/api/users";

        const body: any = { name, email, roles };
        if (password) body.password = password;

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Something went wrong");
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleRole = (role: string) => {
        setRoles(prev =>
            prev.includes(role)
                ? prev.filter(r => r !== role)
                : [...prev, role]
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        {user ? "Edit User" : "Add New User"}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Password {user && <span className="text-xs text-gray-500">(leave blank to keep current)</span>}
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required={!user}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Roles
                        </label>
                        <div className="flex gap-2">
                            {["ADMIN", "EDITOR", "AUTHOR"].map((role) => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => toggleRole(role)}
                                    className={`px-3 py-1 text-xs font-semibold rounded-full border transition ${roles.includes(role)
                                        ? "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800"
                                        : "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600"
                                        }`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save User"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
