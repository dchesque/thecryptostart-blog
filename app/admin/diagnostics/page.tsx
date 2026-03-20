'use client';

import { useState, useEffect } from 'react';
import { 
    Activity, 
    Database, 
    Server, 
    ShieldCheck, 
    AlertTriangle, 
    CheckCircle2, 
    XCircle,
    RotateCw,
    Terminal,
    ChevronRight,
    Search,
    FileText,
    BarChart,
    MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type Tab = 'status' | 'logs';

export default function DiagnosticsPage() {
    const [activeTab, setActiveTab] = useState<Tab>('status');
    const [diagnostics, setDiagnostics] = useState<any>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchDiagnostics = async () => {
        try {
            const res = await fetch('/api/admin/diagnostics');
            const data = await res.json();
            setDiagnostics(data);
        } catch (err) {
            console.error('Failed to fetch diagnostics:', err);
        }
    };

    const fetchLogs = async () => {
        try {
            const res = await fetch('/api/admin/logs?limit=50');
            const data = await res.json();
            setLogs(data);
        } catch (err) {
            console.error('Failed to fetch logs:', err);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        if (activeTab === 'status') await fetchDiagnostics();
        else await fetchLogs();
        setRefreshing(false);
    };

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([fetchDiagnostics(), fetchLogs()]);
            setLoading(false);
        };
        init();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <RotateCw className="w-10 h-10 text-crypto-primary animate-spin" />
                    <p className="text-gray-500 font-medium italic">Carregando diagnósticos...</p>
                </div>
            </div>
        );
    }

    const apiModules = [
        { id: 'posts', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: 'gsc', icon: Search, color: 'text-amber-500', bg: 'bg-amber-50' },
        { id: 'seo', icon: BarChart, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { id: 'comments', icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-50' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header com Glassmorphism */}
            <div className="bg-gradient-to-r from-crypto-darker to-crypto-navy rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                            <Activity className="text-crypto-primary" size={32} />
                            System Diagnostics
                        </h1>
                        <p className="text-gray-400">Monitorize a integridade do blog, APIs e logs em tempo real.</p>
                    </div>
                    <button 
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-md border border-white/10 transition-all font-bold disabled:opacity-50"
                    >
                        <RotateCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
                        {refreshing ? 'Atualizando...' : 'Atualizar Dados'}
                    </button>
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 translate-x-1/2" />
            </div>

            {/* Tabs Navigation */}
            <div className="flex p-1 bg-gray-100 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab('status')}
                    className={cn(
                        "px-8 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                        activeTab === 'status' 
                            ? "bg-white text-gray-900 shadow-sm" 
                            : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                    )}
                >
                    <Server size={18} />
                    System Status
                </button>
                <button
                    onClick={() => setActiveTab('logs')}
                    className={cn(
                        "px-8 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                        activeTab === 'logs' 
                            ? "bg-white text-gray-900 shadow-sm" 
                            : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                    )}
                >
                    <Terminal size={18} />
                    API Logs
                </button>
            </div>

            <div className="mt-8">
                {activeTab === 'status' ? (
                    <div className="space-y-8">
                        {/* API Modules Health Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {apiModules.map((module) => {
                                const health = diagnostics?.apiHealth?.[module.id];
                                const isHealthy = health?.status === 'healthy';
                                const Icon = module.icon;

                                return (
                                    <div key={module.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={cn("p-3 rounded-2xl transition-all", module.bg, module.color)}>
                                                <Icon size={20} />
                                            </div>
                                            <div className={cn(
                                                "w-2.5 h-2.5 rounded-full animate-pulse",
                                                isHealthy ? "bg-green-500" : "bg-amber-500"
                                            )} />
                                        </div>
                                        <h3 className="text-gray-900 font-bold text-sm mb-1">{health?.label || module.id.toUpperCase()}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md",
                                                isHealthy ? "text-green-600 bg-green-50" : "text-amber-600 bg-amber-50"
                                            )}>
                                                {health?.status || 'Unknown'}
                                            </span>
                                            <span className="text-[10px] text-gray-400">
                                                {health?.timestamp ? format(new Date(health.timestamp), 'HH:mm') : '--:--'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Database Health Card */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 overflow-hidden">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Database className="text-blue-500" size={20} />
                                Database & Content
                            </h2>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center",
                                            diagnostics?.database?.status === 'connected' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                                        )}>
                                            {diagnostics?.database?.status === 'connected' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-bold uppercase">DB Connection</p>
                                            <p className="font-bold text-gray-900 capitalize">{diagnostics?.database?.status}</p>
                                        </div>
                                    </div>
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-xs font-bold",
                                        diagnostics?.database?.status === 'connected' ? "bg-green-500 text-white" : "bg-red-500 text-white"
                                    )}>
                                        {diagnostics?.database?.status === 'connected' ? 'Stable' : 'Error'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 border border-gray-50 rounded-2xl">
                                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Published Posts</p>
                                        <p className="text-2xl font-bold text-gray-900">{diagnostics?.database?.stats?.published || 0}</p>
                                    </div>
                                    <div className="p-4 border border-gray-50 rounded-2xl">
                                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Visible Homepage</p>
                                        <p className="text-2xl font-bold text-crypto-primary">{diagnostics?.database?.visibleOnHomepage || 0}</p>
                                    </div>
                                </div>

                                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                                    <h3 className="text-xs font-bold text-blue-700 uppercase mb-3 px-1 text-center">System Message</h3>
                                    <p className="text-sm text-blue-900 font-medium leading-relaxed">
                                        {diagnostics?.diagnosis?.message}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Environment Variables Card */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <ShieldCheck className="text-purple-500" size={20} />
                                Environment & Secrets
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {diagnostics?.environment && Object.entries(diagnostics.environment).map(([key, value]) => (
                                    <div key={key} className="flex items-center justify-between p-3 border border-gray-50 rounded-xl hover:bg-gray-50 transition-colors">
                                        <span className="text-[10px] sm:text-xs font-mono text-gray-500 truncate mr-2" title={key}>{key}</span>
                                        {value ? (
                                            <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                                        ) : (
                                            <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 pt-6 border-t border-gray-50">
                                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-2xl border border-purple-100">
                                    <div className="flex items-center gap-3">
                                        <RotateCw className={cn("text-purple-600", refreshing && "animate-spin")} size={20} />
                                        <div>
                                            <p className="text-xs text-purple-700 font-bold uppercase tracking-wider">Última Verificação</p>
                                            <p className="text-sm font-bold text-purple-900">
                                                {diagnostics?.timestamp ? format(new Date(diagnostics.timestamp), 'HH:mm:ss - dd/MM/yyyy') : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                ) : (
                    /* API logs Tab */
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                        <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Terminal className="text-emerald-500" size={20} />
                                    Recent API Activity
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">Exibindo os últimos 50 eventos registrados.</p>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Procurar nos logs..."
                                    className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm w-full sm:w-64 focus:ring-2 focus:ring-crypto-primary/20 transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tempo</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nível</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fonte</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mensagem</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dados</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {logs.length > 0 ? logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-xs font-medium text-gray-500">
                                                    {format(new Date(log.createdAt), 'HH:mm:ss')}
                                                </span>
                                                <p className="text-[10px] text-gray-400">{format(new Date(log.createdAt), 'dd/MM/yy')}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase",
                                                    log.level === 'ERROR' ? "bg-red-100 text-red-600" :
                                                    log.level === 'WARN' ? "bg-amber-100 text-amber-600" :
                                                    "bg-blue-100 text-blue-600"
                                                )}>
                                                    {log.level}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-xs font-bold text-gray-700">{log.source}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-gray-800 line-clamp-1 group-hover:line-clamp-none transition-all duration-300">
                                                    {log.message}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {log.data ? (
                                                    <details className="cursor-pointer">
                                                        <summary className="text-xs text-blue-600 hover:underline list-none font-bold">Ver JSON</summary>
                                                        <pre className="mt-2 p-3 bg-gray-900 text-gray-300 rounded-lg text-[10px] overflow-auto max-w-[300px] max-h-[200px]">
                                                            {JSON.stringify(log.data, null, 2)}
                                                        </pre>
                                                    </details>
                                                ) : (
                                                    <span className="text-gray-300 text-xs">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="py-20 text-center">
                                                <div className="flex flex-col items-center gap-2 text-gray-400">
                                                    <RotateCw className="w-8 h-8 opacity-20" />
                                                    <p className="text-sm italic">Nenhum log encontrado ainda.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Showing {logs.length} most recent activities</p>
                            <button className="text-xs font-bold text-gray-500 hover:text-crypto-primary transition-colors flex items-center gap-1">
                                Ver Logs Completos
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
