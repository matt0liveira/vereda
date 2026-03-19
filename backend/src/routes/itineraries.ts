import { Router, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../services/supabase'
import { generateItinerary } from '../services/gemini'
import { authMiddleware } from '../middlewares/authMiddleware'
import { AuthRequest, GenerateItineraryRequest, ItineraryContent } from '../types'

export const itinerariesRouter = Router()

itinerariesRouter.use(authMiddleware)

// POST /api/itineraries/generate
itinerariesRouter.post('/generate', async (req: AuthRequest, res: Response) => {
  const { destination, start_date, end_date, budget, interests, title } = req.body as GenerateItineraryRequest

  if (!destination || !start_date || !end_date || !budget || !interests || !title) {
    return res.status(400).json({ error: 'All fields are required' })
  }

  const VALID_BUDGETS = ['economico', 'moderado', 'luxo']
  const VALID_INTERESTS = ['cultura', 'gastronomia', 'aventura', 'kids-friendly', 'natureza', 'compras']

  if (!VALID_BUDGETS.includes(budget)) {
    return res.status(400).json({ error: 'Invalid budget value' })
  }

  if (!Array.isArray(interests) || !interests.every((i: string) => VALID_INTERESTS.includes(i))) {
    return res.status(400).json({ error: 'Invalid interests value' })
  }

  let content: ItineraryContent
  let status: 'draft' | 'error' = 'draft'

  try {
    content = await generateItinerary({ destination, start_date, end_date, budget, interests })
    // Add uuid to each activity
    content.days.forEach(day => {
      day.activities.forEach(activity => {
        activity.id = uuidv4()
      })
    })
  } catch (err) {
    console.error('[generate] Gemini error:', err)
    // Save error record
    const { data, error: dbError } = await supabase
      .from('itineraries')
      .insert({ user_id: req.user!.id, title, destination, start_date, end_date, budget, interests, content: {}, status: 'error' })
      .select()
      .single()

    if (dbError) console.error('[generate] DB error saving error record:', dbError)

    return res.status(502).json({ error: 'Falha ao gerar roteiro. Tente novamente.', itinerary: data })
  }

  const { data, error } = await supabase
    .from('itineraries')
    .insert({ user_id: req.user!.id, title, destination, start_date, end_date, budget, interests, content, status })
    .select()
    .single()

  if (error) return res.status(500).json({ error: 'Database error' })
  return res.status(201).json(data)
})

// GET /api/itineraries
itinerariesRouter.get('/', async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('itineraries')
    .select('*')
    .eq('user_id', req.user!.id)
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: 'Database error' })
  return res.json(data)
})

// GET /api/itineraries/:id
itinerariesRouter.get('/:id', async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('itineraries')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.user!.id)
    .single()

  if (error || !data) return res.status(404).json({ error: 'Not found' })
  return res.json(data)
})

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

// POST /api/itineraries/:id/save
itinerariesRouter.post('/:id/save', async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('itineraries')
    .update({ status: 'saved' })
    .eq('id', req.params.id)
    .eq('user_id', req.user!.id)
    .select()
    .single()

  if (error || !data) return res.status(404).json({ error: 'Not found' })
  return res.json(data)
})

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
