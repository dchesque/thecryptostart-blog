# Guia de Automação via API — The Crypto Start Blog

Este guia descreve como integrar ferramentas externas (Python, n8n, Make, Scripts de IA) ao blog para automação de artigos e gestão de dados usando o sistema de **API Key**.

## 🛡️ Autenticação

Todas as chamadas para endpoints administrativos (`/api/admin/*`) devem incluir a chave de API no cabeçalho (header) da requisição.

- **Header**: `X-API-Key`
- **Chave**: `zpS4QZeS0IbCfQzha2H+Fuiq+tiDP346BDfSH/tC48o=`
- **Base URL**: `https://thecryptostart.com` (ou seu domínio de produção)

---

## 🚀 Endpoints da API

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
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
  -H "X-API-Key: zpS4QZeS0IbCfQzha2H+Fuiq+tiDP346BDfSH/tC48o=" \
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
    "X-API-Key": "zpS4QZeS0IbCfQzha2H+Fuiq+tiDP346BDfSH/tC48o=",
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
