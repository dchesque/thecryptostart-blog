# Relatório de Auditoria Completa — TheCryptoStart Blog

**Data:** 2026-02-18
**Branch auditada:** `master` / `main`
**Versão:** `0.1.12`
**Stack:** Next.js 16, React 19, TypeScript, Prisma, PostgreSQL, Contentful CMS, NextAuth v5 (beta), TailwindCSS

---

## Sumário Executivo

O projeto é um blog educacional sobre criptomoedas bem estruturado, com boas práticas em várias áreas. No entanto, existem **vulnerabilidades de segurança críticas**, **dependências problemáticas**, **configurações incompletas** e **código não finalizado** que precisam ser endereçados antes de um deploy seguro em produção.

---

## 1. Segurança

### 🔴 Crítico

#### 1.1 Senhas hardcoded no seed do banco de dados
**Arquivo:** `prisma/seed.ts`

As senhas dos usuários seed são fixas e extremamente fracas:
- `admin@cryptoacademy.com` → senha: `admin123`
- `editor@cryptoacademy.com` → senha: `editor123`
- `author@cryptoacademy.com` → senha: `author123`

Se o seed for executado em produção (o que acontece facilmente por acidente), essas contas estarão expostas com credenciais trivialmente adivinháveis. O script de entrypoint Docker **não** roda o seed, mas não há nada impedindo que seja rodado manualmente contra o banco de produção.

**Recomendação:** Remover senhas hardcoded. Usar variáveis de ambiente ou geração aleatória no seed.

#### 1.2 CSRF implementado mas nunca utilizado
**Arquivo:** `lib/csrf.ts`

O utilitário CSRF foi criado, mas **nenhuma rota da API o aplica**. As rotas de criação/edição/exclusão de usuários (`/api/users`, `/api/users/[id]`) não validam tokens CSRF. Isso abre o sistema para ataques Cross-Site Request Forgery em todas as rotas de mutação.

**Recomendação:** Aplicar verificação CSRF nas rotas `POST`, `PATCH` e `DELETE`, ou documentar explicitamente por que a proteção do NextAuth v5 é suficiente para cada caso.

#### 1.3 Rate limit implementado mas nunca utilizado
**Arquivo:** `lib/rate-limit.ts`

Existe um rate limiter em memória, mas ele **não está sendo usado em nenhuma rota**. A rota de registro (`/api/auth/register`) não tem proteção contra força bruta, permitindo criação ilimitada de contas.

**Recomendação:** Aplicar `checkRateLimit` nas rotas de registro e login. Alertar no comentário que o rate limiter em memória não funciona com múltiplas instâncias (load balancer, containers).

#### 1.4 Registro de usuário público sem restrição
**Arquivo:** `app/api/auth/register/route.ts`

O endpoint `POST /api/auth/register` é **completamente público** — qualquer pessoa pode criar uma conta sem convite, captcha ou aprovação. Novos usuários recebem o papel `AUTHOR` por padrão, que inclui as permissões `CREATE_POST`, `EDIT_OWN_POST` e `DELETE_OWN_POST`.

**Recomendação:** Decidir se o registro aberto é intencional. Se não for, proteger o endpoint ou desativá-lo.

### 🟠 Alto

#### 1.5 `trustHost: true` no NextAuth sem restrição
**Arquivo:** `auth.ts:71`

A opção `trustHost: true` faz com que o NextAuth confie em qualquer valor do header `Host` recebido. Em ambientes com múltiplos domínios ou proxies mal configurados, isso pode levar a ataques de host header injection.

**Recomendação:** Definir `AUTH_URL` explicitamente nas variáveis de ambiente em vez de usar `trustHost: true`.

#### 1.6 IP forwarding sem validação
**Arquivo:** `lib/rate-limit.ts:53-57`

A função `getIP` extrai o IP diretamente do header `x-forwarded-for` sem validar se o request realmente vem de um proxy confiável. Um cliente pode falsificar esse header para contornar o rate limiting.

**Recomendação:** Configurar uma lista de proxies confiáveis e validar o header antes de confiar nele.

#### 1.7 Uso de `any` excessivo em código de segurança
**Arquivos:** `middleware.ts:18`, `auth.ts:41,66`, `app/api/users/route.ts:33,38`, `app/api/users/[id]/route.ts:28,42`

O tipo `any` é usado extensivamente em código relacionado a autenticação e autorização, eliminando as garantias de tipo do TypeScript precisamente onde elas são mais importantes.

### 🟡 Médio

#### 1.8 Headers de segurança incompletos
**Arquivo:** `next.config.mjs`

