# Date Format BR + Image Picker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Standardize date display to DD-MM-YYYY and add a Pexels-powered cover image picker to itineraries.

**Architecture:** Two independent subsystems — (1) a shared date util consumed by TripCard and Preview, and (2) a full image pipeline: Pexels suggestions + direct upload via a new `ImagePicker` component integrated into Plan (creation) and Preview (editing), backed by a new `/api/images` Express router and Supabase Storage bucket.

**Tech Stack:** React + TypeScript (frontend), Express + TypeScript (backend), Supabase Storage, Pexels API, `multer` for multipart parsing.

---

## File Map

### Created
- `frontend/src/utils/date.ts` — shared `formatDate(isoDate)` → `DD-MM-YYYY`
- `frontend/src/test/utils/date.test.ts` — unit tests for `formatDate`
- `frontend/src/components/UI/ImagePicker.tsx` — Suggestions + upload tabs component
- `backend/src/routes/images.ts` — GET suggestions, POST upload
- `backend/src/test/routes/images.test.ts` — route tests

### Modified
- `frontend/src/types/index.ts` — add `cover_image?: string` to `Itinerary` and `GenerateItineraryInput`
- `frontend/src/services/api.ts` — add `getImageSuggestions`, `uploadCoverImage`, update `updateItinerary` signature
- `frontend/src/hooks/useItinerary.ts` — update two `updateItinerary` call sites to new signature
- `frontend/src/pages/Preview.tsx` — use shared `formatDate`, integrate `ImagePicker`
- `frontend/src/pages/Plan.tsx` — integrate `ImagePicker`, post-submit upload flow
- `frontend/src/components/Dashboard/TripCard.tsx` — use `formatDate`, use `cover_image`, remove `getUnsplashUrl`
- `backend/src/index.ts` — register `imagesRouter`
- `backend/src/routes/itineraries.ts` — DELETE cleans Storage; PUT accepts `cover_image`
- `backend/src/types/index.ts` — add `cover_image?: string` to `Itinerary`

### Database (manual step)
- Run migration: `ALTER TABLE itineraries ADD COLUMN cover_image text;`
- Create Supabase Storage bucket `itinerary-covers` (public read)

---

## Task 1: Shared Date Utility

**Files:**
- Create: `frontend/src/utils/date.ts`
- Create: `frontend/src/test/utils/date.test.ts`
- Modify: `frontend/src/pages/Preview.tsx`
- Modify: `frontend/src/components/Dashboard/TripCard.tsx`

- [ ] **Step 1: Write failing test `frontend/src/test/utils/date.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { formatDate } from '../../utils/date'

describe('formatDate', () => {
  it('converts ISO to DD-MM-YYYY', () => {
    expect(formatDate('2026-03-19')).toBe('19-03-2026')
  })
  it('returns empty string for empty input', () => {
    expect(formatDate('')).toBe('')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd frontend && npx vitest run src/test/utils/date.test.ts
```

Expected: FAIL — `../../utils/date` module not found.

- [ ] **Step 3: Create `frontend/src/utils/date.ts`**

```ts
export function formatDate(isoDate: string): string {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.split('-')
  return `${day}-${month}-${year}`
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd frontend && npx vitest run src/test/utils/date.test.ts
```

Expected: 2 tests pass.

- [ ] **Step 5: Update `frontend/src/pages/Preview.tsx` — replace local `formatDate`**

Remove lines 17-21 (the local `formatDate` function) and add to the existing import from `'react-router-dom'` line area — add a new import line at the top:

```ts
import { formatDate } from '../utils/date'
```

The usage on line 66 (`formatDate(itinerary.start_date)` and `formatDate(itinerary.end_date)`) stays unchanged — dates will now display as `DD-MM-YYYY` instead of `DD/MM/YYYY`.

- [ ] **Step 6: Update `frontend/src/components/Dashboard/TripCard.tsx` — use `formatDate`**

