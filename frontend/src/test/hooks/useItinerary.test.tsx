import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

const mockFetchItinerary = vi.fn()
const mockUpdateItinerary = vi.fn()
const mockSaveItinerary = vi.fn()

vi.mock('../../services/api', () => ({
  fetchItinerary: mockFetchItinerary,
  updateItinerary: mockUpdateItinerary,
  saveItinerary: mockSaveItinerary,
}))

const { useItinerary } = await import('../../hooks/useItinerary')

const mockItinerary = {
  id: 'itin-1',
  title: 'Paris Trip',
  destination: 'Paris',
  start_date: '2026-06-01',
  end_date: '2026-06-03',
  budget: 'moderado' as const,
  interests: ['cultura' as const],
  content: {
    days: [{
      day: 1,
      date: '2026-06-01',
      activities: [{
        id: 'act-1',
        time: '09:00',
        title: 'Louvre',
        description: 'Visit the museum',
        location: { name: 'Louvre', address: '123 Paris', mapsUrl: 'https://maps.google.com' }
      }]
    }]
  },
  status: 'draft' as const,
  user_id: 'user-1',
  created_at: '2026-06-01T00:00:00Z',
}

describe('useItinerary', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches itinerary by id', async () => {
    mockFetchItinerary.mockResolvedValue(mockItinerary)
    const { result } = renderHook(() => useItinerary('itin-1'))

    await act(async () => {
      await new Promise(r => setTimeout(r, 0))
    })

    expect(result.current.itinerary).toEqual(mockItinerary)
    expect(result.current.loading).toBe(false)
  })

  it('updateActivity modifies the activity optimistically', async () => {
    mockFetchItinerary.mockResolvedValue(mockItinerary)
    mockUpdateItinerary.mockResolvedValue(mockItinerary)

    const { result } = renderHook(() => useItinerary('itin-1'))
    await act(async () => { await new Promise(r => setTimeout(r, 0)) })

    act(() => {
      result.current.updateActivity('act-1', { title: 'Updated Title' })
    })

    expect(result.current.itinerary?.content.days[0].activities[0].title).toBe('Updated Title')
  })

  it('deleteActivity removes the activity', async () => {
    mockFetchItinerary.mockResolvedValue(mockItinerary)
    mockUpdateItinerary.mockResolvedValue({ ...mockItinerary, content: { days: [{ ...mockItinerary.content.days[0], activities: [] }] } })

    const { result } = renderHook(() => useItinerary('itin-1'))
    await act(async () => { await new Promise(r => setTimeout(r, 0)) })

    await act(async () => {
      result.current.deleteActivity(0, 'act-1')
      await new Promise(r => setTimeout(r, 0))
    })

    expect(result.current.itinerary?.content.days[0].activities).toHaveLength(0)
  })
})
