# Brainstorm — Implantação do plano completo

> Companion ao [`API_AUDIT.md`](./API_AUDIT.md). O audit descreve **o quê**;
> este doc é o **como** — decisões abertas, ordem de execução, trade-offs,
> riscos e ideias que ainda não estão no escopo travado.
>
> Tratar este arquivo como rascunho de trabalho. Ele evolui conforme as
> decisões forem fechadas.

---

## 0. Pré-voo (antes de tocar código)

Antes de qualquer fase, precisamos travar 6 coisas. São rápidas, mas sem isso
o resto vira retrabalho.

| Decisão | Opções | Recomendação |
|---------|--------|--------------|
| **Provedor de e-mail** para newsletter (confirm + broadcasts) | Resend / Mailgun / SES / Postmark | **Resend** — DX excelente, free tier generoso, API simples (alinhado a Next.js) |
| **Onde roda o MCP server** | Local stdio / Fly.io / Cloudflare Workers / Vercel | **MVP local stdio**; hosted depois em **Fly.io** (Node nativo, custo previsível) |
| **Domínio do MCP hosted** | `mcp.thecryptostart.com` / subdomínio do app / domínio separado | Subdomínio (`mcp.<domínio>`) — separa logs/CORS/quota |
| **Rate-limit em produção** | Manter in-memory / Upstash Redis / Vercel KV | **Upstash Redis** — README já cita; multi-instância seguro |
| **Quem roda `prisma migrate deploy`** | CI / SSH manual no EasyPanel / Hook do build | **CI** após merge na main, com flag `MIGRATE_ON_DEPLOY=true` |
| **Política de retenção** de `SystemLog` e `SpamLog` | Sem expurgo / 30 d / 90 d | **30 d** com job cron-style (`pg_cron` ou job no Next) |

Itens de infra a confirmar:
- `ADMIN_API_KEY` está rotacionável? Tem cópia no gerenciador de segredos?
- Backup do Postgres está agendado? Restore foi testado nos últimos 90 dias?
- Há monitoramento de uptime no `/api/health`? (UptimeRobot, BetterStack, etc.)

## 1. Ordem de execução proposta

Sequência otimizada para entregar valor cedo e minimizar bloqueio em
infra/decisões:

```
F0  Migration produção (NewsletterSubscriber)              ← desbloqueia /api/newsletter
F1  Hardening pendente (5 follow-ups do audit §8)          ← reduz dívida
F2  E-mail provider + double opt-in real                    ← newsletter funcional ponta a ponta
F3  MCP MVP (read-only)                                    ← valor imediato em LLM clients
F4  MCP autoria (admin writes)                             ← maior alavancagem do agente
F5  MCP moderação + insights                               ← fecha o loop editorial
F6  MCP hosted (HTTP-SSE) + auth multi-tenant              ← se realmente quisermos expor para terceiros
F7  Stretch: dashboard analytics, password reset, search melhor
```

**Caminho crítico**: F0 → F2 (newsletter ponta a ponta) e F0 → F3 (MCP) podem
ir em paralelo. F1 também é paralelizável.

## 2. Fase 0 — Deploy da migration em produção

### Decisões
- Aplicar via `prisma migrate deploy` ou manual via `psql`?
- Janela de manutenção ou deploy a quente? (zero-downtime — a migration só
  cria tabela nova, sem `ALTER` destrutivo, então é seguro a quente).

### Plano (zero-downtime)
1. Backup Postgres antes (`pg_dump`).
2. `prisma migrate deploy` (apenas adiciona `NewsletterSubscriber` +
   `SubscriberStatus` enum — não afeta queries existentes).
3. `npx prisma generate` no build do app.
4. Smoke test: `POST /api/newsletter/subscribe` em staging com email-burner.
5. Deploy do app.

### Riscos
- ⚠️ O `Prisma Client` regenerado precisa estar no bundle do Next; `output:
  'standalone'` em `next.config.mjs` cuida disso, mas confirmar no Dockerfile.
- ⚠️ EasyPanel costuma ter o filesystem read-only — `prisma generate` precisa
  rodar em build-time, não em runtime.

## 3. Fase 1 — Hardening pendente (audit §8)

5 itens, cada um pequeno:

| # | Item | Esforço | Como |
|---|------|---------|------|
| H1 | Proteger `/api/seo/metrics` | 30 min | Adicionar `checkApiAuth` + cache 5 min em memória |
| H2 | Recalcular `wordCount`/`readingTime` server-side no admin POST/PUT de posts | 30 min | No `postSchema`, transformar `content` → calcular se vier 0 |
| H3 | Adicionar `app/robots.ts` ou remover exclusão do matcher | 15 min | Recomendo criar `robots.ts` (tem regras úteis para Googlebot) |
| H4 | Migrar `lib/rate-limit.ts` para Upstash Redis | 2 h | `@upstash/ratelimit` + `@upstash/redis`; manter API atual |
| H5 | Endpoints de password reset | 3 h | `/api/auth/password-reset/{request,confirm}` + email via F2 |

