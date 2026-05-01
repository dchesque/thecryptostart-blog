# Decisões travadas — implantação

> Snapshot das respostas a `IMPLEMENTATION_BRAINSTORM.md` §13.
> Quando uma decisão mudar, registrar no rodapé com data e motivo.

---

## D1. Provedor de e-mail: **Resend**

- Free tier (3k emails/mês) cobre o volume atual.
- Setup: criar conta, verificar domínio (SPF/DKIM/DMARC), env `RESEND_API_KEY`.
- Templates: **HTML inline** (string templates) em `lib/email/*.ts`. React Email
  ficou de fora — adiciona 2 deps e cria fricção de SSR/build sem ganho real
  para os 3 templates atuais. Migrar se passarmos de ~10 templates ou
  precisarmos de previews dev.

**Implicação**: F2 já tem stack definida.

## D2. MCP no monorepo

- Pasta `mcp-server/` ao lado de `app/`.
- `tsconfig.json` próprio, mas reusa `@/types` via path do monorepo.
- Build separado (`mcp-server/dist/`); não entra no bundle do Next.
- Migração para repo separado fica documentada como caminho futuro se virar pacote npm.

**Implicação**: F3 começa direto, sem overhead de novo repositório.

## D3. Escritas via MCP: opt-in explícito

- Env `MCP_WRITES_ENABLED` default **false**.
- Em prod, só roda `posts.create/update/delete/publish` etc. com a env true.
- Audit log obrigatório em `SystemLog` com `source: "MCP"`.
- `posts.delete` exige `confirm: "DELETE <slug>"` mesmo com a env true.

**Implicação**: F4 ganha 1 camada extra de proteção; default seguro.

## D4. MCP só interno

- **F6 (hosted multi-tenant) sai do roadmap por enquanto.**
- Transporte: só stdio. Cliente principal: Claude Desktop / Claude Code locais.
- Tabela `MCPClient`, scopes granulares, rate-limit por key — adiados.
- Auth = `ADMIN_API_KEY` (já existe), passado pelo `mcp-server/src/api-client.ts` em chamadas admin.

**Implicação**: roadmap encurta para F0→F5. ~10 dias de dev em vez de ~13.

## D5. Welcome email com posts em destaque

- Após `confirm`, dispara welcome com 3-5 posts de `/api/posts/featured`.
- Template: `welcome-with-picks.tsx`.
- Não bloqueia a confirmação se Resend falhar — try/catch isolado, log.

**Implicação**: F2 ganha mais 1 template + 1 chamada interna na rota de confirm.

## D6. OpenAPI público em `/api/docs`

- `zod-to-openapi` + Swagger UI em `app/api/docs/route.ts` (HTML) e
  `app/api/openapi.json/route.ts`.
- Toda rota pública e admin documentada (admin marcada com `security: ApiKey`).
- Cliente MCP tipa-se a partir do JSON gerado (via `openapi-typescript`).

**Implicação**: ~4h adicionais em F3, mas elimina drift de tipos e dá docs de graça.

## D7. SEO insights = só relatório markdown

- Prompt `seo-fix-pr` retorna **apenas** texto markdown estruturado.
- Sem `posts.update` automático e sem PR no GitHub.
- Decisão de aplicar fica 100% com o humano (revisar no admin).

**Implicação**: F5 fica mais simples; sem `GITHUB_TOKEN`, sem wrapper Git.

## D8. Orçamento: free tiers (US$ 0)

| Serviço | Plano | Limite | Risco de estourar |
|---------|-------|--------|-------------------|
| Resend | Free | 3k emails/mês | Médio se newsletter crescer >3k inscritos ativos |
| Upstash Redis | Free | 10k cmd/dia | **Alto** — rate-limit + newsletter pode somar |
| Sentry | Free | 5k erros/mês | Baixo |
| UptimeRobot | Free | 50 monitores, 5min interval | Baixo |
| Fly.io / hosted | — | descartado (D4) | N/A |

**Implicações concretas**:
- **Upstash em risco**: cada `POST /api/comments` consome 1-2 cmd; cada subscribe consome 1. Em 10k cmd/dia = ~5k requests. Para começar, OK; monitorar com painel Upstash.
- **Sem APM pago** → métricas só pelo `SystemLog` em Postgres + dashboard caseiro em `/admin/diagnostics` (já existe esqueleto).
- **Fly.io fora** → reforça D4 (MCP só local).

## Resumo do escopo travado

| Fase | Status | Esforço estimado |
|------|--------|------------------|
| F0 — Migration prod | Pronto pra começar | 2 h |
| F1 — Hardening (5 itens) | Pronto pra começar | 6 h |
| F2 — E-mail Resend + double opt-in + welcome | Pronto pra começar | 1 dia + 0,5 dia (welcome) |
| F3 — MCP MVP (read-only) + OpenAPI | Pronto pra começar | 2 dias + 0,5 dia (OpenAPI) |
| F4 — MCP autoria com `MCP_WRITES_ENABLED` | Pronto pra começar | 1 dia |
| F5 — MCP moderação + insights (só relatório) | Pronto pra começar | 1,5 dia |
| F6 — Hosted multi-tenant | **Removido do roadmap** | — |
| Tests + CI | Pronto pra começar | 2 dias |

**Total revisado**: ~10 dias de dev. MVP utilizável (F0+F1+F2+F3) em ~5 dias.

## Próximo passo recomendado

**F0 — deploy da migration `NewsletterSubscriber` em produção.** É o bloqueio
mínimo para o resto. Inclui:

1. Backup Postgres antes.
2. `prisma migrate deploy` em staging.
3. Smoke test do `POST /api/newsletter/subscribe` em staging.
4. Deploy em prod.
5. Sanity check do `/api/health` e `/api/admin/diagnostics`.

Posso começar isso já — ou prefere abrir PR primeiro do que está em
`claude/audit-blog-api-1wkNb` e mergear na main antes de F0?

---

### Histórico

- **2026-04-30**: decisões iniciais travadas (D1-D8) — sessão de auditoria.
