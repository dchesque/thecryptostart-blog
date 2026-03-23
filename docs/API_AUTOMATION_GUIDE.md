# Guia de Automação via API — The Crypto Start Blog

Este guia descreve como integrar ferramentas externas (Python, n8n, Make, Scripts de IA) ao blog para automação de artigos, gestão de usuários, moderação de comentários e auditoria de SEO.

---

## 🛡️ Autenticação e Segurança

### 1. API Key (Endpoints `/api/admin/*` e `/api/users`)
Endpoints administrativos aceitam autenticação unificada via **API Key** OU **sessão NextAuth**.

- **Header**: `x-api-key` (Sugerido) ou `X-API-Key`
- **Chave**: Valor da variável de ambiente `ADMIN_API_KEY` configurada no servidor.
- **Query Param**: `?key=SUA_CHAVE` (Também aceito para testes rápidos).
- **Base URL**: `https://thecryptostart.com`

> 🛡️ **Segurança**: Todas as rotas administrativas utilizam o utilitário `checkApiAuth` (v1.4.5), que valida a chave contra a variável de ambiente, garantindo que nenhum segredo esteja no código.

### 2. Tabela de Permissões Unificada

| Endpoint | Autenticação | Role/Necessário |
| :--- | :--- | :--- |
| `/api/admin/*` | API Key **OU** Sessão | Admin/Editor |
| `/api/users` | API Key **OU** Sessão | Admin |
| `/api/admin/logs` | API Key **OU** Sessão | Admin |
| `/api/gsc/analytics` | Sessão **apenas** | Autenticado |
| `/api/health` | Pública | — |
| `/api/comments` (GET/POST) | Pública (Anti-spam) | — |

---

## 🚀 Endpoints Disponíveis

### 1. Posts (Artigos) — 🔑 API Key ou Sessão

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/admin/posts` | Lista posts com filtros (`?search=`, `?status=`, `?category=`) e paginação (`?page=`, `?limit=`). |
| `POST` | `/api/admin/posts` | Cria um novo post (validação via Zod). |
| `GET` | `/api/admin/posts/[id]` | Detalhes completos de um post. |
| `PUT` | `/api/admin/posts/[id]` | Atualiza todos os campos de um post. |
| `DELETE` | `/api/admin/posts/[id]` | Remove um post permanentemente. |
| `POST` | `/api/admin/posts/[id]/publish` | Ativa/Desativa publicação (`{"publish": true\|false}`). |

### 2. Autores — 🔑 API Key ou Sessão

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/admin/authors` | Lista todos os autores cadastrados. |
| `POST` | `/api/admin/authors` | Cria um novo autor. |
| `GET` | `/api/admin/authors/[id]` | Detalhes de um autor específico. |
| `PUT` | `/api/admin/authors/[id]` | Atualiza um autor existente. |
| `DELETE` | `/api/admin/authors/[id]` | Remove um autor (rejeita se há posts vinculados). |

### 3. Categorias — 🔑 API Key ou Sessão

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/admin/categories` | Lista todas as categorias (inclui contagem de posts). |
| `POST` | `/api/admin/categories` | Cria uma nova categoria. |
| `GET` | `/api/admin/categories/[id]` | Detalhes de uma categoria específica. |
| `PUT` | `/api/admin/categories/[id]` | Atualiza uma categoria existente. |
| `DELETE` | `/api/admin/categories/[id]` | Remove uma categoria (rejeita se há posts vinculados). |

### 4. Comentários — Híbrido (Público + Admin)

| Método | Endpoint | Auth | Descrição |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/comments?postSlug=...` | Público | Lista comentários aprovados de um post. |
| `POST` | `/api/comments` | Público | Envia um comentário (possui Honeypot e Anti-spam). |
| `GET` | `/api/admin/comments` | 🔑 | Lista todos os comentários (filtro por `?status=`, paginação). |
| `PATCH` | `/api/admin/comments/[id]` | 🔑 | Altera status (`APPROVED`, `REJECTED`, `SPAM`). |
| `DELETE` | `/api/admin/comments/[id]` | 🔑 | Deleta comentário e suas respostas. |

