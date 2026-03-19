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
