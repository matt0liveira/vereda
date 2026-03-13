import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

const mockLogin = vi.fn()
const mockRegister = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ user: null, loading: false, login: mockLogin, register: mockRegister, logout: vi.fn() }),
}))
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }))

const { default: AuthPage } = await import('../../pages/Auth')

function renderAuth() {
  return render(<MemoryRouter><AuthPage /></MemoryRouter>)
}

describe('Auth page', () => {
  it('renders login form by default', () => {
    renderAuth()
    expect(screen.getByRole('heading', { name: /entrar/i })).toBeInTheDocument()
  })

  it('switches to register tab', () => {
    renderAuth()
    fireEvent.click(screen.getByRole('tab', { name: /cadastrar/i }))
    expect(screen.getByRole('heading', { name: /criar conta/i })).toBeInTheDocument()
  })

  it('calls login with credentials on submit', async () => {
    mockLogin.mockResolvedValue(undefined)
    renderAuth()
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'test@test.com' } })
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))
    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'password123'))
  })

  it('shows error on failed login', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'))
    renderAuth()
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'bad@test.com' } })
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))
    await waitFor(() => expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument())
  })
})
