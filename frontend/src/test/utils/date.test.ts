import { describe, it, expect } from 'vitest'
import { formatDate } from '../../utils/date'

describe('formatDate', () => {
  it('converts ISO to DD-MM-YYYY', () => {
    expect(formatDate('2026-03-19')).toBe('19-03-2026')
  })
  it('returns empty string for empty input', () => {
    expect(formatDate('')).toBe('')
  })
})