Add import after existing imports:
```ts
import { formatDate } from '../../utils/date'
```

Replace line 84 (list view date display):
```tsx
// Before:
{itinerary.start_date} – {itinerary.end_date}
// After:
{formatDate(itinerary.start_date)} – {formatDate(itinerary.end_date)}
```

Replace line 142 (grid view date badge):
```tsx
// Before:
{itinerary.start_date} – {itinerary.end_date}
// After:
{formatDate(itinerary.start_date)} – {formatDate(itinerary.end_date)}
```

- [ ] **Step 7: Commit**

```bash
cd c:/travel-ai
git add frontend/src/utils/date.ts frontend/src/test/utils/date.test.ts frontend/src/pages/Preview.tsx frontend/src/components/Dashboard/TripCard.tsx
git commit -m "feat: add shared formatDate util (DD-MM-YYYY) and apply to TripCard and Preview"
```

---

## Task 2: TypeScript Types — `cover_image`

**Files:**
- Modify: `frontend/src/types/index.ts`
- Modify: `backend/src/types/index.ts`

The current `frontend/src/types/index.ts` has `Itinerary` (line 26-38) and `GenerateItineraryInput` (line 40-47) with no `cover_image` field.

The current `backend/src/types/index.ts` has `Itinerary` (line 26-38) with no `cover_image` field.

- [ ] **Step 1: Update `frontend/src/types/index.ts`**

Add `cover_image?: string` to `Itinerary` after `created_at`:

```ts
export interface Itinerary {
  id: string
  user_id: string
  title: string
  destination: string
  start_date: string
  end_date: string
  budget: Budget
  interests: Interest[]
  content: ItineraryContent
  status: 'draft' | 'saved' | 'error'
  created_at: string
  cover_image?: string
}
```

Add `cover_image?: string` to `GenerateItineraryInput` after `interests`:

```ts
export interface GenerateItineraryInput {
  title: string
  destination: string
  start_date: string
  end_date: string
  budget: Budget
  interests: Interest[]
  cover_image?: string
}
```

- [ ] **Step 2: Update `backend/src/types/index.ts`**

Read the file first, then add `cover_image?: string` to the `Itinerary` interface after the `status` field:

```ts
  status: 'draft' | 'saved' | 'error'
  created_at: string
  cover_image?: string
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/types/index.ts backend/src/types/index.ts
git commit -m "feat: add cover_image field to Itinerary types"
```

---

## Task 3: Database Migration + Storage Bucket

- [ ] **Step 1: Run migration in Supabase SQL editor**

```sql
ALTER TABLE itineraries ADD COLUMN cover_image text;
```

- [ ] **Step 2: Create Storage bucket**

In Supabase dashboard → Storage → New bucket:
- Name: `itinerary-covers`
- Public: ✅ (public read)

- [ ] **Step 3: Add bucket policies for authenticated upload/delete**

In the bucket policies, add:
```sql
-- INSERT policy (authenticated users can upload)
CREATE POLICY "Authenticated users can upload covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'itinerary-covers');

-- DELETE policy (users can only delete their own files)
CREATE POLICY "Users can delete own covers"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'itinerary-covers' AND (storage.foldername(name))[1] = auth.uid()::text);
```

> Note: These are manual steps in Supabase dashboard. No code change needed.

---

## Task 4: Backend — `images` Router

**Files:**
- Create: `backend/src/routes/images.ts`
- Create: `backend/src/test/routes/images.test.ts`
- Modify: `backend/src/index.ts`

Install `multer` if not present:
```bash
cd backend && npm install multer @types/multer
```

- [ ] **Step 1: Write failing tests `backend/src/test/routes/images.test.ts`**