Os headers de segurança configurados estão incompletos:
- `Content-Security-Policy` (CSP) está **ausente** — crítico para prevenir XSS
- `Strict-Transport-Security` (HSTS) está **ausente**
- `Permissions-Policy` está **ausente**
- `Referrer-Policy` está **ausente**
- `X-XSS-Protection: 1; mode=block` é obsoleto e foi removido dos navegadores modernos

#### 1.9 `images.domains` deprecado
**Arquivo:** `next.config.mjs:4`

A propriedade `domains` em `next/image` está deprecada desde Next.js 12.3. Usar `remotePatterns` ao invés:

```js
// Substituir:
images: { domains: ['images.ctfassets.net'] }

// Por:
images: {
  remotePatterns: [{ protocol: 'https', hostname: 'images.ctfassets.net' }]
}
```

---

## 2. Dependências

### 🔴 Crítico

#### 2.1 Versões não existentes / inválidas
**Arquivo:** `package.json`

As versões declaradas não correspondem a releases públicos conhecidos:
- `"next": "^16.1.6"` — A versão mais recente do Next.js é 15.x (fev/2026). Versão 16 não existe publicamente.
- `"react": "^19.2.4"` — React 19 foi lançado em dez/2024. Versão 19.2.x pode não estar disponível ainda.
- `"next-auth": "^5.0.0-beta.30"` — Versão beta em produção; a API ainda pode mudar.
- `"@prisma/client": "^6.19.2"` — Prisma 6 está em desenvolvimento ativo; versão 6.19 pode não existir.
- `"zod": "^4.3.6"` — Zod 4 está em beta. Versão estável atual é 3.x.

**Recomendação:** Verificar as versões reais instaladas em `package-lock.json` e alinhar `package.json` com semver válido.

#### 2.2 Dependência não utilizada
**Arquivo:** `package.json`

- `next-rate-limit` está listado como dependência mas o código usa uma implementação própria em `lib/rate-limit.ts`. Essa dependência deve ser removida ou a implementação própria deve ser substituída por ela.

### 🟡 Médio

#### 2.3 TypeScript dev types desalinhados
- `@types/react: "^18.0.0"` enquanto `react: "^19.x"` — os tipos devem corresponder à versão do React em uso.
- `@types/react-dom: "^18.0.0"` — mesma situação.

#### 2.4 `critters` como devDependency com `optimizeCss: false`
**Arquivo:** `next.config.mjs:8`

`critters` (inline de CSS crítico) está instalado mas a otimização de CSS está **desativada** (`optimizeCss: false`). Ou habilitar a feature, ou remover a dependência.

---

## 3. Qualidade do Código

### 🟠 Alto

#### 3.1 Newsletter sem implementação real
**Arquivo:** `components/NewsletterForm.tsx:22-24`

O formulário de newsletter é exibido em destaque em todas as páginas de post, com mensagens como "Join 25,000+ investors", mas internamente só faz um `setTimeout` simulado. Nenhum dado de email é coletado ou enviado. Isso representa uma **promessa falsa ao usuário** e um risco de conformidade com leis de dados (LGPD/GDPR).

```ts
// TODO: Implement newsletter API endpoint
// For now, simulate a successful subscription
await new Promise(resolve => setTimeout(resolve, 1000))
```

#### 3.2 AdSense com IDs placeholder
**Arquivo:** `lib/constants.ts:107-111`

```ts
'blog-top': 'xxxxxxxxxxxx', // Replace with actual slot ID
```

Os slot IDs são todos placeholders. Em produção, anúncios seriam renderizados com IDs inválidos.

#### 3.3 Sitemap com URL hardcoded placeholder
**Arquivo:** `app/sitemap.ts:8`

```ts
const baseUrl = 'https://cryptoacademy.example.com' // Update with your domain
```

A URL do sitemap está hardcoded com um domínio de exemplo, enquanto `SITE_CONFIG.url` já usa `NEXT_PUBLIC_SITE_URL`. Inconsistência que pode prejudicar SEO.

#### 3.4 Verificação do Google Search Console não configurada
**Arquivo:** `app/layout.tsx:77`

```ts
verification: {
  google: 'your-google-verification-code',
}
```

O código de verificação é um placeholder literal. Isso envia um meta tag inválido para todos os visitantes.

#### 3.5 Social links e email com valores placeholder
**Arquivo:** `lib/constants.ts:22-29`

```ts
twitter: 'https://twitter.com/cryptoacademy',   // conta pode não existir
adSense: { clientId: 'ca-pub-xxxxxxxxxxxxxxx' } // placeholder
```

