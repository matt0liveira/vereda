# Spec: Formatação de Datas BR + Seletor de Imagem de Capa

**Data:** 2026-03-19
**Status:** Aprovado pelo usuário

---

## 1. Contexto

Dois problemas identificados na aplicação Travel AI:

1. **Datas fora do padrão brasileiro** — `TripCard` exibe datas no formato ISO (`YYYY-MM-DD`). O formato solicitado pelo usuário é `DD-MM-YYYY` com hífens (ex: `19-03-2026`). Decisão deliberada: embora o formato com barras (`DD/MM/YYYY`) seja o padrão ABNT, o usuário optou por hífens para consistência visual com o separador ISO já utilizado internamente.
2. **Sem seleção de imagem de capa** — Atualmente o `TripCard` gera automaticamente uma URL do Unsplash com base no destino, sem que o usuário possa escolher ou subir sua própria foto.

---

## 2. Objetivos

- Corrigir a exibição de datas para o formato `DD-MM-YYYY` em todos os componentes.
- Permitir que o usuário escolha uma imagem de capa para o roteiro, tanto na criação quanto na edição.
- Sugestões de imagem devem ser relevantes ao destino escolhido (via Pexels API).
- Usuário pode alternativamente fazer upload de uma foto própria.
- Ao excluir um roteiro, as imagens associadas no Storage também devem ser removidas.

---

## 3. Formatação de Datas

### Utilitário compartilhado

Criar `frontend/src/utils/date.ts`:

```ts
export function formatDate(isoDate: string): string {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.split('-')
  return `${day}-${month}-${year}`
}
```

### Componentes afetados

| Componente | Situação atual | Após a mudança |
|---|---|---|
| `Preview.tsx` | Usa `formatDate` local inline com `/` | Remove definição local; importa de `utils/date.ts` com `-` |
| `TripCard.tsx` | Exibe ISO direto | Importa e usa `formatDate` de `utils/date.ts` |

---

## 4. Banco de Dados e Storage

### Migration Supabase

Adicionar coluna `cover_image` à tabela `itineraries`:

```sql
ALTER TABLE itineraries ADD COLUMN cover_image text;
```

### Bucket Supabase Storage

- Nome: `itinerary-covers`
- Acesso: público para leitura
- Path dentro do bucket: `{user_id}/{itinerary_id}.{ext}`
- Uma imagem por roteiro (sobrescreve se já existir)

**Detecção de origem da imagem:**
- Imagens do Storage têm URL contendo `/storage/v1/object/public/itinerary-covers/`
- URLs do Pexels contêm `images.pexels.com`
- Object URLs temporárias usam o scheme `blob:`
- Essa distinção é usada tanto no frontend (seção 8.1) quanto no backend (seção 6.3)

---

## 5. Tipos TypeScript

```ts
// types/index.ts
export interface Itinerary {
  // ... campos existentes ...
  cover_image?: string
}

export interface GenerateItineraryInput {
  // ... campos existentes ...
  cover_image?: string
}
```

---

## 6. Backend

### 6.1 Novo router de imagens

Criar `backend/src/routes/images.ts` e registrar em `backend/src/index.ts`:

```ts
// index.ts (acrescentar)
import { imagesRouter } from './routes/images'
app.use('/api/images', imagesRouter)
```

O router usa `authMiddleware` em todas as rotas para evitar uso não autorizado da quota do Pexels.

### 6.2 Endpoint: sugestões de imagem

```
GET /api/images/suggestions?destination=Paris
Authorization: Bearer <jwt>
```

- Chama a API do Pexels com o nome do destino
- Retorna array com até 3 objetos:
  ```ts
  { url: string; photographer: string; pexels_page: string }[]
  ```
- Variável de ambiente: `PEXELS_API_KEY`

**Tratamento de erros:**

| Situação | Comportamento do backend | Comportamento da UI |
|---|---|---|
| Pexels retorna < 3 resultados | Retorna o que tiver (0–2 itens), HTTP 200 | Exibe os itens disponíveis; se 0, mostra "Nenhuma sugestão encontrada para este destino" |
| API key inválida ou quota esgotada | HTTP 502 `{ error: "image_service_unavailable" }` | "Sugestões temporariamente indisponíveis. Você pode subir sua própria foto." |
| Timeout / Pexels inacessível | HTTP 502 `{ error: "image_service_unavailable" }` | Mesmo comportamento acima |

### 6.3 Endpoint: upload de imagem

```
POST /api/images/upload
Authorization: Bearer <jwt>
Content-Type: multipart/form-data

campos: file (image/*), itinerary_id
```

- Faz upload para Supabase Storage no path `{user_id}/{itinerary_id}.{ext}`
- Retorna `{ url: string }` com a URL pública
- Substitui imagem anterior se já existir

**Validações no servidor:**
- MIME type deve ser `image/jpeg`, `image/png`, `image/webp` ou `image/gif`; caso contrário HTTP 400
- Tamanho máximo: 5MB; caso contrário HTTP 413
- `itinerary_id` deve pertencer ao usuário autenticado; caso contrário HTTP 403

