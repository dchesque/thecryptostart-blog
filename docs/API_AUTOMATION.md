# Guia de Automação via API — The Crypto Start Blog

Este guia descreve como integrar ferramentas externas (Python, n8n, Make, Scripts de IA) ao blog para automação de artigos e gestão de dados usando o sistema de **API Key**.

## 🛡️ Autenticação

Todas as chamadas para endpoints administrativos (`/api/admin/*`) devem incluir a chave de API no cabeçalho (header) da requisição.

- **Header**: `X-API-Key`
- **Chave**: Valor da variável de ambiente `ADMIN_API_KEY` configurada no servidor
- **Base URL**: `https://thecryptostart.com` (ou seu domínio de produção)

> ⚠️ **EasyPanel/Docker**: A variável `ADMIN_API_KEY` deve estar configurada como variável de ambiente de **runtime** no serviço (EasyPanel → Variáveis de Ambiente), não apenas como build argument. No modo `standalone` do Next.js, variáveis server-side precisam estar disponíveis em runtime.

---

## 🚀 Endpoints da API

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| **Diagnóstico** | | |
| `GET` | `/api/health` | Health check público — valida app, banco e variáveis de ambiente. |
| **Posts** | | |
| `GET` | `/api/admin/posts` | Lista todos os posts (paginação via `?page=X&limit=Y`). |
| `POST` | `/api/admin/posts` | **Cria um novo post.** |
| `GET` | `/api/admin/posts/[id]` | Obtém detalhes de um post específico. |
| `PUT` | `/api/admin/posts/[id]` | **Atualiza um post existente.** |
| `DELETE` | `/api/admin/posts/[id]`| Remove um post do banco de dados. |
| `POST` | `/api/admin/posts/[id]/publish`| Altera status (`{"publish": true/false}`). |
| **Autores** | | |
| `GET` | `/api/admin/authors` | Lista autores. |
| `POST` | `/api/admin/authors` | Cria um novo perfil de autor. |
| **Categorias** | | |
| `GET` | `/api/admin/categories`| Lista categorias. |
| `POST` | `/api/admin/categories`| Cria uma nova categoria. |

---

## 📋 Referência de Campos (Schemas)

O sistema utiliza **Zod** para validação. Abaixo estão todos os campos aceitos em cada entidade.

### 1. Posts (Artigos)
Estes campos são usados tanto no `POST` quanto no `PUT`.

| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `title` | string | Sim | Título principal do artigo. |
| `slug` | string | Sim | URL amigável (ex: `meu-artigo`). Único. |
| `excerpt` | string | Sim | Resumo/Destaque para vitrines. |
| `content` | string | Sim | Conteúdo principal em Markdown. |
| `authorId` | string | Sim | ID do Autor (UUID). |
| `categoryId` | string | Sim | ID da Categoria (UUID). |
| `status` | string | Não | `DRAFT` (padrão) ou `PUBLISHED`. |
| `featuredImageUrl`| string | Não | URL da imagem de destaque. |
| `featuredImageAlt` | string | Não | Texto alternativo da imagem. |
| `tags` | string[] | Não | Array de tags (ex: `["crypto", "web3"]`). |
| `difficulty` | string | Não | `BEGINNER`, `INTERMEDIATE`, `ADVANCED`. |
| `contentType` | string | Não | `ARTICLE`, `GUIDE`, `NEWS`, `REVIEW`. |
| `isFeatured` | boolean | Não | Se o post aparece no topo da home (`false`). |
| **SEO Block** | | | |
| `seoTitle` | string | Não | Título específico para Google. |
| `seoDescription` | string | Não | Meta description para Google. |
| `targetKeyword` | string | Não | Palavra-chave principal. |
| `secondaryKeywords`| string[] | Não | Lista de palavras-chave secundárias. |
| `seoNoindex` | boolean | Não | Impedir indexação (`false`). |
| **Rich Snippets** | | | |
| `faq` | JSON | Não | Dados estruturados para FAQ. |
| `howToSteps` | JSON | Não | Dados estruturados para tutoriais. |
| `pros` | string[] | Não | Lista de pontos positivos. |
| `cons` | string[] | Não | Lista de pontos negativos. |
| **Monetização** | | | |
| `adDensity` | string | Não | `NORMAL`, `HIGH`, `LOW`, `NONE`. |
| `monetizationDisabled`| boolean | Não | Desativa Ads no post (`false`). |
| `sponsoredBy` | string | Não | Nome do patrocinador, se houver. |

