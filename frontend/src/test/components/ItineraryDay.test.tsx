import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ItineraryDay } from '../../components/Preview/ItineraryDay'
import { Activity } from '../../types'

const mockActivity: Activity = {
  id: 'act-1',
  time: '09:00',
  title: 'Louvre',
  description: 'Visit the museum',
  location: { name: 'Louvre', address: '123 Paris', mapsUrl: 'https://maps.google.com' }
}

const mockDay = { day: 1, date: '2026-06-01', activities: [mockActivity] }

describe('ItineraryDay', () => {
  it('renders day number and activities', () => {
    render(<ItineraryDay day={mockDay} dayIndex={0} onUpdateActivity={vi.fn()} onDeleteActivity={vi.fn()} />)
    expect(screen.getByText(/dia 1/i)).toBeInTheDocument()
    expect(screen.getByText('Louvre')).toBeInTheDocument()
  })

  it('calls onDeleteActivity when delete button is clicked', () => {
    const onDelete = vi.fn()
    render(<ItineraryDay day={mockDay} dayIndex={0} onUpdateActivity={vi.fn()} onDeleteActivity={onDelete} />)
    fireEvent.click(screen.getByRole('button', { name: /excluir/i }))
    expect(onDelete).toHaveBeenCalledWith(0, 'act-1')
  })
})
