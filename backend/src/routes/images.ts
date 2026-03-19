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

// Multer error handler (must have 4 parameters to be recognized as error handler by Express)
imagesRouter.use((err: Error, _req: AuthRequest, res: Response, _next: any) => {
  if (err.message === 'invalid_mime') return res.status(400).json({ error: 'Invalid file type' })
  if (err.message === 'File too large') return res.status(413).json({ error: 'File too large (max 5MB)' })
  return res.status(500).json({ error: 'Upload error' })
})