```ts
import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'
import { app } from '../../index'

vi.mock('../../middlewares/authMiddleware', () => ({
  authMiddleware: (req: any, _res: any, next: any) => {
    req.user = { id: 'user-123' }
    next()
  },
}))

describe('GET /api/images/suggestions', () => {
  it('returns 400 when destination is missing', async () => {
    const res = await request(app)
      .get('/api/images/suggestions')
      .set('Authorization', 'Bearer test')
    expect(res.status).toBe(400)
  })
})

describe('POST /api/images/upload', () => {
  it('returns 400 when no file is attached', async () => {
    const res = await request(app)
      .post('/api/images/upload')
      .set('Authorization', 'Bearer test')
      .field('itinerary_id', 'some-id')
    expect(res.status).toBe(400)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd backend && npx vitest run src/test/routes/images.test.ts
```

Expected: FAIL — routes do not exist yet.

- [ ] **Step 3: Create `backend/src/routes/images.ts`**

```ts
import { Router, Response } from 'express'
import multer from 'multer'
import { supabase } from '../services/supabase'
import { authMiddleware } from '../middlewares/authMiddleware'
import { AuthRequest } from '../types'

export const imagesRouter = Router()
imagesRouter.use(authMiddleware)

const PEXELS_API_KEY = process.env.PEXELS_API_KEY || ''
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE_BYTES = 5 * 1024 * 1024

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('invalid_mime'))
    }
  },
})

// GET /api/images/suggestions?destination=Paris
imagesRouter.get('/suggestions', async (req: AuthRequest, res: Response) => {
  const { destination } = req.query
  if (!destination || typeof destination !== 'string') {
    return res.status(400).json({ error: 'destination is required' })
  }

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(destination)}&per_page=3`,
      { headers: { Authorization: PEXELS_API_KEY }, signal: AbortSignal.timeout(5000) }
    )

    if (!response.ok) {
      return res.status(502).json({ error: 'image_service_unavailable' })
    }

    const data = await response.json() as {
      photos: Array<{ src: { large: string }; photographer: string; url: string }>
    }
    const results = (data.photos || []).slice(0, 3).map(p => ({
      url: p.src.large,
      photographer: p.photographer,
      pexels_page: p.url,
    }))
    return res.json(results)
  } catch {
    return res.status(502).json({ error: 'image_service_unavailable' })
  }
})

// POST /api/images/upload
imagesRouter.post('/upload', upload.single('file'), async (req: AuthRequest, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'file is required' })
  const { itinerary_id } = req.body
  if (!itinerary_id) return res.status(400).json({ error: 'itinerary_id is required' })

  // Verify itinerary belongs to user
  const { data: itinerary, error: fetchError } = await supabase
    .from('itineraries')
    .select('id')
    .eq('id', itinerary_id)
    .eq('user_id', req.user!.id)
    .single()

  if (fetchError || !itinerary) return res.status(403).json({ error: 'Forbidden' })

  const ext = req.file.mimetype.split('/')[1]
  const path = `${req.user!.id}/${itinerary_id}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('itinerary-covers')
    .upload(path, req.file.buffer, { contentType: req.file.mimetype, upsert: true })

  if (uploadError) return res.status(500).json({ error: 'Upload failed' })

  const { data: urlData } = supabase.storage.from('itinerary-covers').getPublicUrl(path)
  return res.json({ url: urlData.publicUrl })
})

// Multer error handler
imagesRouter.use((err: Error, _req: AuthRequest, res: Response, _next: any) => {
  if (err.message === 'invalid_mime') return res.status(400).json({ error: 'Invalid file type' })
  if (err.message === 'File too large') return res.status(413).json({ error: 'File too large (max 5MB)' })
  return res.status(500).json({ error: 'Upload error' })
})
```

- [ ] **Step 4: Register router in `backend/src/index.ts`**

Add import after existing imports:
```ts
import { imagesRouter } from './routes/images'
```

Add route registration after the existing `app.use` lines (before the health check):
```ts
app.use('/api/images', imagesRouter)
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd backend && npx vitest run src/test/routes/images.test.ts
```

Expected: both tests pass (400 for missing destination, 400 for missing file).

- [ ] **Step 6: Commit**

