# ML OAuth Dashboard — Guia de Deploy

## O que este proyecto faz
- Login con Mercado Livre (OAuth 2.0)
- Obtém access_token automaticamente
- Refresh automático do token antes de expirar
- Mostra seus dados: nome, email, reputação, vendas, status

---

## PASSO 1 — Criar conta no Vercel (grátis)
1. Acesse https://vercel.com
2. Cadastre-se com GitHub (recomendado) ou e-mail
3. Plano gratuito é suficiente

---

## PASSO 2 — Subir o projeto

### Opção A: Via GitHub (recomendado)
1. Crie um repositório no GitHub
2. Suba esta pasta toda para o repositório
3. No Vercel: "New Project" → importe o repositório
4. Clique em Deploy (sem mudar nada)

### Opção B: Via CLI
```bash
npm i -g vercel
cd ml-oauth
vercel
```

---

## PASSO 3 — Registrar app no Mercado Livre
1. Acesse: https://developers.mercadolivre.com.br/devcenter
2. Clique em "Criar aplicação"
3. Preencha:
   - Nome: qualquer nome
   - Redirect URI: `https://SEU-PROJETO.vercel.app/api/callback`
   - Escopos: read, write (conforme necessidade)
4. Salve e copie o **Client ID** e **Client Secret**

---

## PASSO 4 — Configurar variáveis de ambiente no Vercel
No painel do Vercel → seu projeto → Settings → Environment Variables:

| Nome               | Valor                                          |
|--------------------|------------------------------------------------|
| ML_CLIENT_ID       | (seu Client ID do passo 3)                    |
| ML_CLIENT_SECRET   | (seu Client Secret do passo 3)                |
| ML_REDIRECT_URI    | https://SEU-PROJETO.vercel.app/api/callback   |

Após adicionar → clique em **Redeploy**.

---

## PASSO 5 — Testar
1. Acesse `https://SEU-PROJETO.vercel.app`
2. Clique em "Entrar com Mercado Livre"
3. Autorize o acesso
4. Seu dashboard aparece com seus dados ✅

---

## Estrutura do projeto
```
ml-oauth/
├── api/
│   ├── login.js      → redireciona para ML
│   ├── callback.js   → recebe o code e troca pelo token
│   └── refresh.js    → renova o token expirado
├── public/
│   └── index.html    → frontend completo
└── vercel.json       → configuração do Vercel
```

---

## Endpoints disponíveis
- `GET /api/login` → inicia o OAuth
- `GET /api/callback?code=...` → troca code por token
- `POST /api/refresh` body: `{"refresh_token":"..."}` → renova token

---

## Dúvidas comuns
**"redirect_uri não bate"** → certifique-se que a URI no Vercel e no portal ML são idênticas (sem barra no final)

**Token expira em 6 horas** → o refresh automático já está implementado, funciona em background

**Erro 401** → o app tenta refresh automaticamente, se falhar faz logout
