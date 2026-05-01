# F0 — Deploy da migration `NewsletterSubscriber` em produção

> Operação **zero-downtime**. A migration só adiciona tabela e enum novos —
> não altera nada existente.
>
> Tempo estimado: 5-10 min de janela operacional, ~30 min total com smoke tests.

---

## Pré-requisitos

- [ ] Acesso SSH ao container do EasyPanel **OU** acesso ao painel para
      rodar comandos.
- [ ] `DATABASE_URL` de produção exportado no shell.
- [ ] Branch `main` já com este commit mergeado (audit PR #3 + a migration
      em `prisma/migrations/20260430_newsletter_subscriber/`).
- [ ] `pg_dump` disponível na máquina onde for rodar o backup.

## Passo 1 — Backup do Postgres

```bash
# Substituir pelas credenciais corretas. Dump comprimido para economizar espaço.
TIMESTAMP=$(date -u +%Y%m%dT%H%M%SZ)
pg_dump "$DATABASE_URL" \
  --format=custom \
  --no-owner \
  --no-privileges \
  --file="thecryptostart_${TIMESTAMP}.dump"

# Validar que o dump não está vazio e foi escrito corretamente.
ls -lh "thecryptostart_${TIMESTAMP}.dump"
pg_restore --list "thecryptostart_${TIMESTAMP}.dump" | head -20
```

Guardar o arquivo num bucket S3/R2 ou disco fora do container.

## Passo 2 — Verificação prévia

```bash
# Confirma que estamos na branch certa e o schema bate com a migration.
git log -1 --pretty=format:"%H %s" prisma/migrations/20260430_newsletter_subscriber/
# Esperado: o commit que adicionou a migration (ee80f6d ou descendente).

# Confirma que o cliente Prisma está atualizado.
npx prisma validate
```

## Passo 3 — Aplicar migration em **staging** primeiro

```bash
# Aponta para staging.
DATABASE_URL=<staging-url> npx prisma migrate deploy

# Esperado:
# 1 migration found in prisma/migrations
# Applying migration `20260430_newsletter_subscriber`
# The following migration(s) have been applied:
#   20260430_newsletter_subscriber
```

Smoke test em staging:

```bash
# Subscribe — deve retornar 201
curl -X POST "$STAGING_URL/api/newsletter/subscribe" \
  -H "content-type: application/json" \
  -d '{"email":"smoke+f0@example.com","source":"f0-runbook"}'

# Listagem admin — deve incluir o subscriber recém-criado
curl "$STAGING_URL/api/admin/newsletter/subscribers" \
  -H "X-API-Key: $ADMIN_API_KEY" | jq '.subscribers[0]'

# Limpa o subscriber de teste
curl -X DELETE "$STAGING_URL/api/admin/newsletter/subscribers?email=smoke+f0@example.com" \
  -H "X-API-Key: $ADMIN_API_KEY"
```

Se algum desses passos falhar, **parar** e investigar antes de tocar prod.

## Passo 4 — Aplicar migration em **produção**

```bash
DATABASE_URL=<prod-url> npx prisma migrate deploy
```

## Passo 5 — Health checks pós-deploy

```bash
# 1. Health geral
curl "$PROD_URL/api/health" | jq
# Esperado: { "status": "ok", "database": "connected", ... }

# 2. Diagnostics confirma a tabela
curl "$PROD_URL/api/admin/diagnostics" -H "X-API-Key: $ADMIN_API_KEY" | jq '.database.stats'
# Esperado: o objeto stats inclui as contagens normais; logsTable: 1.

# 3. Subscribe real (use seu email pessoal)
curl -X POST "$PROD_URL/api/newsletter/subscribe" \
  -H "content-type: application/json" \
  -d '{"email":"<seu-email>","source":"f0-prod-test"}'
# Esperado: { "message": "Subscribed. Check your inbox to confirm.", "success": true }

# 4. Confirma que está PENDING no DB
curl "$PROD_URL/api/admin/newsletter/subscribers?status=pending&limit=5" \
  -H "X-API-Key: $ADMIN_API_KEY" | jq
```

Em F2 (próxima fase), o passo 3 vai disparar o e-mail real via Resend.
Por enquanto, o registro fica `PENDING` sem e-mail enviado — comportamento
esperado.

## Passo 6 — Smoke test do app público

Abrir manualmente no browser:

- [ ] `https://<prod>/` — homepage carrega
- [ ] `https://<prod>/blog` — listagem carrega
- [ ] `https://<prod>/api/posts?limit=3` — JSON com 3 posts
- [ ] Form de newsletter no rodapé — preencher, ver mensagem de sucesso

## Rollback (em caso de problema)

A migration só adiciona tabela. Para reverter:

```sql
-- Conectar como superuser ao Postgres prod
DROP TABLE IF EXISTS "NewsletterSubscriber";
DROP TYPE IF EXISTS "SubscriberStatus";

-- Marcar a migration como revertida no histórico do Prisma
DELETE FROM "_prisma_migrations" WHERE migration_name = '20260430_newsletter_subscriber';
```

Se algo mais grave aconteceu (DB corrompido), restore do dump:

```bash
# ATENÇÃO: destrutivo. Confirma que está apontando pro DB certo.
pg_restore --clean --if-exists --no-owner --dbname="$DATABASE_URL" \
  thecryptostart_<timestamp>.dump
```

## Pós-deploy

- [ ] Atualizar status no `DECISIONS.md` (registrar data do deploy F0).
- [ ] Avisar no canal de equipe (se houver).
- [ ] Próxima fase: F2 (Resend + e-mail real).

---

### Checklist resumido

- [ ] Backup feito e validado
- [ ] Migration aplicada em staging
- [ ] Smoke staging OK
- [ ] Migration aplicada em prod
- [ ] Health checks OK
- [ ] Smoke público OK
- [ ] Backup arquivado fora do container