### 5. Usuários e Administração — 🔑 API Key ou Sessão (ADMIN)

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/users` | Lista usuários/administradores do sistema. |
| `POST` | `/api/users` | Cria um novo usuário com roles (requer senha hash no db). |
| `PATCH` | `/api/users/[id]` | Atualiza um usuário existente. |
| `DELETE` | `/api/users/[id]` | Remove um usuário. |

### 6. Diagnóstico — Público

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check — valida app, banco e variáveis de ambiente. |

### 7. Métricas e Auditoria (SEO/IA)

| Método | Endpoint | Auth | Descrição |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/seo/metrics` | Público | Métricas globais (contagem de palavras, links internos, oportunidades). |
| `GET` | `/api/ai-optimization/scores` | Público | Pontuação de otimização de cada post para mecanismos de IA. |
| `GET` | `/api/gsc/analytics` | 🔒 Sessão | Dados reais do Google Search Console (Cliques, CTR, Posição). |

---

## 📋 Referência Detalhada de Campos

### 1. Schema de Posts (Completo)

Ao enviar `POST` ou `PUT` para `/api/admin/posts`, o objeto segue esta estrutura. O sistema utiliza **Zod** para validação.

#### Conteúdo Core

| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `title` | string | Sim | Título principal do artigo. |
| `slug` | string | Sim | URL amigável (única, apenas `a-z`, `0-9`, `-`). |
| `excerpt` | string | Sim | Resumo curto para vitrines e cards. |
| `content` | string | Sim | Conteúdo principal em Markdown. |
| `body` | string | Não | Conteúdo secundário/complementar. |
| `status` | string | Não | `DRAFT` (padrão) ou `PUBLISHED`. |
| `authorId` | string | Sim | ID do autor (CUID). |
| `categoryId` | string | Sim | ID da categoria (CUID). |

#### Imagem de Destaque

| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `featuredImageUrl` | string | Não | URL da imagem de destaque. |
| `featuredImageAlt` | string | Não | Texto alternativo da imagem. |
| `featuredImageWidth` | number | Não | Largura da imagem em pixels (ex: `1200`). |
| `featuredImageHeight` | number | Não | Altura da imagem em pixels (ex: `630`). |

#### Classificação e Metadata

| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `contentType` | string | Não | `ARTICLE` (padrão), `GUIDE`, `TUTORIAL`, `GLOSSARY`, `REVIEW`, `NEWS`. |
| `difficulty` | string | Não | `BEGINNER` (padrão), `INTERMEDIATE`, `ADVANCED`. |
| `isFeatured` | boolean | Não | Destaque na Home (padrão: `false`). |
| `tags` | string[] | Não | Array de tags (ex: `["crypto", "web3"]`). |
| `publishDate` | string (ISO) | Não | Data de publicação agendada (ex: `"2026-03-01T12:00:00.000Z"`). |

#### SEO

| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `seoTitle` | string | Não | Meta Title (sobrescreve o título). |
| `seoDescription` | string | Não | Meta Description. |
| `seoImageUrl` | string | Não | Imagem para redes sociais (OG Tag). |
| `seoNoindex` | boolean | Não | `true` para ocultar do Google (padrão: `false`). |
| `targetKeyword` | string | Não | Palavra-chave foco do artigo. |
| `secondaryKeywords` | string[] | Não | Array de palavras-chave secundárias. |
| `canonicalUrl` | string | Não | URL canônica (para evitar conteúdo duplicado). |
| `schemaType` | string | Não | `ARTICLE` (padrão), `HOW_TO`, `REVIEW`, `NEWS_ARTICLE`. Define o JSON-LD Schema. |

#### Dados Estruturados

| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `faq` | JSON | Não | Array de `{ question: string, answer: string }` para Schema.org FAQ. |
| `howToSteps` | JSON | Não | Array de `{ step: string, description: string }` para Schema.org HowTo. |
| `pros` | string[] | Não | Pontos positivos (para reviews). |
| `cons` | string[] | Não | Pontos negativos (para reviews). |

