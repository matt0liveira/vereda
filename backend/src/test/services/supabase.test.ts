import { describe, it, expect, vi } from 'vitest'

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ auth: {}, from: vi.fn() })),
}))

describe('supabase service', () => {
  it('creates a supabase client', async () => {
    process.env.SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_ANON_KEY = 'test-anon-key'
    const { supabase } = await import('../../services/supabase')
    expect(supabase).toBeDefined()
  })
})
