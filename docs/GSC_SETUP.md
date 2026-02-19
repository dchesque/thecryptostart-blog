# Google Search Console Integration Setup

Este documento explica como configurar a integração do blog com o Google Search Console (GSC).

## 1. Passo: Criar Projeto no Google Cloud

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2. Crie um novo projeto chamado "TheCryptoStart GSC".
3. No painel "APIs & Services", habilite as seguintes APIs:
   - **Google Search Console API**

## 2. Passo: Criar Conta de Serviço (Service Account)

1. No menu principal, vá em "IAM & Admin" → "Service Accounts".
2. Clique em "Create Service Account".
3. Dê um nome (ex: `gsc-reader`) e clique em "Create and Continue".
4. (Opcional) Selecione o cargo "Viewer" ou deixe em branco se for apenas para o GSC.
5. Após criada, clique na conta de serviço na lista.
6. Vá na aba **"Keys"** → "Add Key" → "Create new key".
7. Escolha o formato **JSON** e o arquivo será baixado.
8. **Importante**: Renomeie e salve este arquivo como `google-service-account-key.json` na raiz do projeto (ou no caminho definido em `.env.local`).

## 3. Passo: Adicionar Conta de Serviço ao GSC

1. Acesse o [Google Search Console](https://search.google.com/search-console).
2. Selecione sua propriedade (site).
3. Vá em "Settings" (Configurações) → "Users and permissions".
4. Clique em "Add User".
5. No campo de e-mail, cole o e-mail da Conta de Serviço que você criou (encontrado no arquivo JSON: `client_email`).
6. Defina a permissão como **"Owner"** ou **"Full"** para que a API consiga ler todos os dados.

## 4. Passo: Configurar Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env.local`:

```bash
# Google Cloud
GOOGLE_CLOUD_PROJECT_ID=o-seu-project-id
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./google-service-account-key.json

# Site
SITE_URL=https://thecryptostart.com
```

## 5. Passo: Verificar Instalação

Abra o dashboard no ambiente de desenvolvimento:
`http://localhost:3000/admin/gsc-dashboard`

Se tudo estiver correto, você verá os dados de impressões, cliques e CTR.
