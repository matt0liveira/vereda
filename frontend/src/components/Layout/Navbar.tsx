import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../UI/Button'
import toast from 'react-hot-toast'

function CompassIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" />
      <polygon points="12,4 14,12 12,20 10,12" fill="rgba(255,255,255,0.45)" />
      <polygon points="4,12 12,10 20,12 12,14" fill="white" />
    </svg>
  )
}

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await logout()
      toast.success('Até logo!')
      navigate('/')
    } catch {
      toast.error('Erro ao sair. Tente novamente.')
    }
  }

  return (
    <nav className="border-b-[1.5px] border-surface-border bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-0 h-[60px]">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
            <CompassIcon />
          </div>
          <span className="text-[17px] font-bold tracking-[-0.5px] text-brand-dark">Vereda</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-content-muted hover:text-content transition-colors">
                Minhas viagens
              </Link>
              <Link to="/plan" className="text-sm font-medium text-content-muted hover:text-content transition-colors">
                Planejar
              </Link>
              <Button variant="secondary" onClick={handleLogout} className="text-sm">
                Sair
              </Button>
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
