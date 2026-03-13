# Travel AI — Design Document

**Data:** 2026-03-12
**Status:** Aprovado

---

## 1. Visão Geral

Plataforma SaaS para planejamento de viagens com IA generativa. O usuário preenche preferências (destino, datas, orçamento, interesses) e recebe um roteiro personalizado dia a dia, editável e exportável como PDF.

---

## 2. Stack Tecnológico

| Camada | Tecnologia |
|---|---|
| Frontend | React + TypeScript + Tailwind CSS + Vite |
| Backend | Node.js + Express (adaptado para Vercel Serverless Functions) |
| Auth + DB | Supabase (Auth + PostgreSQL) |
| IA | Google Gemini API (tier gratuito — `gemini-1.5-flash`) |
| PDF | `puppeteer-core` + `@sparticuz/chromium` (compatível com Vercel) |
| Deploy | Vercel (frontend + backend juntos) |

---

## 3. Estrutura do Projeto (Monorepo)

```
travel-ai/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/         # Navbar, Footer
│   │   │   ├── Auth/           # LoginForm, RegisterForm
│   │   │   ├── Plan/           # TravelForm, BudgetSelector, InterestsPicker
│   │   │   ├── Preview/        # ItineraryDay, ActivityCard, EditableText
│   │   │   ├── Dashboard/      # TripCard, EmptyState
│   │   │   └── UI/             # Button, Input, Spinner, Badge, Toast
│   │   ├── pages/
│   │   │   ├── Landing.tsx
│   │   │   ├── Auth.tsx
│   │   │   ├── Plan.tsx
│   │   │   ├── Preview.tsx
│   │   │   └── Dashboard.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useItinerary.ts
│   │   ├── services/
│   │   │   └── api.ts
│   │   └── types/
│   │       └── index.ts
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── itineraries.ts
│   │   │   └── pdf.ts
│   │   ├── services/
│   │   │   ├── gemini.ts
│   │   │   ├── supabase.ts
│   │   │   └── pdf.ts
│   │   ├── middlewares/
│   │   │   └── authMiddleware.ts
│   │   └── types/
│   │       └── index.ts
│   └── index.ts
├── docs/
│   └── superpowers/specs/
└── PRD.md
```

---

## 4. Banco de Dados (Supabase/PostgreSQL)

```sql
CREATE TABLE itineraries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users ON DELETE CASCADE,
  title       TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  budget      TEXT NOT NULL CHECK (budget IN ('economico', 'moderado', 'luxo')),
  interests   TEXT[] NOT NULL DEFAULT '{}',
  content     JSONB NOT NULL DEFAULT '{}',
  status      TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'saved', 'error')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access own itineraries"
  ON itineraries FOR ALL
  USING (auth.uid() = user_id);
```

### Schema do campo `content` (JSONB)

```json
{
  "days": [
    {
      "day": 1,
      "date": "2026-06-01",
      "activities": [
        {
          "id": "uuid-v4",
          "time": "09:00",
          "title": "Visita ao Museu do Louvre",
          "description": "Um dos maiores museus do mundo...",
          "location": {
            "name": "Musée du Louvre",
            "address": "Rue de Rivoli, 75001 Paris, França",
            "mapsUrl": "https://maps.google.com/?q=Musée+du+Louvre"
          }
        }
      ]
    }
  ]
}
```

Cada `activity.id` é gerado pelo backend antes de salvar, permitindo edições granulares por atividade no frontend.

---

## 5. Autenticação

- O Supabase Auth gerencia cadastro e login (email/senha)
- O frontend usa o SDK `@supabase/supabase-js` para obter o JWT do usuário
- Todas as chamadas autenticadas enviam o JWT no header: `Authorization: Bearer <token>`
- O backend usa a **anon key** do Supabase + o JWT do usuário para autenticar requisições, respeitando o RLS
- O `authMiddleware.ts` extrai o JWT, chama `supabase.auth.getUser(token)` e injeta o `user` no `req`
- A `SUPABASE_SERVICE_ROLE_KEY` é usada **somente** para operações administrativas que precisam bypassar o RLS (ex: limpeza de dados em scripts) — nunca nas rotas de usuário

```typescript
// authMiddleware.ts
const { data: { user }, error } = await supabase.auth.getUser(token)
if (error || !user) return res.status(401).json({ error: 'Unauthorized' })
req.user = user
```

---

