import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response, NextFunction } from 'express'

const mockGetUser = vi.fn()

vi.mock('../../services/supabase', () => ({
  supabase: {
    auth: {
      getUser: mockGetUser,
    },
  },
}))

const { authMiddleware } = await import('../../middlewares/authMiddleware')

describe('authMiddleware', () => {
  let req: Partial<Request>
  let res: Partial<Response>
  let next: NextFunction

  beforeEach(() => {
    req = { headers: {} }
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    }
    next = vi.fn()
    vi.clearAllMocks()
  })

  it('returns 401 when no Authorization header', async () => {
    await authMiddleware(req as Request, res as Response, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 401 when token is invalid', async () => {
    req.headers = { authorization: 'Bearer invalid-token' }
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('Invalid') })
    await authMiddleware(req as Request, res as Response, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('calls next and sets req.user when token is valid', async () => {
    req.headers = { authorization: 'Bearer valid-token' }
    const fakeUser = { id: 'user-123', email: 'test@test.com' }
    mockGetUser.mockResolvedValue({ data: { user: fakeUser }, error: null })
    await authMiddleware(req as Request, res as Response, next)
    expect(next).toHaveBeenCalled()
    expect((req as any).user).toEqual(fakeUser)
  })
})