```bash
git add backend/src/routes/images.ts backend/src/test/routes/images.test.ts backend/src/index.ts backend/package.json backend/package-lock.json
git commit -m "feat: add /api/images router with Pexels suggestions and Supabase Storage upload"
```

---

## Task 5: Backend — Update `itineraries` Routes

**Files:**
- Modify: `backend/src/routes/itineraries.ts`
- Modify: `backend/src/test/routes/itineraries.test.ts`

### 5a — Write failing tests first

- [ ] **Step 1: Read `backend/src/test/routes/itineraries.test.ts` to understand existing test structure**

Then add these two tests to the existing test file:

```ts
// Add to existing PUT /:id describe block (or create one):
it('PUT /:id persists cover_image', async () => {
  // mock supabase to return updated data
  // ... follow the existing mock pattern in the file
  const res = await request(app)
    .put('/api/itineraries/test-id')
    .set('Authorization', 'Bearer test')
    .send({ cover_image: 'https://example.com/img.jpg' })
  expect(res.status).toBe(200)
})

// Add to existing DELETE /:id describe block (or create one):
it('DELETE /:id returns 204', async () => {
  const res = await request(app)
    .delete('/api/itineraries/test-id')
    .set('Authorization', 'Bearer test')
  expect(res.status).toBe(204)
})
```

> Note: Read the existing test file first to follow the mocking pattern already in use (Supabase is likely mocked via `vi.mock`).

- [ ] **Step 2: Run tests to confirm they fail or have gaps**

```bash
cd backend && npx vitest run src/test/routes/itineraries.test.ts
```

Note which tests fail.

### 5b — Implement

- [ ] **Step 3: Update PUT handler to accept `cover_image`**

Replace the existing PUT handler (lines 92-105 in `backend/src/routes/itineraries.ts`):

```ts
// PUT /api/itineraries/:id
itinerariesRouter.put('/:id', async (req: AuthRequest, res: Response) => {
  const { content, cover_image } = req.body

  const updateData: Record<string, unknown> = {}
  if (content !== undefined) updateData.content = content
  if (cover_image !== undefined) updateData.cover_image = cover_image

  const { data, error } = await supabase
    .from('itineraries')
    .update(updateData)
    .eq('id', req.params.id)
    .eq('user_id', req.user!.id)
    .select()
    .single()

  if (error || !data) return res.status(404).json({ error: 'Not found' })
  return res.json(data)
})
```

- [ ] **Step 4: Update DELETE handler to clean up Storage**

Replace the existing DELETE handler (lines 122-131):

```ts
// DELETE /api/itineraries/:id
itinerariesRouter.delete('/:id', async (req: AuthRequest, res: Response) => {
  // Fetch cover_image before deleting
  const { data: existing } = await supabase
    .from('itineraries')
    .select('cover_image')
    .eq('id', req.params.id)
    .eq('user_id', req.user!.id)
    .single()

  // Delete Storage file if it came from our bucket
  if (existing?.cover_image?.includes('/storage/v1/object/public/itinerary-covers/')) {
    const storagePath = existing.cover_image.split('/storage/v1/object/public/itinerary-covers/')[1]
    const { error: storageError } = await supabase.storage
      .from('itinerary-covers')
      .remove([storagePath])
    if (storageError) console.error('[delete] Storage cleanup error:', storageError)
  }

  const { error } = await supabase
    .from('itineraries')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user!.id)

  if (error) return res.status(404).json({ error: 'Not found' })
  return res.status(204).send()
})
```

- [ ] **Step 5: Run all backend tests to verify everything passes**

```bash
cd backend && npx vitest run
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add backend/src/routes/itineraries.ts backend/src/test/routes/itineraries.test.ts
git commit -m "feat: PUT accepts cover_image; DELETE cleans Supabase Storage"
```

---

## Task 6: Frontend API Service + `useItinerary` Hook Fix

**Files:**
- Modify: `frontend/src/services/api.ts`
- Modify: `frontend/src/hooks/useItinerary.ts`