#### 3.6 Definição duplicada de schema de validação
**Arquivos:** `lib/validations.ts` e `app/api/auth/register/route.ts:6-10`

O `registerSchema` está definido duas vezes com os mesmos campos. A rota de API não importa do arquivo centralizado `lib/validations.ts`.

### 🟡 Médio

#### 3.7 Ausência de testes automatizados
O repositório não possui **nenhum teste** — nem unitário, nem de integração, nem e2e. O `package.json` não tem script de `test`. Há documentação sobre estratégia de testes em `.context/docs/testing-strategy.md`, mas nenhuma implementação.

#### 3.8 Modelo `Comment` sem uso visível no front-end
O schema Prisma define `Comment` com aprovação moderada, mas nenhuma página ou componente do front-end exibe ou permite criar comentários. O modelo `Follower` também está definido mas sem uso.

#### 3.9 Ausência de página 403
**Arquivo:** `middleware.ts:21`

```ts
return NextResponse.rewrite(new URL("/403", nextUrl))
```

O middleware redireciona para `/403` em caso de acesso não autorizado, mas essa página não existe no projeto. O usuário verá um erro 404.

#### 3.10 `PasswordReset` sem endpoint funcional
O modelo `PasswordReset` existe no schema mas não há nenhuma rota de API de recuperação de senha implementada. Usuários que esquecerem a senha não têm como recuperar o acesso.

---

## 4. SEO e Performance

### 🟡 Médio

#### 4.1 URL canônica estática em páginas dinâmicas
**Arquivo:** `lib/seo.ts:74-76`

```ts
alternates: {
  canonical: SITE_CONFIG.url, // sempre a homepage!
}
```

A URL canônica é sempre a URL raiz do site, mesmo em posts individuais. Isso duplica a URL canônica em centenas de páginas, podendo prejudicar o ranqueamento.

#### 4.2 OG type incorreto para páginas não-artigo
**Arquivo:** `lib/seo.ts:46`

```ts
openGraph: {
  type: 'article', // hardcoded
```

`generateMetadata` sempre usa `type: 'article'`, mas é usado também para a homepage e página `/about`, que deveriam ser `type: 'website'`.

#### 4.3 Categorias de sitemap como query params
**Arquivo:** `app/sitemap.ts:42-47`

```ts
url: `${baseUrl}/blog?category=${category}`
```

Categorias baseadas em query string não são indexadas de forma otimizada por motores de busca. Considerar rotas dedicadas: `/blog/categoria/bitcoin`.

#### 4.4 ISR configurado globalmente mas não por rota em alguns casos
`revalidate = 3600` está definido corretamente nas páginas de post, mas não está explicitamente definido em `app/blog/page.tsx` e `app/page.tsx`, que podem acabar com comportamento padrão não intencional.

---

## 5. Configuração e Infraestrutura

### 🟠 Alto

#### 5.1 Ausência de migração de banco em CI/CD
O Docker executa `prisma migrate deploy` no entrypoint, o que é correto. Porém, não há fallback ou verificação de saúde pós-migração antes de aceitar tráfego. Se a migração falhar, o servidor Next.js inicia mesmo assim se `exec node server.js` for chamado de alguma forma diferente.

**Verificação:** O `set -e` no `entrypoint.sh` mitiga isso — se a migração falhar, o shell para. Comportamento correto.

#### 5.2 `CONTENTFUL_ACCESS_TOKEN` exposto no front-end
**Arquivo:** `.env.example:4`

```
NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN=your_access_token
```

Variáveis com prefixo `NEXT_PUBLIC_` são embutidas no bundle JavaScript do cliente e visíveis publicamente. O Contentful Delivery API token deve usar apenas a variável sem prefixo `NEXT_PUBLIC_` (`CONTENTFUL_ACCESS_TOKEN`) e ser usada apenas no servidor.

Verificar se `NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN` é realmente usada em algum componente client-side — se não for, remover o prefixo `NEXT_PUBLIC_`.

#### 5.3 Variável de ambiente não documentada
**Arquivo:** `app/layout.tsx:86`

```ts
const ga4Id = process.env.NEXT_PUBLIC_GA4_ID
```

`NEXT_PUBLIC_GA4_ID` não está documentada no `.env.example`, que usa `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`. Uma das duas é a variável correta.

### 🟡 Médio

#### 5.4 Docker Compose sem variáveis de ambiente
**Arquivo:** `docker-compose.yml`

O compose não define variáveis de ambiente nem referencia um arquivo `.env`. Em desenvolvimento, o container não vai funcionar sem configuração manual adicional.