## 6. Rotas da API

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| POST | `/api/itineraries/generate` | Gera roteiro via Gemini e salva como draft | Sim |
| GET | `/api/itineraries` | Lista roteiros salvos do usuário | Sim |
| GET | `/api/itineraries/:id` | Busca roteiro por ID | Sim |
| PUT | `/api/itineraries/:id` | Atualiza `content` (edição de atividade) | Sim |
| POST | `/api/itineraries/:id/save` | Muda status de `draft` para `saved` | Sim |
| DELETE | `/api/itineraries/:id` | Exclui roteiro | Sim |
| GET | `/api/itineraries/:id/pdf` | Gera e retorna PDF do roteiro | Sim |

---

## 7. Prompt Engineering (Gemini)

O backend monta o seguinte prompt estruturado para o Gemini:

```
Você é um especialista em planejamento de viagens. Gere um roteiro detalhado em JSON válido para a seguinte viagem:

- Destino: {destination}
- Data de início: {start_date}
- Data de fim: {end_date}
- Orçamento: {budget} (econômico = hostels e transporte público; moderado = hotéis 3★ e táxi; luxo = hotéis 5★ e transfer)
- Interesses: {interests.join(', ')}

Responda APENAS com um JSON válido no seguinte formato, sem markdown, sem explicações:
{
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "activities": [
        {
          "time": "HH:MM",
          "title": "Nome da atividade",
          "description": "Descrição detalhada em 2-3 frases",
          "location": {
            "name": "Nome do local",
            "address": "Endereço completo",
            "mapsUrl": "https://maps.google.com/?q=Nome+do+local"
          }
        }
      ]
    }
  ]
}

Inclua de 3 a 5 atividades por dia. Respeite o orçamento e os interesses informados.
```

O backend valida a resposta com `JSON.parse()`. Se inválida, retorna erro 502 com mensagem amigável ao usuário.

---

## 8. Fluxo de Dados

### Geração de Roteiro
1. Usuário preenche formulário em `/plan`
2. Frontend exibe spinner e envia `POST /api/itineraries/generate` com JWT
3. `authMiddleware` valida JWT
4. `gemini.ts` chama a API com timeout de 25 segundos (ver seção de constraints)
5. Backend valida o JSON retornado, adiciona `id` (uuid) a cada atividade
6. Salva como `status: 'draft'` no Supabase e retorna o objeto ao frontend
7. Frontend redireciona para `/preview/:id`
8. Em caso de erro/timeout: salva `status: 'error'`, retorna 502, frontend exibe toast de erro

### Edição e Salvamento
1. Usuário edita campos de texto (`title`, `description`) de uma `activity` no Preview
2. Edições são otimistas no frontend (state local atualizado imediatamente)
3. Após 500ms de inatividade, frontend envia `PUT /api/itineraries/:id` com o `content` completo atualizado
4. Ao clicar em "Salvar viagem", `POST /api/itineraries/:id/save` muda status para `saved`
5. Roteiro aparece no Dashboard

### Exportação PDF
1. Frontend chama `GET /api/itineraries/:id/pdf`
2. Backend busca o roteiro no Supabase
3. `pdf.ts` renderiza template HTML inline com os dados do roteiro
4. Puppeteer-core + @sparticuz/chromium gera o PDF
5. Retorna o PDF como stream com `Content-Type: application/pdf`

### PDF — Conteúdo e Layout
O PDF contém:
- Cabeçalho: título da viagem, destino, datas, orçamento
- Para cada dia: data formatada, lista de atividades com horário, título, descrição e endereço do local
- Rodapé: "Gerado pelo Travel AI"
- "Location references" = endereço textual + URL do Google Maps impressa (não hyperlink, para compatibilidade offline)

---

## 9. Páginas e Roteamento

| Rota | Componente | Acesso |
|---|---|---|
| `/` | Landing | Público |
| `/auth` | Auth (login/cadastro com tabs) | Público (redireciona para `/dashboard` se autenticado) |
| `/plan` | Plan (formulário) | Privado |
| `/preview/:id` | Preview (roteiro + edição) | Privado |
| `/dashboard` | Dashboard (lista de viagens) | Privado |

`PrivateRoute` redireciona para `/auth` se o usuário não estiver autenticado.

### Campos do formulário `/plan`