**Context:** The current `useItinerary.ts` calls `updateItinerary(id, newContent)` at lines 39 and 55. After changing the `updateItinerary` signature to accept `{ content?, cover_image? }`, both call sites must be updated in the same commit to avoid a broken state.

- [ ] **Step 1: Add new API helpers and update `updateItinerary` signature in `frontend/src/services/api.ts`**

Add a raw auth headers helper (after the existing `getAuthHeaders`):
```ts
async function getAuthHeadersRaw(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')
  return { Authorization: `Bearer ${session.access_token}` }
}
```

Add new exported functions (append after `downloadPdf`):
```ts
export async function getImageSuggestions(destination: string): Promise<
  { url: string; photographer: string; pexels_page: string }[]
> {
  const headers = await getAuthHeaders()
  const res = await fetch(
    `${API_URL}/api/images/suggestions?destination=${encodeURIComponent(destination)}`,
    { headers }
  )
  if (!res.ok) throw new Error('image_service_unavailable')
  return res.json()
}

export async function uploadCoverImage(itineraryId: string, file: File): Promise<string> {
  const headers = await getAuthHeadersRaw()
  const form = new FormData()
  form.append('file', file)
  form.append('itinerary_id', itineraryId)
  const res = await fetch(`${API_URL}/api/images/upload`, {
    method: 'POST',
    headers,
    body: form,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Upload failed')
  return data.url
}
```

Replace the existing `updateItinerary` function with the new signature:
```ts
export async function updateItinerary(
  id: string,
  payload: { content?: ItineraryContent; cover_image?: string }
): Promise<Itinerary> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_URL}/api/itineraries/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Erro ao atualizar roteiro')
  return data
}
```

- [ ] **Step 2: Update both call sites in `frontend/src/hooks/useItinerary.ts`**

The hook currently calls `updateItinerary(id, newContent)` at two places.

Line 39 (inside `updateActivity` debounce):
```ts
// Before:
updateItinerary(id, newContent).catch(e => setError(e.message))
// After:
updateItinerary(id, { content: newContent }).catch(e => setError(e.message))
```

Line 55 (inside `deleteActivity`):
```ts
// Before:
updateItinerary(id, newContent).catch(e => setError(e.message))
// After:
updateItinerary(id, { content: newContent }).catch(e => setError(e.message))
```

- [ ] **Step 3: Run frontend type-check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors. Fix any type errors before continuing.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/services/api.ts frontend/src/hooks/useItinerary.ts
git commit -m "feat: add image API functions; update updateItinerary signature and hook call sites"
```

---

## Task 7: `ImagePicker` Component

**Files:**
- Create: `frontend/src/components/UI/ImagePicker.tsx`

- [ ] **Step 1: Create `frontend/src/components/UI/ImagePicker.tsx`**

```tsx
import { useState, useEffect, useRef } from 'react'
import { getImageSuggestions, uploadCoverImage } from '../../services/api'
import { Spinner } from './Spinner'

interface ImagePickerProps {
  destination: string
  value?: string
  itineraryId?: string
  onChange: (url: string) => void
  onFileSelected?: (file: File) => void
}

type Tab = 'suggestions' | 'upload'

interface Suggestion {
  url: string
  photographer: string
  pexels_page: string
}

