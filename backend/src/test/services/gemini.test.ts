import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGenerateContent = vi.fn()

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn(() => ({
    getGenerativeModel: vi.fn(() => ({
      generateContent: mockGenerateContent,
    })),
  })),
}))

const { generateItinerary } = await import('../../services/gemini')

describe('generateItinerary', () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test-key'
    vi.clearAllMocks()
  })

  it('returns parsed itinerary content on success', async () => {
    const mockContent = {
      days: [
        {
          day: 1,
          date: '2026-06-01',
          activities: [
            {
              time: '09:00',
              title: 'Test Activity',
              description: 'A test description.',
              location: { name: 'Test Place', address: '123 Test St', mapsUrl: 'https://maps.google.com/?q=Test' },
            },
          ],
        },
      ],
    }
    mockGenerateContent.mockResolvedValue({
      response: { text: () => JSON.stringify(mockContent) },
    })

    const result = await generateItinerary({
      destination: 'Paris',
      start_date: '2026-06-01',
      end_date: '2026-06-03',
      budget: 'moderado',
      interests: ['cultura'],
    })

    expect(result).toEqual(mockContent)
  })

  it('throws error when Gemini returns invalid JSON', async () => {
    mockGenerateContent.mockResolvedValue({
      response: { text: () => 'not valid json' },
    })

    await expect(
      generateItinerary({
        destination: 'Paris',
        start_date: '2026-06-01',
        end_date: '2026-06-03',
        budget: 'moderado',
        interests: ['cultura'],
      })
    ).rejects.toThrow('Invalid JSON from Gemini')
  })
})