| Campo | Tipo | Valores |
|---|---|---|
| Destino | Text input | Livre |
| Data de início | Date picker | — |
| Data de fim | Date picker | — |
| Orçamento | Radio/Select | `economico`, `moderado`, `luxo` |
| Interesses | Checkbox múltiplo | `cultura`, `gastronomia`, `aventura`, `kids-friendly`, `natureza`, `compras` |

### Granularidade de edição no Preview

O usuário pode editar:
- `activity.title` — campo de texto inline
- `activity.description` — textarea inline
- Excluir uma atividade (remove do array `content.days[n].activities`)

Não é possível editar horário, localização ou adicionar novas atividades na v1 (simplicidade).

---

## 10. Design (UX/UI)

- **Paleta:** Azul cerúleo (`#2563EB`), Branco off-white (`#F8FAFC`), Coral (`#F97316`)
- **Tipografia:** Inter (Google Fonts)
- **Mobile-first:** Tailwind CSS com breakpoints `sm`/`md`/`lg`
- **Loading state:** Spinner animado + mensagem "Gerando seu roteiro..." controlado por estado `isLoading` no React durante chamada à API
- **Feedback visual:** Toast notifications (biblioteca `react-hot-toast`) para erros e sucesso
- **Estado de erro na geração:** Mensagem inline com botão "Tentar novamente"

---

## 11. Constraints e Limitações Conhecidas

### Vercel Function Timeout
- **Problema:** Vercel free tier tem timeout padrão de **10 segundos** por Serverless Function. A geração via Gemini pode levar mais tempo.
- **Solução para v1:** Usar o modelo `gemini-1.5-flash` (mais rápido) com prompt otimizado para resposta < 8 segundos. Monitorar tempo médio após deploy. Se necessário, migrar para Vercel Pro (60s timeout) ou implementar polling assíncrono.
- **Frontend:** O spinner exibe aviso após 8 segundos: "Ainda processando..."

### Puppeteer no Vercel
- **Problema:** O pacote `puppeteer` padrão excede o limite de 50 MB das Vercel Functions.
- **Solução:** Usar `puppeteer-core` + `@sparticuz/chromium` (Chromium comprimido, ~40 MB), compatível com o ambiente serverless da Vercel.

### Gemini Free Tier Quotas
- Limite: 15 RPM (requisições por minuto) e 1 milhão de tokens/dia no tier gratuito.
- Para v1 (validação), esse limite é suficiente. Não é implementado rate limiting no backend na v1, mas um erro 429 do Gemini é capturado e retornado como mensagem amigável ao usuário.

---

## 12. Estratégia de Testes

### Frontend — Vitest + React Testing Library
- `useAuth` — login, logout, estado de autenticação
- `TravelForm` — validação de campos obrigatórios, submissão
- `ItineraryDay` — renderização de atividades, edição inline
- `PrivateRoute` — redirecionamento sem autenticação

### Backend — Vitest + Supertest
- `POST /api/itineraries/generate` — JWT válido e inválido, mock do Gemini
- `PUT /api/itineraries/:id` — atualização de conteúdo
- `POST /api/itineraries/:id/save` — mudança de status
- `GET /api/itineraries/:id/pdf` — retorno de stream PDF
- `authMiddleware` — token ausente, expirado, inválido

### Integração
- Fluxo completo: gerar roteiro → editar → salvar → listar no dashboard
- RLS: usuário A não consegue acessar/modificar roteiros do usuário B

### E2E — Playwright (pós-validação)
- Fluxo completo: cadastro → gerar roteiro → editar → salvar → exportar PDF

---

## 13. Deploy

Tudo hospedado no **Vercel** (zero custo para validação):

- Frontend: React buildado pela CDN Vercel
- Backend: Express adaptado como Vercel Serverless Functions em `/api`
- DB + Auth: Supabase free tier
- IA: Google Gemini free tier (`gemini-1.5-flash`)

### Variáveis de Ambiente (Vercel)
```
SUPABASE_URL
SUPABASE_ANON_KEY
GEMINI_API_KEY
```

---

## 14. Critérios de Aceite

- Roteiros só podem ser criados por usuários autenticados (`PrivateRoute` + `authMiddleware`)
- Preview permite edição inline (title, description) antes do salvamento definitivo
- PDF contém cronograma completo com endereços e URLs do Google Maps
- Geração da IA exibe feedback visual (spinner) durante o processamento
- RLS garante que cada usuário só acessa seus próprios roteiros (via anon key + JWT)
- Erros de geração (timeout, resposta inválida, quota) são comunicados ao usuário com toast