#### 5.5 Ausência de healthcheck no Docker
O Dockerfile não define `HEALTHCHECK`, o que pode causar problemas em orquestradores como Kubernetes ou ECS ao detectar containers com falha.

---

## 6. Arquitetura e Boas Práticas

### ✅ Pontos Positivos

- **RBAC bem estruturado**: Papéis (ADMIN, EDITOR, AUTHOR) com permissões granulares definidas em `types/roles.ts` e verificadas via `lib/permissions.ts`.
- **Singleton do Prisma Client**: Implementado corretamente para evitar múltiplas conexões em desenvolvimento.
- **ISR implementado**: `revalidate = 3600` nas páginas de post para cache eficiente com Contentful.
- **Schema Zod em rotas de API**: Validação de entrada presente nas rotas críticas.
- **Multi-stage Docker build**: Imagem de produção enxuta usando `output: 'standalone'`.
- **Non-root user no Docker**: Container roda como usuário `nextjs` sem privilégios root.
- **Headers de segurança básicos**: `X-Frame-Options`, `X-Content-Type-Options` configurados.
- **Structured Data (JSON-LD)**: Schema de Article, WebSite e Organization implementados.
- **Open Graph / Twitter Cards**: Metadados sociais bem configurados por página.
- **Acessibilidade básica**: Link "Skip to main content" presente no layout.
- **`poweredByHeader: false`**: Remove o header `X-Powered-By: Next.js` por segurança.

### 🟡 Oportunidades de Melhoria Arquitetural

- A separação entre Contentful (CMS) e Prisma (usuários/auth) é uma boa decisão, mas o modelo `Post` no Prisma (com `contentfulId`) cria acoplamento parcial não documentado.
- O middleware só protege `/admin/:path*`. Rotas de API como `/api/users` fazem sua própria autenticação — correto, mas o middleware poderia servir como camada adicional.
- Não há monitoramento de erros (ex: Sentry) configurado para produção.

---

## 7. Resumo e Prioridades de Correção

| Prioridade | Item | Impacto |
|---|---|---|
| 🔴 P0 | Senhas hardcoded no seed (1.1) | Comprometimento de conta admin |
| 🔴 P0 | Token Contentful público no cliente (5.2) | Exposição de credencial de API |
| 🔴 P0 | Registro público sem rate limit (1.3 + 1.4) | Spam / abuso de recursos |
| 🟠 P1 | CSRF não aplicado (1.2) | CSRF em rotas de mutação |
| 🟠 P1 | CSP ausente (1.8) | XSS sem mitigação |
| 🟠 P1 | Newsletter falsa (3.1) | Risco legal / reputação |
| 🟠 P1 | AdSense com IDs placeholder (3.2) | Receita zero em produção |
| 🟠 P1 | GA4 ID inconsistente (5.3) | Analytics não funciona |
| 🟡 P2 | Versões inválidas no package.json (2.1) | Build instável |
| 🟡 P2 | URL canônica estática (4.1) | Penalidade de SEO |
| 🟡 P2 | Sitemap com URL hardcoded (3.3) | SEO incorreto |
| 🟡 P2 | Google verification placeholder (3.4) | Search Console não validado |
| 🟡 P2 | Página 403 ausente (3.9) | UX quebrada |
| 🟡 P2 | Password reset sem implementação (3.10) | Usuários presos fora da conta |
| 🟡 P3 | Ausência de testes (3.7) | Risco de regressões |
| 🟡 P3 | `images.domains` deprecado (1.9) | Warning de build |
| 🟡 P3 | Dependência `next-rate-limit` não usada (2.2) | Bundle desnecessário |

---

## 8. Checklist de Ações Imediatas (Antes de ir para Produção)

- [ ] Remover senhas hardcoded do `prisma/seed.ts`
- [ ] Remover `NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN` do `.env.example` (ou justificar uso client-side)
- [ ] Implementar rate limiting em `/api/auth/register`
- [ ] Implementar ou remover o formulário de newsletter
- [ ] Configurar IDs reais do AdSense ou remover o componente
- [ ] Unificar `NEXT_PUBLIC_GA4_ID` / `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`
- [ ] Criar página `/403`
- [ ] Corrigir URL canônica dinâmica no `lib/seo.ts`
- [ ] Corrigir URL do sitemap para usar `NEXT_PUBLIC_SITE_URL`
- [ ] Adicionar Content-Security-Policy ao `next.config.mjs`
- [ ] Migrar `images.domains` para `remotePatterns`