### 2. Autores (`authors`)
| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `name` | string | Sim | Nome do autor. |
| `slug` | string | Sim | Slug único do autor. |
| `bio` | string | Não | Biografia curta do autor. |
| `avatar` | string | Não | URL da foto do perfil. |
| `socialLinks` | JSON | Não | Objeto com links (ex: `{ "twitter": "..." }`). |

### 3. Categorias (`categories`)
| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `name` | string | Sim | Nome visível da categoria. |
| `slug` | string | Sim | Slug único. |
| `description` | string | Não | Descrição para a página da categoria. |
| `icon` | string | Não | Emoji ou ícone (padrão: `📚`). |
| `color` | string | Não | Cor em Hex (ex: `#ff0000`). |
| `order` | number | Não | Ordem de exibição (inteiro). |

---

## 💻 Exemplos de Conexão

### 1. cURL (Terminal)
```bash
curl -X POST https://thecryptostart.com/api/admin/posts \
  -H "X-API-Key: $ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Post via Automação",
    "slug": "post-via-automacao",
    "excerpt": "Post de teste",
    "content": "Conteúdo...",
    "authorId": "cl...",
    "categoryId": "cl..."
  }'
```

### 2. Python (Requests)
```python
import requests

url = "https://thecryptostart.com/api/admin/posts"
headers = {
    "X-API-Key": "SUA_ADMIN_API_KEY",  # valor de ADMIN_API_KEY no servidor
    "Content-Type": "application/json"
}

payload = {
    "title": "Artigo Automático Python",
    "slug": "artigo-automatico-python",
    "excerpt": "Gerado via script",
    "content": "# Título\nConteúdo aqui.",
    "authorId": "ID_DO_AUTOR",
    "categoryId": "ID_DA_CATEGORIA",
    "status": "DRAFT"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())
```

---

## 🚦 Dicas Importantes
1. **Slug único**: O sistema exige que o `slug` seja único. Se tentar criar um com slug repetido, retornará erro.
2. **Markdown**: O campo `content` suporta Markdown completo, incluindo imagens e links.
3. **Publicação**: Se criar como `DRAFT`, use o endpoint `/publish` enviando `{"publish": true}` para colocar o artigo no ar.

---

## 🔧 Troubleshooting

### Diagnóstico Rápido
```bash
# Verificar se o app está rodando e variáveis configuradas (sem autenticação necessária)
curl https://thecryptostart.com/api/health
# Esperado: { "status": "ok", "database": "connected", "env": { "ADMIN_API_KEY": true, ... } }
```

### Erro 401 — Unauthorized
- Verifique se `ADMIN_API_KEY` está configurado nas variáveis de ambiente do servidor (EasyPanel → Environment Variables)
- Verifique se o header está sendo enviado como `X-API-Key` (case-sensitive)
- Verifique se o valor no header é **exatamente** igual ao configurado no servidor (sem espaços extras)
- Use o endpoint `/api/health` para validar se a variável está definida: `"ADMIN_API_KEY": true`

### Erro 500 — Internal Server Error
- Verifique se `DATABASE_URL` está configurado e o banco está acessível
- Use `/api/health` para validar a conexão com o banco: `"database": "connected"`
- Verifique os logs do container: `docker logs <container_id>`

### Testando a Conexão
```bash
# 1. Health check (sem autenticação)
curl https://thecryptostart.com/api/health

# 2. Testar autenticação com API Key válida
curl -H "X-API-Key: SUA_CHAVE" https://thecryptostart.com/api/admin/posts?limit=1
# Esperado: 200 com lista de posts

# 3. Testar sem API Key (deve retornar 401)
curl https://thecryptostart.com/api/admin/posts?limit=1

# 4. Criar post de teste
curl -X POST \
  -H "X-API-Key: SUA_CHAVE" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","slug":"test-api","excerpt":"Test","content":"# Test","authorId":"UUID","categoryId":"UUID"}' \
  https://thecryptostart.com/api/admin/posts
```
