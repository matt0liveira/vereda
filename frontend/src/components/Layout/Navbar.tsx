import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../UI/Button'
import toast from 'react-hot-toast'

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    toast.success('Até logo!')
    navigate('/')
  }

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold text-blue-600">✈ Travel AI</Link>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm text-gray-600 hover:text-blue-600">Minhas viagens</Link>
              <Link to="/plan" className="text-sm text-gray-600 hover:text-blue-600">Planejar</Link>
              <Button variant="secondary" onClick={handleLogout} className="text-sm">Sair</Button>
            </>
          ) : (
            <Link to="/auth">
              <Button className="text-sm">Entrar</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