#### Linkagem Interna

| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `relatedPostsSlugs` | string[] | Não | Slugs de posts relacionados. |
| `pillarPageSlug` | string | Não | Slug da Pillar Page (topic cluster). |
| `internalLinks` | JSON | Não | Array de `{ anchorText: string, slug: string }`. |

#### Monetização

| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `adDensity` | string | Não | `LOW`, `NORMAL` (padrão), `HIGH`. Controla quantidade de ads no post. |
| `monetizationDisabled` | boolean | Não | `true` para desabilitar todos os ads (padrão: `false`). |
| `sponsoredBy` | string | Não | Nome do patrocinador (exibe disclosure de conteúdo patrocinado). |

---

### 2. Schema de Autores

`POST /api/admin/authors`

```json
{
  "name": "TheCryptoStart",
  "slug": "thecryptostart",
  "bio": "Your crypto education hub.",
  "avatar": "https://example.com/avatar.png",
  "socialLinks": {
    "twitter": "thecryptostart",
    "website": "https://thecryptostart.com"
  }
}
```

| Campo | Tipo | Obrigatório |
| :--- | :--- | :---: |
| `name` | string | Sim |
| `slug` | string (lowercase, hyphens) | Sim |
| `bio` | string | Não |
| `avatar` | string (URL) | Não |
| `socialLinks` | JSON | Não |

---

### 3. Schema de Categorias

`POST /api/admin/categories`

```json
{
  "name": "Bitcoin",
  "slug": "bitcoin",
  "description": "Everything about Bitcoin",
  "icon": "₿",
  "color": "#F7931A",
  "order": 1
}
```

| Campo | Tipo | Obrigatório |
| :--- | :--- | :---: |
| `name` | string | Sim |
| `slug` | string (lowercase, hyphens) | Sim |
| `description` | string | Não |
| `icon` | string (emoji) | Não (padrão: `📚`) |
| `color` | string (hex) | Não |
| `order` | number | Não (padrão: `0`) |

---

### 4. Schema de Usuários

`POST /api/users` (🔒 Requer sessão com role `ADMIN`)

```json
{
  "name": "Nome do Usuário",
  "email": "email@exemplo.com",
  "password": "senha_segura_min_6_chars",
  "roles": ["ADMIN"],
  "bio": "Biografia opcional",
  "image": "https://example.com/photo.jpg",
  "emailVerified": true
}
```

| Campo | Tipo | Obrigatório |
| :--- | :--- | :---: |
| `name` | string (min 2) | Sim |
| `email` | string (email) | Sim |
| `password` | string (min 6) | Sim (POST), Não (PATCH) |
| `roles` | string[] | Sim (min 1: `ADMIN`, `EDITOR`, `AUTHOR`) |
| `bio` | string | Não |
| `image` | string (URL) | Não |
| `emailVerified` | boolean | Não |

---

### 5. Schema de Moderação de Comentários

`PATCH /api/admin/comments/[id]`

```json
{
  "status": "APPROVED"
}
```

Valores aceitos: `APPROVED`, `REJECTED`, `SPAM`.

---

## 💻 Exemplo de Automação (Python)

### Criar um artigo completo