Cada um vira um commit independente. **H4 é pré-req do F6**.

## 4. Fase 2 — E-mail provider e double opt-in real

Hoje `/api/newsletter/subscribe` cria o registro com `confirmToken` mas
**ninguém envia o e-mail**. Precisamos:

### Setup Resend
1. Criar conta + verificar domínio (SPF/DKIM/DMARC).
2. Variável: `RESEND_API_KEY`.
3. `npm i resend`.

### Templates
- `confirm-subscription.tsx` (React Email) — link para
  `/api/newsletter/confirm?token=...`.
- `welcome.tsx` — após confirmar.
- `unsubscribe-success.tsx` — opcional.

### Ajuste no endpoint
Em `app/api/newsletter/subscribe/route.ts`, depois do `prisma.create`, chamar
`resend.emails.send(...)`. **Não** bloquear a resposta se falhar — log + fila
de retry simples (`await` com try/catch isolado).

### Compliance
- LGPD/GDPR: link de unsubscribe em **todo** broadcast.
- Tabela `NewsletterSubscriber.ipAddress` + `userAgent` já guardam evidência
  do consent (já implementado).
- Prazo de retenção documentado (30 d para PENDING não confirmados → expurgo).

### Observação
Se o blog é PT-BR para audiência crypto LATAM, considerar **Brevo**
(ex-Sendinblue) — preço melhor em volume, mas DX inferior à Resend.

## 5. Fase 3 — MCP MVP (read-only)

Match com §7.9 do audit (etapa 1). Decisões abertas:

### 5.1 Estrutura de repo
- **Opção A**: pasta `mcp-server/` no monorepo do blog. Vantagem: deploy
  conjunto, tipos compartilhados via `@/types`.
- **Opção B**: repo separado (`thecryptostart-mcp`). Vantagem: versionamento
  independente, publicar no npm.

**Recomendação**: começar **A** (rapidez), migrar para **B** quando
publicarmos no npm registry.

### 5.2 Tipos compartilhados
O blog tem `types/blog.ts` com `BlogPost`. O MCP deve **reusar**:
```ts
// mcp-server/src/types.ts
export type { BlogPost } from "../../types/blog"
```
Mantém um único contrato. Quando virar repo separado, gerar o tipo via
OpenAPI (próxima ideia).

### 5.3 Geração de OpenAPI
Vale **gerar OpenAPI spec a partir dos schemas Zod** (`zod-to-openapi`):
- Cliente MCP fica typesafe sem cópia manual.
- Documentação pública grátis (Swagger UI em `/api/docs`).
- Testes contract-driven.

Esforço: ~4 h. Alto ROI.

### 5.4 Tool naming
Padrão `recurso.acao` (ex: `posts.list`, `posts.publish`) — compatível com
convenção MCP. Alternativa: `list-posts` (kebab). **Manter ponto** — mais
hierárquico e bate com nomes Anthropic SDK.

### 5.5 Schemas de tool
Reusar os Zod schemas em `lib/validations/admin.ts` para `posts.create` e
`posts.update`. Evita drift de validação.

### 5.6 Cache no client MCP
Public reads (`posts.list`, `categories.list`) já têm `Cache-Control`
no Next. O cliente MCP pode adicionar `node-cache` (TTL 60 s) para reduzir
ida ao backend em sessões longas com LLM.

## 6. Fase 4 — MCP autoria

### Risco crítico: writes destrutivos
LLM pode chamar `posts.delete` por engano. Mitigação:
- **Dry-run flag**: toda tool de escrita aceita `dryRun: boolean` (default
  false em prod, true em dev).
- **Confirm token**: `posts.delete` exige `confirm: "DELETE post-slug-here"`.
- **Audit log**: toda chamada de write registra em `SystemLog` com
  `source: "MCP"` e o `userId`/`sessionId` do cliente MCP.
- **Whitelist por env**: `MCP_WRITES_ENABLED=true` precisa estar setada.

### Prompt `new-post-skeleton`
Ideias para o prompt:
- Aceitar `targetKeyword` + `contentType` + `difficulty` como input.
- Retornar JSON pré-preenchido com:
  - `slug` derivado do keyword
  - `seoTitle`/`seoDescription` placeholders
  - `schemaType` inferido do `contentType`
  - `faq`/`howToSteps` opcional baseado em `schemaType`
