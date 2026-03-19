# 🚀 Prompt de Implantação — Refatoração da Homepage (UI/UX + AdSense)
**Projeto:** TheCryptoStart  
**Ferramenta:** Antigravity  
**Escopo:** Refatoração completa da página inicial  
**Prioridade:** Alta  

---

## 1. Visão Geral da Implantação

### Objetivo
Refatorar a página inicial do blog TheCryptoStart com foco em três frentes simultâneas:

1. **UI/UX** — Eliminar espaços mortos, reestruturar hierarquia visual, aumentar densidade de conteúdo acima da dobra
2. **Otimização de AdSense** — Substituir blocos de anúncio com render inconsistente por posicionamento estratégico baseado em viewports, com fallback de conteúdo quando o anúncio não carrega
3. **Conversão de conteúdo** — Reposicionar CTAs, expandir FAQ e aumentar o volume de artigos visíveis sem paginação

### Problema que resolve
A homepage atual apresenta:
- Grandes áreas brancas entre seções causadas por blocos AdSense não renderizados
- Layout com baixa densidade de conteúdo above-the-fold
- Hierarquia visual inconsistente entre seções
- Posicionamento de anúncios que prejudica a experiência sem gerar receita visível
- Newsletter CTA posicionada no fim da página, com baixa taxa de conversão esperada

### Escopo
- Arquivo principal da homepage (`app/page.tsx` ou equivalente)
- Componentes de seção existentes que precisam de ajuste de layout
- Componente(s) de AdSense/anúncio
- Nenhuma alteração em banco de dados, autenticação ou APIs

---

## 2. Análise de Contexto Obrigatória

> ⚠️ **Antes de qualquer implementação, o Antigravity DEVE executar todas as etapas abaixo.**

### 2.1 Análise do repositório
- Ler o arquivo `.context` do projeto (raiz e subpastas relevantes)
- Mapear a estrutura de pastas de `app/`, `components/` e `lib/`
- Identificar o arquivo de rota da homepage (ex: `app/page.tsx`, `app/(site)/page.tsx`)
- Identificar todos os componentes de seção usados na homepage atualmente

### 2.2 Componentes a mapear obrigatoriamente
Localizar e ler os seguintes componentes antes de qualquer modificação:

| Componente esperado | O que verificar |
|---|---|
| `HeroSection` ou equivalente | Props, variantes, responsividade |
| `FeaturedArticle` / `FeaturedOfTheWeek` | Como recebe dados, estrutura do card |
| `RecentArticles` | Quantidade de itens, grid atual |
| `ExploreTopics` / `TopicsGrid` | Dados estáticos ou dinâmicos |
| `TrendingNow` | Origem dos dados, sidebar presente? |
| `FAQSection` / `FAQ` | Accordion, quantidade de itens |
| `NewsletterCTA` | Formulário, integração de e-mail |
| `AdSenseBlock` / `AdUnit` / `GoogleAd` | Slots, responsividade, fallback |

### 2.3 Padrões a respeitar
- Stack: Next.js + TypeScript + Tailwind CSS
- Convenções de nomenclatura existentes no projeto
- Sistema de cores e tipografia já definidos (`tailwind.config.ts`)
- Padrão de importação de dados (API routes, server components, Prisma)
- Não quebrar nenhum componente já funcional

---

## 3. Plano de Implantação

### Tarefa 1 — Diagnóstico do componente AdSense
**O que fazer:**
- Localizar o componente de anúncio atual
- Verificar se existe lógica de detecção de render/fallback
- Verificar se os slots AdSense estão configurados corretamente por posição
- Identificar quais posições na homepage estão com anúncios atualmente

**Critério de conclusão:** Lista documentada de todos os slots e suas posições atuais na homepage

---

### Tarefa 2 — Reestruturação da ordem das seções na homepage
**O que fazer:**  
Reorganizar a sequência de seções da homepage para a seguinte ordem otimizada:

```
1. Navbar                        ← sem alteração
2. Hero                          ← aumentar impacto visual, manter conteúdo
3. Featured of the Week          ← card maior, ocupar largura total sem sidebar vazia
4. [AD UNIT 1 — Leaderboard]     ← 728x90 ou responsivo, com fallback visual
5. Recent Articles               ← grid 3 colunas, mínimo 6 artigos visíveis
6. Newsletter CTA inline         ← versão compacta entre seções (não apenas no fim)
7. [AD UNIT 2 — In-content]      ← 300x250 ou nativo, centralizado
8. Explore Topics                ← manter estrutura, melhorar ícones/cores
9. Trending Now                  ← lista + sidebar com AD UNIT 3
10. FAQ                          ← expandir para mínimo 6 perguntas
11. Newsletter CTA completa      ← banner escuro, manter design atual
12. Footer                       ← sem alteração
```

**Critério de conclusão:** Homepage renderiza na nova ordem sem erros de build

---

### Tarefa 3 — Otimização do componente AdSense
**O que fazer:**
- Adicionar lógica de fallback: quando o anúncio não renderizar, exibir conteúdo relacionado (artigo sugerido ou banner de categoria) em vez de espaço vazio
- Garantir que cada slot AdSense tenha altura mínima definida para não colapsar
- Separar os slots por posição com IDs semânticos: `homepage-leaderboard`, `homepage-in-content`, `homepage-sidebar`
- Garantir carregamento lazy dos blocos abaixo da dobra (below-the-fold)

**Critério de conclusão:** Nenhum bloco de anúncio gera espaço vazio visível; fallback renderiza quando necessário

---