```python
import requests

API_KEY = "SUA_ADMIN_API_KEY"
BASE_URL = "https://thecryptostart.com/api"

headers = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json"
}

# 1. Listar autores e categorias para obter IDs
authors = requests.get(f"{BASE_URL}/admin/authors", headers=headers).json()
categories = requests.get(f"{BASE_URL}/admin/categories", headers=headers).json()

author_id = authors["authors"][0]["id"]
category_id = next(c["id"] for c in categories["categories"] if c["slug"] == "bitcoin")

# 2. Criar o artigo
new_article = {
    "title": "As Novas Tendências de DeFi em 2026",
    "slug": "defi-tendencias-2026",
    "excerpt": "Descubra o que esperar do ecossistema DeFi este ano.",
    "content": "# DeFi 2026\n\nO mercado está mudando rapidamente...\n\n## Principais Tendências\n\n1. Real World Assets (RWA)\n2. Restaking\n3. Intent-based Trading",
    "authorId": author_id,
    "categoryId": category_id,
    "status": "DRAFT",
    "difficulty": "INTERMEDIATE",
    "contentType": "ARTICLE",
    "targetKeyword": "tendências defi 2026",
    "secondaryKeywords": ["defi", "rwa", "restaking"],
    "tags": ["defi", "tendências", "2026"],
    "featuredImageUrl": "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=630&fit=crop",
    "featuredImageAlt": "DeFi trends 2026",
    "featuredImageWidth": 1200,
    "featuredImageHeight": 630,
    "schemaType": "ARTICLE",
    "adDensity": "NORMAL"
}

response = requests.post(f"{BASE_URL}/admin/posts", json=new_article, headers=headers)
post = response.json()
print(f"Post criado: {post.get('id')}")

# 3. Publicar o artigo
pub_response = requests.post(
    f"{BASE_URL}/admin/posts/{post['id']}/publish",
    json={"publish": True},
    headers=headers
)
print(f"Publicado: {pub_response.status_code == 200}")
```

### Moderar comentários pendentes

```python
# Listar comentários pendentes
comments = requests.get(
    f"{BASE_URL}/admin/comments?status=PENDING",
    headers=headers
).json()

# Aprovar todos
for comment in comments.get("comments", []):
    requests.patch(
        f"{BASE_URL}/admin/comments/{comment['id']}",
        json={"status": "APPROVED"},
        headers=headers
    )
    print(f"Aprovado: {comment['id']}")
```

---

## 🚦 Troubleshooting

### Diagnóstico Rápido
```bash
# Health check (sem autenticação)
curl https://thecryptostart.com/api/health
# Esperado: { "status": "ok", "database": "connected", "env": { "ADMIN_API_KEY": true, ... } }
```

### Erro 401 — Unauthorized
- Verifique se `ADMIN_API_KEY` está configurado nas variáveis de ambiente do servidor
- Verifique se o header está sendo enviado como `X-API-Key` (case-sensitive)
- Verifique se o valor no header é **exatamente** igual ao configurado no servidor
- **Atenção:** Endpoints `/api/users` e `/api/gsc/analytics` NÃO aceitam API Key — exigem sessão

### Erro 400 — Validation Error
- O sistema usa Zod. Campos obrigatórios ausentes ou formatos inválidos retornam uma lista de erros detalhando qual campo falhou
- Slugs devem conter apenas `a-z`, `0-9` e `-` (sem espaços, maiúsculas ou caracteres especiais)
- `contentType` deve ser exatamente: `ARTICLE`, `GUIDE`, `TUTORIAL`, `GLOSSARY`, `REVIEW` ou `NEWS`

### Erro 500 — Internal Server Error
- Verifique se `DATABASE_URL` está configurado e o banco está acessível
- Use `/api/health` para validar a conexão: `"database": "connected"`

### Honeypot em Comentários
No `POST /api/comments`, o campo `website` deve estar sempre **VAZIO**. Se uma ferramenta de automação preenchê-lo, o comentário será descartado silenciosamente (tratado como bot).

### CORS
Chamadas externas via browser (JS client-side em outros domínios) podem ser bloqueadas. Prefira chamadas **server-to-server**.

---

## 📌 Referência Rápida de Autenticação

| Prefixo de Rota | API Key (`X-API-Key`) | Sessão NextAuth | Público |
| :--- | :---: | :---: | :---: |
| `/api/admin/*` | ✅ | ✅ | ❌ |
| `/api/users` | ❌ | ✅ (ADMIN) | ❌ |
| `/api/gsc/analytics` | ❌ | ✅ | ❌ |
| `/api/comments` | ❌ | ❌ | ✅ |
| `/api/health` | ❌ | ❌ | ✅ |
| `/api/seo/metrics` | ❌ | ❌ | ✅ |
| `/api/ai-optimization/scores` | ❌ | ❌ | ✅ |
