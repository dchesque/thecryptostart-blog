"use client";

import { useEffect, useState } from "react";
import UserModal from "@/components/admin/UserModal";

export type User = {
    id: string;
    name: string | null;
    email: string | null;
    roles: string[];
    createdAt?: string;
};

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/users");
            if (!response.ok) {
                throw new Error("Failed to fetch users");
            }
            const data = await response.json();
            setUsers(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string, email: string) => {
        if (!confirm(`Are you sure you want to delete ${email}?`)) return;

        try {
            const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete user");
            fetchUsers();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleAdd = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    if (loading && users.length === 0) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Management</h2>
                <button
                    onClick={handleAdd}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                >
                    Add User
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {error && <p className="p-4 text-red-500">Error: {error}</p>}

                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Roles
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    {user.name || "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {user.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="flex gap-1">
                                        {user.roles.map((role) => (
                                            <span
                                                key={role}
                                                className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                                            >
                                                {role}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleEdit(user)}
                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id, user.email || "")}
                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchUsers}
                user={selectedUser}
            />
        </div>
    );
}