- **Não** preencher `content` — esse é o trabalho do LLM consumidor.

### Validação cross-field
Hoje o `postSchema` não valida combinações como "ARTICLE não deveria ter
`howToSteps`". Adicionar `.refine()` em paralelo ao MCP.

## 7. Fase 5 — Moderação + insights

### Triagem de comentários (prompt `triage-comments`)
- Input: `posts/[slug]` (opcional), max 50 comentários PENDING.
- LLM classifica: APPROVE / REJECT / SPAM com justificativa.
- Saída é uma proposta — humano clica "aplicar todos" ou edita item-a-item.
- Aplicação executa um batch contra `PATCH /api/admin/comments/[id]` em
  paralelo (com `Promise.allSettled`).

**Não** fazer auto-apply na primeira iteração. Depois de 30 d com >95% de
acerto, aí sim auto-apply opt-in.

### Insights (prompt `seo-fix-pr`)
- Pull `/api/seo/metrics` + `/api/gsc/analytics`.
- Cruzar: posts com avg position 8-15 + word count <1500 + low CTR → topo
  da lista de oportunidades.
- Output: lista priorizada de slugs com ações sugeridas (ampliar, adicionar
  links internos, reescrever title).
- Stretch: gerar **PR draft** com as edições propostas (precisa do `posts.update`
  e de um wrapper Git — fora do MVP).

## 8. Fase 6 — MCP hosted (HTTP-SSE)

Só quando houver demanda real de cliente externo. Considerações:

| Tema | Proposta |
|------|----------|
| **AuthN** | API Keys por cliente, tabela `MCPClient` (id, name, hashedKey, scopes, createdAt, lastUsedAt) |
| **AuthZ / scopes** | `posts.read`, `posts.write`, `comments.moderate`, `newsletter.read` — granular |
| **Rate-limit** | Upstash Redis (mesma infra de F1.H4), por API key |
| **Logging** | Cada request → `SystemLog` com `source: "MCP-HTTP"`, `clientId`, `tool`, `latencyMs` |
| **CORS** | Strict allowlist; nunca `*` |
| **Deploy** | Fly.io (Node SSE-friendly); Cloudflare Workers tem limitações com SSE longo |

### Nova tabela
```prisma
model MCPClient {
  id           String   @id @default(cuid())
  name         String
  hashedKey    String   @unique
  scopes       String[]
  rateLimitRpm Int      @default(60)
  isActive     Boolean  @default(true)
  lastUsedAt   DateTime?
  createdAt    DateTime @default(now())
  revokedAt    DateTime?
}
```

## 9. Observabilidade

Hoje temos `SystemLog` em DB + `console.log`. Falta:

| Nível | Necessidade | Sugestão |
|-------|-------------|----------|
| **Métricas** | latência por endpoint, RPM, erros | OpenTelemetry → Grafana Cloud (free tier) ou Vercel Analytics |
| **APM** | traces cross-Prisma | Sentry Performance ou OTEL nativo |
| **Erros** | exception tracking com sourcemaps | Sentry (alinhado a Next) |
| **Uptime** | ping `/api/health` a cada 1 min | UptimeRobot grátis até 50 monitores |
| **Dashboards** | total subscribers, taxa de confirm, tools MCP mais usadas | Metabase em Postgres réplica, ou view materializada + admin page |

### Dashboard "MCP usage" (admin)
- Top tools por chamada
- Latência p50/p95/p99
- Taxa de erro
- Clientes mais ativos
- Reusa `SystemLog` filtrando `source` like `"MCP%"`.

## 10. Estratégia de testes

Hoje há `jest.config.js` mas zero testes. Plano:

