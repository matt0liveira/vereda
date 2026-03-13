import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'

const mockGenerateItinerary = vi.fn()
const mockAuthMiddleware = vi.fn((_req: any, _res: any, next: any) => {
  _req.user = { id: 'user-123' }
  next()
})

vi.mock('../../services/gemini', () => ({ generateItinerary: mockGenerateItinerary }))
vi.mock('../../middlewares/authMiddleware', () => ({ authMiddleware: mockAuthMiddleware }))
vi.mock('uuid', () => ({ v4: () => 'mock-uuid' }))

const mockChain = {
  insert: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
}

vi.mock('../../services/supabase', () => ({
  supabase: {
    from: vi.fn(() => mockChain),
  },
}))

const { itinerariesRouter } = await import('../../routes/itineraries')

const app = express()
app.use(express.json())
app.use('/api/itineraries', itinerariesRouter)

describe('POST /api/itineraries/generate', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/itineraries/generate').send({})
    expect(res.status).toBe(400)
  })

  it('generates and saves itinerary as draft', async () => {
    const mockContent = { days: [{ day: 1, date: '2026-06-01', activities: [] }] }
    mockGenerateItinerary.mockResolvedValue(mockContent)

    const savedItinerary = {
      id: 'itin-123',
      user_id: 'user-123',
      title: 'Paris Trip',
      destination: 'Paris',
      start_date: '2026-06-01',
      end_date: '2026-06-03',
      budget: 'moderado',
      interests: ['cultura'],
      content: mockContent,
      status: 'draft',
      created_at: '2026-06-01T00:00:00Z',
    }

    mockChain.single.mockResolvedValue({ data: savedItinerary, error: null })

    const res = await request(app)
      .post('/api/itineraries/generate')
      .send({
        title: 'Paris Trip',
        destination: 'Paris',
        start_date: '2026-06-01',
        end_date: '2026-06-03',
        budget: 'moderado',
        interests: ['cultura'],
      })

    expect(res.status).toBe(201)
    expect(res.body.status).toBe('draft')
  })

  it('returns 502 when Gemini fails', async () => {
    mockGenerateItinerary.mockRejectedValue(new Error('Invalid JSON from Gemini'))
    mockChain.single.mockResolvedValue({ data: null, error: null })
    const res = await request(app)
      .post('/api/itineraries/generate')
      .send({
        title: 'Paris Trip',
        destination: 'Paris',
        start_date: '2026-06-01',
        end_date: '2026-06-03',
        budget: 'moderado',
        interests: ['cultura'],
      })
    expect(res.status).toBe(502)
  })
})

describe('GET /api/itineraries', () => {
  it('returns list of itineraries for user', async () => {
    mockChain.order.mockResolvedValue({ data: [], error: null })
    const res = await request(app).get('/api/itineraries')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })
})

describe('PUT /api/itineraries/:id', () => {
  it('updates itinerary content', async () => {
    const updated = { id: 'itin-123', content: { days: [] } }
    mockChain.single.mockResolvedValue({ data: updated, error: null })
    const res = await request(app)
      .put('/api/itineraries/itin-123')
      .send({ content: { days: [] } })
    expect(res.status).toBe(200)
  })
})

describe('POST /api/itineraries/:id/save', () => {
  it('changes status to saved', async () => {
    const updated = { id: 'itin-123', status: 'saved' }
    mockChain.single.mockResolvedValue({ data: updated, error: null })
    const res = await request(app).post('/api/itineraries/itin-123/save')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('saved')
  })
})

describe('DELETE /api/itineraries/:id', () => {
  it('deletes itinerary', async () => {
    // The delete chain: .delete().eq('id',...).eq('user_id',...)
    // Second .eq() must return a promise resolving to { error: null }
    mockChain.eq
      .mockReturnValueOnce(mockChain) // first .eq() returns chain
      .mockResolvedValueOnce({ error: null }) // second .eq() resolves
    const res = await request(app).delete('/api/itineraries/itin-123')
    expect(res.status).toBe(204)
  })
})
