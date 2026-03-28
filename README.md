# Vereda

Plataforma SaaS de planejamento de viagens com IA generativa. Elimina a fadiga de decisão gerando roteiros detalhados, dia a dia, personalizados com base em destino, datas, orçamento, interesses e estilo de viagem.

## Funcionalidades

- Geração de roteiros com Google Gemini (gemini-2.5-flash-lite)
- Edição do roteiro antes de salvar
- Exportação em PDF
- Upload de imagem de capa ou busca via Pexels
- Dashboard com todas as viagens salvas
- Autenticação via Supabase

## Tech Stack

| Camada | Tecnologias |
|--------|-------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router v6 |
| Backend | Node.js, Express, TypeScript |
| Banco de dados | Supabase (PostgreSQL + Storage) |
| IA | Google Gemini API |
| Imagens | Pexels API |
| PDF | PDFKit + Puppeteer |
| Testes | Vitest, React Testing Library, Supertest |

## Estrutura

```
vereda/
├── frontend/       # React SPA (páginas, componentes, serviços)
├── backend/        # API Express (rotas, serviços, middleware)
├── supabase/       # Schemas e migrations
└── api/            # Funções serverless (Vercel)
```

## Como rodar localmente

### Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)
- Chave de API do [Google Gemini](https://aistudio.google.com)
- Chave de API do [Pexels](https://www.pexels.com/api)

### Instalação

```bash
npm install
```

### Variáveis de ambiente

Crie um arquivo `.env` na raiz com base no `.env.example`:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
GEMINI_API_KEY=
PEXELS_API_KEY=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=http://localhost:3001
```

### Desenvolvimento

```bash
# Frontend (http://localhost:5173)
npm run dev:frontend

# Backend (http://localhost:3001)
npm run dev:backend
```

### Testes

```bash
npm run test:frontend
npm run test:backend
```
