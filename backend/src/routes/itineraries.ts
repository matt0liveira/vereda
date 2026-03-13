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
  } catch (_err) {
    // Save error record
    const { data } = await supabase
      .from('itineraries')
      .insert({ user_id: req.user!.id, title, destination, start_date, end_date, budget, interests, content: {}, status: 'error' })
      .select()
      .single()

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
  const { content } = req.body

  const { data, error } = await supabase
    .from('itineraries')
    .update({ content })
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
  const { error } = await supabase
    .from('itineraries')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user!.id)

  if (error) return res.status(404).json({ error: 'Not found' })
  return res.status(204).send()
})
