import { getAllPosts } from '@/lib/posts'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Content Clusters | TheCryptoStart',
    description: 'Explore nossos clusters de conteúdo especializado em Cripto e Web3.',
}

export default async function ContentClustersPage({ params }: { params: { cluster: string } }) {
    const posts = await getAllPosts({ limit: 100 })

    // Agrupar posts por categoria (utilizando categorias como clusters iniciais)
    const clusters = posts.reduce((acc, post) => {
        const cluster = post.category
        if (!acc[cluster]) acc[cluster] = []
        acc[cluster].push(post)
        return acc
    }, {} as Record<string, typeof posts>)

    return (
        <div className="max-w-7xl mx-auto py-20 px-6">
            <header className="mb-16 text-center">
                <h1 className="text-5xl font-extrabold text-white mb-4">Content Clusters</h1>
                <p className="text-xl text-gray-400">Hubs de conhecimento interconectados para máxima relevância SEO.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Object.entries(clusters).map(([name, clusterPosts]) => (
                    <div key={name} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-cyan-500/30 transition-all group">
                        <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-widest flex justify-between items-center">
                            {name}
                            <span className="text-xs bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full">{clusterPosts.length} posts</span>
                        </h2>
                        <ul className="space-y-4">
                            {clusterPosts.slice(0, 5).map((post) => (
                                <li key={post.slug}>
                                    <Link href={`/blog/${post.slug}`} className="text-gray-400 hover:text-white flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50"></span>
                                        <span className="truncate">{post.title}</span>
                                    </Link>
                                </li>
                            ))}
                            {clusterPosts.length > 5 && (
                                <li className="pt-4 border-t border-white/5 text-sm text-gray-500 italic">
                                    + {clusterPosts.length - 5} outros artigos
                                </li>
                            )}
                        </ul>
                        <Link
                            href={`/blog?category=${name}`}
                            className="mt-8 block text-center py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white hover:bg-cyan-500 hover:text-black transition-colors"
                        >
                            Explorar Pillar Page
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    )
}
