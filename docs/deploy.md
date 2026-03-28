# Deploy — Vereda

## Stack

| Camada | Tecnologia | Plataforma |
|---|---|---|
| Frontend | React + Vite + Tailwind | Vercel (static) |
| Backend | Express + TypeScript | Vercel (serverless functions via `api/index.ts`) |
| Banco + Auth | Supabase | Supabase cloud |
| IA | Google Gemini API | — |
| Imagens | Pexels API | — |

O frontend e o backend rodam na mesma origem no Vercel. Nao e necessario servidor separado.

---

## 1. Aplicar migrations no Supabase

Execute os arquivos abaixo em ordem no **SQL Editor** do Supabase Dashboard (ou via `npx supabase db push`):

1. `supabase/migrations/20260316224805_create_itineraries_table.sql`
2. `supabase/migrations/20260323000000_add_cover_image_and_storage.sql`
3. `supabase/migrations/20260323000001_add_trip_details.sql`
4. `supabase/migrations/20260323000002_add_checkin_checkout.sql`
5. `supabase/migrations/20260323000003_add_origin_notes.sql`

---

## 2. Configurar Storage no Supabase

Se a migration nao criar o bucket automaticamente:

1. Supabase Dashboard → **Storage** → **New bucket**
2. Nome: `covers`
3. Marcar como **Public**

---

## 3. Deploy no Vercel

### 3.1 Instalar o Vercel CLI

```bash
npm i -g vercel
```

### 3.2 Login

```bash
vercel login
```

### 3.3 Primeiro deploy (da raiz do projeto)

```bash
cd /caminho/para/vereda
vercel
```

Respostas esperadas:
- **Set up and deploy?** → Y
- **Which scope?** → sua conta
- **Link to existing project?** → N
- **Project name?** → `vereda`
- **Directory?** → `.`
- Override settings? → N (ja esta no `vercel.json`)

### 3.4 Configurar variaveis de ambiente

Vercel Dashboard → seu projeto → **Settings** → **Environment Variables**

| Variavel | Valor | Onde pegar |
|---|---|---|
| `SUPABASE_URL` | URL do projeto | Supabase → Project Settings → API |
| `SUPABASE_ANON_KEY` | anon/public key | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | service role key | Supabase → Project Settings → API |
| `GEMINI_API_KEY` | chave Gemini | Google AI Studio |
| `PEXELS_API_KEY` | chave Pexels | pexels.com/api |
| `VITE_SUPABASE_URL` | mesmo que `SUPABASE_URL` | — |
| `VITE_SUPABASE_ANON_KEY` | mesmo que `SUPABASE_ANON_KEY` | — |
| `NODE_ENV` | `production` | — |

> `VITE_API_URL` **nao deve ser definido**. O `api.ts` ja usa fallback para string vazia (`''`), o que faz todas as chamadas usarem caminhos relativos (`/api/...`) — comportamento correto quando frontend e backend estao na mesma origem.

### 3.5 Deploy de producao

```bash
vercel --prod
```

Ou pelo Dashboard → **Deployments** → **Redeploy**.

---

## 4. Verificar o deploy

Apos o deploy, acesse:

```
https://<seu-projeto>.vercel.app/api/health
```

Resposta esperada:

```json
{ "status": "ok" }
```

---

## Checklist

- [ ] Migrations aplicadas no Supabase
- [ ] Bucket `covers` criado e publico
- [ ] Variaveis de ambiente configuradas no Vercel
- [ ] `VITE_API_URL` ausente (nao configurado)
- [ ] Deploy realizado com `vercel --prod`
- [ ] `/api/health` retorna `{ "status": "ok" }`
