import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

const mockSignInWithPassword = vi.fn()
const mockSignUp = vi.fn()
const mockSignOut = vi.fn()
const mockGetSession = vi.fn()
const mockOnAuthStateChange = vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signOut: mockSignOut,
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
  },
}))

const { useAuth } = await import('../../hooks/useAuth')

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetSession.mockResolvedValue({ data: { session: null } })
  })

  it('starts with null user and loading true', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.user).toBeNull()
    expect(result.current.loading).toBe(true)
  })

  it('calls supabase signInWithPassword on login', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null })
    const { result } = renderHook(() => useAuth())
    await act(async () => {
      await result.current.login('test@test.com', 'password')
    })
    expect(mockSignInWithPassword).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password' })
  })

  it('throws error when login fails', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: { message: 'Invalid credentials' } })
    const { result } = renderHook(() => useAuth())
    await expect(async () => {
      await act(async () => {
        await result.current.login('bad@test.com', 'wrong')
      })
    }).rejects.toThrow('Invalid credentials')
  })

  it('calls supabase signOut on logout', async () => {
    mockSignOut.mockResolvedValue({})
    const { result } = renderHook(() => useAuth())
    await act(async () => {
      await result.current.logout()
    })
    expect(mockSignOut).toHaveBeenCalled()
  })
})
