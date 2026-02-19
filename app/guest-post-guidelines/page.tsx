import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Submit a Guest Post | TheCryptoStart',
    description: 'Write for TheCryptoStart and reach 50K+ monthly readers. Get backlink, build authority.',
}

export default function GuestPostGuidelines() {
    return (
        <article className="max-w-4xl mx-auto py-16 px-6 prose prose-lg prose-invert lg:prose-xl">
            <header className="mb-12 border-b border-white/10 pb-8">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    Guest Post Guidelines
                </h1>
                <p className="text-xl text-gray-400 mt-4 italic">
                    Contribua para a educação cripto e alcance milhares de entusiastas.
                </p>
            </header>

            <div className="bg-blue-900/10 border border-blue-500/20 rounded-2xl p-8 mb-12">
                <h2 className="text-2xl font-semibold !mt-0">Por que escrever para o TheCryptoStart?</h2>
                <ul className="grid md:grid-cols-2 gap-4 mt-6">
                    <li className="flex items-start gap-3">
                        <span className="text-cyan-400 font-bold">✓</span>
                        <span>Alcance mais de 50.000 leitores mensais</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-cyan-400 font-bold">✓</span>
                        <span>Construa autoridade no mercado cripto</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-cyan-400 font-bold">✓</span>
                        <span>Link de qualidade (Backlink) para seu site/projeto</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-cyan-400 font-bold">✓</span>
                        <span>Exposição em nossas redes sociais</span>
                    </li>
                </ul>
            </div>

            <section>
                <h2 className="text-3xl font-bold mb-6">Requisitos Técnicos</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-gray-300">
                        <thead className="text-white border-b border-white/10">
                            <tr>
                                <th className="py-4 font-semibold">Critério</th>
                                <th className="py-4 font-semibold">Padrão Esperado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <tr>
                                <td className="py-4 font-medium">Tamanho</td>
                                <td className="py-4">1500 a 2500 palavras</td>
                            </tr>
                            <tr>
                                <td className="py-4 font-medium">Originalidade</td>
                                <td className="py-4">Conteúdo 100% inédito (não publicado antes)</td>
                            </tr>
                            <tr>
                                <td className="py-4 font-medium">Tópicos</td>
                                <td className="py-4">Bitcoin, Ethereum, DeFi, Segurança, Web3</td>
                            </tr>
                            <tr>
                                <td className="py-4 font-medium">Qualidade</td>
                                <td className="py-4">Pesquisa profunda, fatos verificados e tom educativo</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="mt-16">
                <h2 className="text-3xl font-bold mb-6">Tópicos que Aceitamos</h2>
                <div className="grid md:grid-cols-3 gap-6 not-prose">
                    {['Bitcoin & Ethereum', 'DeFi & Staking', 'Segurança Cripto', 'Web3 & NFTs', 'Análise de Projetos', 'Guias de Investimento'].map((topic) => (
                        <div key={topic} className="p-4 rounded-xl bg-white/5 border border-white/10 text-center hover:border-cyan-500/50 transition-colors">
                            {topic}
                        </div>
                    ))}
                </div>
            </section>

            <section className="mt-16 bg-gradient-to-br from-gray-900 to-black p-10 rounded-3xl border border-white/10 shadow-2xl">
                <h2 className="text-3xl font-bold mb-8 text-center">Processo de Submissão</h2>
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-cyan-500/30 before:to-transparent">
                    {[
                        { step: 'Pitch', desc: 'Envie sua ideia de tópico e breve resumo para análise.' },
                        { step: 'Aprovação', desc: 'Nossa equipe revisa sua ideia e dá feedback em 2-3 dias.' },
                        { step: 'Escrita', desc: 'Crie seu artigo seguindo nossas diretrizes de estilo.' },
                        { step: 'Revisão', desc: 'Fazemos ajustes finos e sugestões de otimização SEO.' },
                        { step: 'Publicação', desc: 'Seu artigo vai ao ar com sua biografia e créditos.' },
                    ].map((item, i) => (
                        <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-cyan-500 bg-black text-cyan-400 font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                {i + 1}
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/5 bg-white/5">
                                <h3 className="font-bold text-lg text-white">{item.step}</h3>
                                <p className="text-gray-400 text-sm mt-1">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mt-16 text-center">
                <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
                <p className="text-gray-400 mb-8">
                    Envie sua proposta de tópico para o e-mail:
                </p>
                <div className="inline-block p-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-8">
                    <span className="text-2xl font-mono text-cyan-400 font-bold">hello@thecryptostart.com</span>
                </div>
                <p className="text-sm text-gray-500">
                    Assunto: "Guest Post Pitch: [Seu Tópico]"
                </p>
            </section>

            <footer className="mt-20 pt-10 border-t border-white/10 text-center text-sm text-gray-500">
                <p>&copy; {new Date().getFullYear()} TheCryptoStart Blog. Reservamos o direito de recusar ou editar qualquer conteúdo submetido.</p>
            </footer>
        </article>
    )
}
