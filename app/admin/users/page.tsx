"use client";

import { useEffect, useState } from "react";
import UserModal from "@/components/admin/UserModal";
import { Loader2, Plus, Edit, Trash2, Shield, Mail, User as UserIcon } from "lucide-react";

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
        <div className="flex justify-center items-center h-96">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-crypto-primary" />
                <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Loading Users...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500 mt-2">Manage user accounts, roles, and permissions.</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="px-6 py-3 bg-crypto-primary text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-all flex items-center gap-2 shadow-lg shadow-crypto-primary/20 hover:-translate-y-1"
                >
                    <Plus size={18} />
                    Invite User
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {error && (
                    <div className="p-4 bg-red-50 text-red-600 border-b border-red-100 font-medium text-sm">
                        Error: {error}
                    </div>
                )}

                <table className="min-w-full divide-y divide-gray-50">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                User Profile
                            </th>
                            <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                Contact
                            </th>
                            <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                Roles
                            </th>
                            <th className="px-8 py-5 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50/50 transition duration-200">
                                <td className="px-8 py-5 whitespace-nowrap">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                                            {user.name?.charAt(0) || <UserIcon size={18} />}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900">{user.name || "N/A"}</div>
                                            <div className="text-xs text-gray-400 mt-0.5">ID: {user.id.slice(0, 8)}...</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5 whitespace-nowrap">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Mail size={14} className="text-gray-400" />
                                        {user.email}
                                    </div>
                                </td>
                                <td className="px-8 py-5 whitespace-nowrap">
                                    <div className="flex flex-wrap gap-2">
                                        {user.roles.map((role) => (
                                            <span
                                                key={role}
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                        role === 'EDITOR' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                            'bg-green-50 text-green-700 border-green-200'
                                                    }`}
                                            >
                                                {role === 'ADMIN' && <Shield size={10} />}
                                                {role}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-3">
                                        <button
                                            onClick={() => handleEdit(user)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit User"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id, user.email || "")}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete User"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {users.length === 0 && !loading && (
                    <div className="p-12 text-center text-gray-500">
                        No users found.
                    </div>
                )}
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