### 6.4 Endpoint de exclusão atualizado

```
DELETE /api/itineraries/:id
```

**Fluxo:**
1. Buscar `cover_image` do roteiro
2. Verificar se a URL contém `/storage/v1/object/public/itinerary-covers/` (imagem no Storage)
3. Se sim: tentar deletar o arquivo no bucket
   - Se a deleção do Storage falhar: **logar o erro** e **continuar** — não bloquear a exclusão do roteiro
4. Deletar o registro da tabela `itineraries`
5. Retornar HTTP 204

### 6.5 Endpoint de atualização existente

O `PUT /api/itineraries/:id` existente deve ser atualizado para receber e persistir o campo `cover_image` além de `content`.

---

## 7. Componente `ImagePicker`

**Localização:** `frontend/src/components/UI/ImagePicker.tsx`

### Interface

```ts
interface ImagePickerProps {
  destination: string           // para buscar sugestões relevantes
  value?: string                // URL atual da cover_image
  itineraryId?: string          // necessário para upload; undefined na criação
  onChange: (url: string) => void
  onFileSelected?: (file: File) => void  // chamado na criação quando itineraryId é undefined
}
```

### Comportamento

O componente exibe duas abas:

**Aba "Sugestões"**
- Ao montar ou quando `destination` muda, chama `GET /api/images/suggestions?destination=X`
- Exibe até 3 fotos em grade horizontal com skeleton loader durante a busca
- Foto selecionada recebe borda destacada (token `brand`)
- Crédito do fotógrafo e link para `pexels_page` exibidos abaixo de cada foto (obrigação dos termos do Pexels)
- Em caso de erro (502) ou nenhum resultado: mensagem inline conforme seção 6.2

**Aba "Minha foto"**
- Input `type="file"` com `accept="image/jpeg,image/png,image/webp,image/gif"`
- Validação client-side: tamanho máximo 5MB com mensagem de erro inline
- Preview da imagem selecionada
- **Se `itineraryId` está disponível (edição):** faz upload imediato via `POST /api/images/upload`; chama `onChange` com a URL pública retornada
- **Se `itineraryId` é undefined (criação):** cria `URL.createObjectURL(file)` para preview, chama `onChange` com essa URL temporária e chama `onFileSelected(file)`. O object URL é revogado via `URL.revokeObjectURL()` no `useEffect` cleanup.

---

## 8. Integração nas Páginas

### 8.1 Plan.tsx (criação)

- `ImagePicker` renderizado abaixo do campo de destino
- `destination` vem do estado do formulário; `itineraryId` é `undefined`
- Estado adicional: `coverFile: File | null` e `coverUrl: string`
- `onFileSelected` atualiza `coverFile`; `onChange` atualiza `coverUrl`

**Fluxo após submit bem-sucedido:**
1. `generateItinerary` retorna com `itinerary.id`
2. Determinar `cover_image` final:
   - Se `coverFile` existe: chamar `POST /api/images/upload`
     - Falha: toast de aviso e redirecionar sem imagem
     - Sucesso: usar URL retornada
   - Senão, se `coverUrl` não começa com `blob:` (é URL Pexels): usar `coverUrl` diretamente
3. Se `cover_image` está definido: chamar `PUT /api/itineraries/:id` com `cover_image`
4. Redirecionar para `/preview/:id`

**Limitação conhecida:** Se o usuário selecionar um arquivo local e navegar para fora antes de gerar o roteiro, o arquivo é perdido silenciosamente.

### 8.2 Preview.tsx (edição)

- `ImagePicker` renderizado no topo da página com `value={itinerary.cover_image}`
- `itineraryId` é o `id` da rota
- Upload acontece imediatamente ao selecionar arquivo
- Após `onChange` com nova URL: chama `PUT /api/itineraries/:id` com a nova `cover_image`
- Toast de sucesso ou erro conforme resultado

---

## 9. TripCard e Dashboard

- `TripCard` usa `itinerary.cover_image` se disponível
- Fallback: `PhotoFallback` (gradiente laranja atual) — sem chamada à API do Pexels por card
- A função `getUnsplashUrl` é removida do `TripCard`
- Crédito do fotógrafo Pexels: exibido apenas dentro do componente `ImagePicker` no momento da seleção (conforme termos do Pexels). Não é exibido no `TripCard` ou `Preview` pois o metadata de fotógrafo não é persistido no banco — apenas a URL da imagem é armazenada.

---

## 10. Variáveis de Ambiente

```env
# backend/.env
PEXELS_API_KEY=sua_chave_aqui
```

---

## 11. Fora do Escopo

- Crop/edição de imagem no cliente
- Múltiplas imagens por roteiro
- Cache de sugestões do Pexels
- Persistência de metadata do fotógrafo Pexels no banco
- Recuperação automática de imagens órfãs no Storage
- Persistência da seleção de imagem local entre navegações na criação