| Camada | Ferramenta | Cobertura alvo |
|--------|------------|----------------|
| Unit (lib/*) | Jest | 70% — `posts.ts`, `seo-analyzer.ts`, `spam-prevention.ts`, `permissions.ts` |
| API contract | Jest + supertest contra Next em modo test | smoke de cada rota (200/401/404 + 1 happy path) |
| MCP tools | Jest com fetch mockado (msw) | unit por tool |
| E2E | Playwright | login → criar post → publicar → ver no `/blog` |
| DB | testcontainers Postgres | sobe DB efêmero, roda migrations, integration tests |

**Mínimo viável**: smoke das 50 rotas via supertest + 5 e2e críticos. ~2 dias.

## 11. CI/CD

Hoje sem GitHub Actions. Proposta:

```yaml
# .github/workflows/ci.yml
on: [push, pull_request]
jobs:
  test:
    - npm ci
    - npx prisma generate
    - npm run lint
    - npm run type-check
    - npm test
    - npm run build  # garante que build não quebra
  deploy:
    if: github.ref == 'refs/heads/main'
    - prisma migrate deploy (via secret DATABASE_URL_PROD)
    - deploy hook EasyPanel
```

Sem isso, F0 e qualquer migration futura é manual = arriscado.

## 12. Riscos & mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| LLM dispara `posts.delete` em lote | Média | Alto | Confirm token + audit log + dry-run default em prod |
| Migration N+1 em prod sem backup | Baixa | Crítico | Backup automatizado + test restore mensal |
| Rate-limit in-memory cai em rolling deploy | Alta | Médio | F1.H4 — Upstash Redis |
| API key vaza | Média | Alto | Tabela `MCPClient` com revoke + rotação trimestral + scopes mínimos |
| E-mail Resend cai | Baixa | Baixo | Fallback queue (BullMQ ou simples retry com backoff em `SystemLog`) |
| GSC cota estoura | Baixa | Médio | Cache de 1h já existe; aumentar para 6h em prod |
| Spam acaba contornando o keyword filter atual | Alta | Médio | Adicionar Akismet ou modelo simples ML; rate-limit per-IP já ajuda |

## 13. Decisões abertas (perguntas para o usuário)

> ✅ **Respondidas em 2026-04-30 — ver [`DECISIONS.md`](./DECISIONS.md).**

- [x] **F2**: Resend confirmado (D1).
- [x] **F2**: welcome email com 3-5 posts em destaque (D5).
- [x] **F3**: monorepo `mcp-server/` (D2).
- [x] **F3**: OpenAPI público em `/api/docs` (D6).
- [x] **F4**: `MCP_WRITES_ENABLED=false` default (D3).
- [x] **F5**: só relatório markdown, sem PR automático (D7).
- [x] **F6**: só interno — F6 sai do roadmap (D4).
- [x] **Geral**: free tiers (US$ 0) (D8).

## 14. Estimativa de esforço (ballpark)

> Engenheiro full-stack senior, foco dedicado.

| Fase | Esforço | Wallclock |
|------|---------|-----------|
| F0 — Migration prod | 2 h | 1 dia |
| F1 — Hardening (5 itens) | 6 h | 2 dias |
| F2 — Email pipeline | 1 dia | 2 dias |
| F3 — MCP MVP | 2 dias | 3-4 dias |
| F4 — MCP autoria | 1 dia | 2 dias |
| F5 — MCP moderação + insights | 2 dias | 4 dias |
| F6 — MCP hosted | 3 dias | 1 semana |
| Tests + CI | 2 dias | 3 dias |
| **Total** | **~13 dias** | **~3-4 semanas** |

F0+F1+F2+F3 = **MVP utilizável** em ~1 semana de trabalho efetivo.

## 15. Stretch goals (fora do plano travado)

Ideias que valem ser discutidas depois:

1. **Search vetorial** — `pgvector` + embeddings dos posts (OpenAI/Voyage).
   Substitui o `searchPosts` atual (LIKE ingênuo). MCP tool `posts.semantic-search`.
2. **AI assistant na UI admin** — chat inline em `/admin/posts/new` que
   chama o MCP server local.
3. **Sitemap dinâmico chunked** — hoje sitemap único com todos os posts.
   Quando passar de 5k posts, dividir em `sitemap-posts-1.xml`, etc.
4. **Webhook de publicação** — após publish, dispara n8n / Slack / Discord
   (`/api/admin/publish-webhooks`).
5. **A/B test de title/seoTitle** — duas variantes, GSC mostra qual venceu.
6. **Comments em tempo real** — Server-Sent Events para `CommentsList`.
7. **Backup público no S3/R2** — JSON dump diário dos posts publicados
   (resiliência se o DB cair).
8. **i18n** — campos `title_pt`, `title_en` no `Post`. Big lift, só se
   houver demanda.
9. **Image upload** — hoje URLs externas; adicionar Cloudflare R2 + um
   `/api/admin/upload`.
10. **Podcast/RSS** — `/api/feed.xml` ou `app/feed.xml/route.ts` com os 50
    últimos posts.

## 16. Métricas de sucesso

Como saberemos se valeu a pena?

- **F2**: ≥30 inscritos confirmados em 30 dias.
- **F3-F4**: ≥5 chamadas MCP por dia em uso interno após 1 semana.
- **F5**: ≥80% de aceite das sugestões de moderação.
- **F1.H4**: zero `429` falso-positivo em produção (rate-limit funciona).
- **Geral**: tempo médio do fluxo "ideia → post publicado" cai 30%.

---

**Próximo passo recomendado**: responder as decisões da §13 (especialmente
provedor de e-mail e onde mora o MCP), aí entro em F0.
