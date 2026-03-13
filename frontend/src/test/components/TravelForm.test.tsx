import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

const mockGenerateItinerary = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../../services/api', () => ({ generateItinerary: mockGenerateItinerary }))
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }))

const { default: PlanPage } = await import('../../pages/Plan')

describe('Plan page', () => {
  it('renders form fields', () => {
    render(<MemoryRouter><PlanPage /></MemoryRouter>)
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/destino/i)).toBeInTheDocument()
  })

  it('shows validation error when required fields are empty', async () => {
    render(<MemoryRouter><PlanPage /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: /gerar roteiro/i }))
    await waitFor(() => expect(screen.getByText(/preencha todos os campos/i)).toBeInTheDocument())
  })

  it('navigates to preview on successful generation', async () => {
    mockGenerateItinerary.mockResolvedValue({ id: 'itin-1' })
    render(<MemoryRouter><PlanPage /></MemoryRouter>)

    fireEvent.change(screen.getByLabelText(/título/i), { target: { value: 'Viagem Paris' } })
    fireEvent.change(screen.getByLabelText(/destino/i), { target: { value: 'Paris' } })
    fireEvent.change(screen.getByLabelText(/data de início/i), { target: { value: '2026-06-01' } })
    fireEvent.change(screen.getByLabelText(/data de fim/i), { target: { value: '2026-06-03' } })
    fireEvent.click(screen.getByRole('button', { name: /gerar roteiro/i }))

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/preview/itin-1'))
  })
})