### Tarefa 4 — Refatoração visual da seção Hero
**O que fazer:**
- Aumentar o padding vertical para dar mais respiro e impacto
- Garantir que o H1 contenha a keyword principal visível (ex: "Crypto", "Bitcoin", "Cryptocurrency")
- Os dois CTAs devem estar claramente diferenciados: primário (laranja preenchido) e secundário (outline/ghost)
- Verificar responsividade mobile: headline não deve quebrar de forma estranha

**Critério de conclusão:** Hero ocupa corretamente o above-the-fold em desktop (1440px) e mobile (390px)

---

### Tarefa 5 — Expansão da seção Featured of the Week
**O que fazer:**
- Remover a coluna lateral vazia ao lado do card featured
- Fazer o card featured ocupar a largura total disponível (ou usar layout 2/3 + 1/3 com lista de artigos secundários à direita, em vez de anúncio)
- Se houver sidebar à direita no featured, preenchê-la com: 2-3 artigos em formato lista compacta com título, categoria e tempo de leitura

**Critério de conclusão:** Seção Featured não tem espaço vazio, conteúdo preenche o layout

---

### Tarefa 6 — Expansão da seção Recent Articles
**O que fazer:**
- Garantir exibição de no mínimo 6 artigos no grid
- Remover o bloco largo vazio abaixo do grid (substituir por AD UNIT ou remover)
- Adicionar botão "Ver todos os artigos" com link para `/articles` ou `/blog`

**Critério de conclusão:** Grid de 6 artigos visíveis sem área vazia abaixo

---

### Tarefa 7 — Newsletter CTA inline (nova seção compacta)
**O que fazer:**
- Criar uma versão compacta do CTA de newsletter para ser usada entre seções
- Deve ser uma faixa horizontal com: headline curta + campo de e-mail + botão
- Usar o mesmo design do banner existente, mas em formato horizontal e menor
- Posicionar entre "Recent Articles" e "Explore Topics"

**Critério de conclusão:** Componente newsletter inline renderiza corretamente sem duplicar o banner final

---

### Tarefa 8 — Expansão do FAQ
**O que fazer:**
- Expandir o FAQ de 3 para mínimo 6 perguntas
- As perguntas devem cobrir: segurança, investimento, wallets, exchanges, impostos, diferenças entre coins
- Manter o formato accordion existente
- Garantir que o markup use `<details>/<summary>` ou equivalente com schema FAQ JSON-LD (se já existir no projeto, integrar)

**Critério de conclusão:** FAQ exibe 6+ perguntas, accordion funciona, schema está presente

---

### Tarefa 9 — Verificação de responsividade geral
**O que fazer:**
- Testar a homepage nas breakpoints: 390px (mobile), 768px (tablet), 1280px (desktop), 1440px (wide)
- Garantir que nenhuma seção gera overflow horizontal
- Verificar que os anúncios responsivos não quebram o layout em mobile
- Verificar espaçamento vertical entre seções (deve ser consistente: usar o padrão do projeto)

**Critério de conclusão:** Nenhum problema de layout em nenhuma breakpoint

---

## 4. Plano de Verificação

### Frontend
- [ ] Homepage carrega sem erros de console em desenvolvimento (`npm run dev`)
- [ ] Build de produção conclui sem erros (`npm run build`)
- [ ] Todas as seções renderizam na nova ordem correta
- [ ] Nenhum espaço vazio visível entre seções
- [ ] Anúncios AdSense têm fallback quando não renderizam
- [ ] Hero tem H1 com keyword visível
- [ ] Featured of the Week sem coluna vazia
- [ ] Grid de Recent Articles exibe 6+ artigos
- [ ] FAQ exibe 6+ perguntas com accordion funcional
- [ ] Newsletter inline aparece entre seções
- [ ] Responsividade validada nas 4 breakpoints principais

### Dados
- [ ] Seção Recent Articles ainda busca dados da API/banco corretamente
- [ ] Seção Featured ainda carrega o artigo marcado como featured
- [ ] Trending Now ainda carrega artigos ordenados por views/relevância

### AdSense
- [ ] Slots com IDs semânticos definidos: `homepage-leaderboard`, `homepage-in-content`, `homepage-sidebar`
- [ ] Carregamento lazy ativo para slots below-the-fold
- [ ] Fallback visível quando slot não renderiza

---

## 5. Resultado Esperado

### Comportamento final da homepage
- Usuário acessa a homepage e imediatamente vê conteúdo relevante acima da dobra (Hero + início do Featured)
- Ao rolar, encontra artigos, anúncios bem posicionados e CTAs de newsletter em momentos estratégicos
- Nenhum espaço branco vazio quebra a experiência visual
- Em mobile, a experiência é fluida e sem overflow

### Impacto no usuário
- Maior engajamento com o conteúdo (mais artigos visíveis sem scroll)
- Melhor percepção de qualidade do blog (sem "buracos" visuais)
- CTA de newsletter em posição de maior conversão (dentro do conteúdo)

### Impacto no sistema
- RPM do AdSense potencialmente maior por posicionamento estratégico e fallback
- Melhor aproveitamento do espaço above-the-fold para SEO e engajamento
- Homepage mais consistente e previsível para manutenções futuras

---

## 6. Restrições e Alertas

> ⚠️ **Não alterar:**
> - Estrutura de banco de dados ou queries Prisma
> - Rotas de API existentes
> - Sistema de autenticação (NextAuth)
> - Componentes de admin/dashboard
> - Footer e Navbar (apenas se houver bug visual óbvio)

> ⚠️ **Atenção especial:**
> - Manter o padrão de Server Components vs Client Components do projeto
> - Não adicionar dependências npm sem necessidade explícita
> - Respeitar o sistema de cores existente (laranja/dark do TheCryptoStart)
> - Qualquer novo componente deve seguir a nomenclatura PascalCase e estar na pasta `components/` adequada

---

*Prompt gerado para execução via Antigravity — TheCryptoStart v2026*