export function ImagePicker({ destination, value, itineraryId, onChange, onFileSelected }: ImagePickerProps) {
  const [tab, setTab] = useState<Tab>('suggestions')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [suggestionsError, setSuggestionsError] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [uploadLoading, setUploadLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const objectUrlRef = useRef<string | null>(null)

  useEffect(() => {
    if (!destination) return
    setSuggestionsLoading(true)
    setSuggestionsError('')
    getImageSuggestions(destination)
      .then(setSuggestions)
      .catch(() => setSuggestionsError('image_service_unavailable'))
      .finally(() => setSuggestionsLoading(false))
  }, [destination])

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    }
  }, [])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError('')

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Arquivo muito grande (máx. 5MB)')
      return
    }

    if (itineraryId) {
      setUploadLoading(true)
      try {
        const url = await uploadCoverImage(itineraryId, file)
        onChange(url)
      } catch {
        setUploadError('Falha ao enviar imagem. Tente novamente.')
      } finally {
        setUploadLoading(false)
      }
    } else {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
      const objUrl = URL.createObjectURL(file)
      objectUrlRef.current = objUrl
      setPreviewUrl(objUrl)
      onChange(objUrl)
      onFileSelected?.(file)
    }
  }

  const tabClass = (t: Tab) =>
    `px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
      tab === t
        ? 'border-brand text-brand'
        : 'border-transparent text-content-muted hover:text-content'
    }`

  return (
    <div className="rounded-[12px] border-[1.5px] border-surface-border bg-surface-bg p-4">
      <p className="mb-3 text-[13px] font-semibold text-content">Imagem de capa</p>

      <div className="mb-4 flex gap-0 border-b border-surface-border">
        <button type="button" className={tabClass('suggestions')} onClick={() => setTab('suggestions')}>
          Sugestões
        </button>
        <button type="button" className={tabClass('upload')} onClick={() => setTab('upload')}>
          Minha foto
        </button>
      </div>

      {tab === 'suggestions' && (
        <div>
          {suggestionsLoading && (
            <div className="flex justify-center py-6">
              <Spinner message="Buscando sugestões..." />
            </div>
          )}
          {!suggestionsLoading && suggestionsError && (
            <p className="text-sm text-content-muted">
              Sugestões temporariamente indisponíveis. Você pode subir sua própria foto.
            </p>
          )}
          {!suggestionsLoading && !suggestionsError && suggestions.length === 0 && (
            <p className="text-sm text-content-muted">Nenhuma sugestão encontrada para este destino.</p>
          )}
          {!suggestionsLoading && !suggestionsError && suggestions.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {suggestions.map((s, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => onChange(s.url)}
                    className={`overflow-hidden rounded-[8px] border-2 transition-colors ${
                      value === s.url ? 'border-brand' : 'border-transparent hover:border-surface-border'
                    }`}
                  >
                    <img src={s.url} alt={`Sugestão ${i + 1}`} className="h-[80px] w-full object-cover" />
                  </button>
                  <a
                    href={s.pexels_page}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-[10px] text-content-muted hover:text-content"
                  >
                    {s.photographer} / Pexels
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'upload' && (
        <div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="mb-2 text-sm text-content-muted"
          />
          {uploadError && <p className="mt-1 text-xs text-status-error-text">{uploadError}</p>}
          {uploadLoading && <p className="mt-2 text-sm text-content-muted">Enviando...</p>}
          {(previewUrl || (value && !value.startsWith('blob:') && itineraryId)) && (
            <img
              src={previewUrl || value}
              alt="Preview"
              className="mt-2 h-[80px] w-full rounded-[8px] object-cover"
            />
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Run frontend type-check**

```bash
cd frontend && npx tsc --noEmit
```

Fix any type errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/UI/ImagePicker.tsx
git commit -m "feat: add ImagePicker component with Pexels suggestions and file upload"
```

---

## Task 8: Integrate `ImagePicker` into `Plan.tsx` (Creation)

**Files:**
- Modify: `frontend/src/pages/Plan.tsx`

Current imports in `Plan.tsx` do NOT yet import from `../services/api` — the `generateItinerary` import comes from there. Check the file: line 4 is `import { generateItinerary } from '../services/api'`. Extend this import rather than adding a duplicate.

- [ ] **Step 1: Update imports and add state in `Plan.tsx`**

Extend the existing api import (line 4):
```ts
// Before:
import { generateItinerary } from '../services/api'
// After:
import { generateItinerary, uploadCoverImage, updateItinerary } from '../services/api'
```

Add import for `ImagePicker` after existing component imports:
```ts
import { ImagePicker } from '../components/UI/ImagePicker'
```

Add state inside `PlanPage` (after the `error` state):
```ts
const [coverFile, setCoverFile] = useState<File | null>(null)
const [coverUrl, setCoverUrl] = useState('')
```

- [ ] **Step 2: Add `ImagePicker` to form JSX**

Place after `<DestinationAutocomplete>` (after the closing `/>` on line 133) and before the date `<div className="grid ...">`:

```tsx
<ImagePicker
  destination={form.destination}
  value={coverUrl}
  onChange={setCoverUrl}
  onFileSelected={setCoverFile}
/>
```

- [ ] **Step 3: Update `handleSubmit` — post-generate cover upload flow**

Inside `handleSubmit`, replace the line `navigate(\`/preview/${itinerary.id}\`)` with:

```ts
const itinerary = await generateItinerary(form)

let finalCoverUrl: string | undefined
if (coverFile) {
  try {
    finalCoverUrl = await uploadCoverImage(itinerary.id, coverFile)
  } catch {
    toast('Não foi possível salvar a imagem de capa.', { icon: '⚠️' })
  }
} else if (coverUrl && !coverUrl.startsWith('blob:')) {
  finalCoverUrl = coverUrl
}

if (finalCoverUrl) {
  try {
    await updateItinerary(itinerary.id, { cover_image: finalCoverUrl })
  } catch {
    // Non-blocking — itinerary was created successfully
  }
}

toast.success('Roteiro gerado com sucesso!')
navigate(`/preview/${itinerary.id}`)
```

- [ ] **Step 4: Run type-check**

```bash
cd frontend && npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/Plan.tsx
git commit -m "feat: integrate ImagePicker into Plan page with post-submit upload flow"
```

---

## Task 9: Integrate `ImagePicker` into `Preview.tsx` (Editing)

**Files:**
- Modify: `frontend/src/pages/Preview.tsx`

Current `Preview.tsx` imports from `'../services/api'` on line 9: `import { downloadPdf } from '../services/api'`. Extend this import rather than adding a second one.

- [ ] **Step 1: Update imports**

Extend the existing api import (line 9):
```ts
// Before:
import { downloadPdf } from '../services/api'
// After:
import { downloadPdf, updateItinerary } from '../services/api'
```

Add `ImagePicker` import:
```ts
import { ImagePicker } from '../components/UI/ImagePicker'
```

- [ ] **Step 2: Add `handleCoverChange` function**

Add inside `PreviewPage`, before the `return`:
```ts
async function handleCoverChange(url: string) {
  try {
    await updateItinerary(id!, { cover_image: url })
    toast.success('Imagem atualizada!')
  } catch {
    toast.error('Erro ao atualizar imagem')
  }
}
```

- [ ] **Step 3: Add `ImagePicker` to JSX**

Place just before `<div className="mb-8 flex flex-col gap-2 sm:flex-row ...">` (the title/meta row, currently around line 55):

```tsx
<ImagePicker
  destination={itinerary.destination}
  value={itinerary.cover_image}
  itineraryId={itinerary.id}
  onChange={handleCoverChange}
/>
```

- [ ] **Step 4: Run type-check**

```bash
cd frontend && npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/Preview.tsx
git commit -m "feat: integrate ImagePicker into Preview page for cover image editing"
```

---

## Task 10: Update `TripCard` — Use `cover_image`, Remove Unsplash

**Files:**
- Modify: `frontend/src/components/Dashboard/TripCard.tsx`

Note: `formatDate` import was already added in Task 1.

- [ ] **Step 1: Remove `getUnsplashUrl` function (lines 25-28)**

Delete the entire function:
```ts
function getUnsplashUrl(destination: string): string {
  const query = encodeURIComponent(destination.split(',')[0].trim())
  return `https://source.unsplash.com/featured/400x200?${query},travel,city`
}
```

- [ ] **Step 2: Update list view thumbnail (lines 57-72) — replace `<img src={getUnsplashUrl...}>` with conditional**

```tsx
<div className="relative h-[72px] w-[72px] flex-shrink-0 overflow-hidden">
  {itinerary.cover_image ? (
    <img
      src={itinerary.cover_image}
      alt={itinerary.destination}
      className="h-full w-full object-cover"
    />
  ) : (
    <PhotoFallback />
  )}
</div>
```

- [ ] **Step 3: Update grid view photo section (lines 125-144) — replace `<img src={getUnsplashUrl...}>` with conditional**

```tsx
<div className="relative h-[130px]">
  {itinerary.cover_image ? (
    <img
      src={itinerary.cover_image}
      alt={itinerary.destination}
      className="h-full w-full object-cover"
    />
  ) : (
    <PhotoFallback />
  )}
  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)' }} />
  <span className="absolute right-2.5 top-2.5 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-bold text-content">
    {formatDate(itinerary.start_date)} – {formatDate(itinerary.end_date)}
  </span>
</div>
```

- [ ] **Step 4: Run type-check**

```bash
cd frontend && npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/Dashboard/TripCard.tsx
git commit -m "feat: TripCard uses cover_image with PhotoFallback; removes Unsplash dependency"
```

---

## Task 11: Environment Variable + Final Verification

- [ ] **Step 1: Add `PEXELS_API_KEY` to `backend/.env`**

```env
PEXELS_API_KEY=your_key_here
```

Obtain a free key at https://www.pexels.com/api/

> `.env` is gitignored — do NOT commit it. Update `backend/.env.example` instead:

```env
PEXELS_API_KEY=
```

- [ ] **Step 2: Commit `.env.example`**

```bash
git add backend/.env.example
git commit -m "chore: document PEXELS_API_KEY in .env.example"
```

- [ ] **Step 3: Run all tests**

```bash
cd c:/travel-ai/backend && npx vitest run
cd c:/travel-ai/frontend && npx vitest run
```

Expected: all pass. Fix any failures before proceeding.

- [ ] **Step 4: Final type-check both sides**

```bash
cd c:/travel-ai/frontend && npx tsc --noEmit
cd c:/travel-ai/backend && npx tsc --noEmit
```

Expected: no errors.

---

## Summary of Changes

| Area | Change |
|------|--------|
| `frontend/src/utils/date.ts` | New — shared `formatDate` (DD-MM-YYYY with hyphens) |
| `frontend/src/types/index.ts` | Add `cover_image?: string` to `Itinerary` and `GenerateItineraryInput` |
| `frontend/src/services/api.ts` | Add `getImageSuggestions`, `uploadCoverImage`; update `updateItinerary` signature |
| `frontend/src/hooks/useItinerary.ts` | Update 2 call sites: `updateItinerary(id, content)` → `updateItinerary(id, { content })` |
| `frontend/src/components/UI/ImagePicker.tsx` | New — Pexels suggestions tab + file upload tab |
| `frontend/src/pages/Plan.tsx` | Add `ImagePicker`, post-submit upload flow |
| `frontend/src/pages/Preview.tsx` | Use shared `formatDate` (hyphen), add `ImagePicker` for cover editing |
| `frontend/src/components/Dashboard/TripCard.tsx` | Use `formatDate`, use `cover_image` with `PhotoFallback`, remove Unsplash |
| `backend/src/routes/images.ts` | New — `GET /api/images/suggestions`, `POST /api/images/upload` |
| `backend/src/index.ts` | Register `imagesRouter` at `/api/images` |
| `backend/src/routes/itineraries.ts` | PUT accepts `cover_image`; DELETE fetches and cleans Storage before deleting |
| `backend/src/types/index.ts` | Add `cover_image?: string` to `Itinerary` |
| Supabase (manual) | `ALTER TABLE itineraries ADD COLUMN cover_image text;` + create `itinerary-covers` bucket |
