import { Router, Response } from 'express'
import { supabase } from '../services/supabase'
import { generatePdf } from '../services/pdf'
import { authMiddleware } from '../middlewares/authMiddleware'
import { AuthRequest, Itinerary } from '../types'

export const pdfRouter = Router()

pdfRouter.use(authMiddleware)

// GET /api/itineraries/:id/pdf
pdfRouter.get('/:id/pdf', async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('itineraries')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.user!.id)
    .single()

  if (error || !data) return res.status(404).json({ error: 'Not found' })

  try {
    const pdf = await generatePdf(data as Itinerary)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${data.title}.pdf"`)
    return res.send(pdf)
  } catch {
    return res.status(500).json({ error: 'Falha ao gerar PDF' })
  }
})
