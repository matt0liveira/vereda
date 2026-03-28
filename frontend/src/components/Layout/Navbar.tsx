import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'
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
  const { dark, toggle } = useTheme()

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
          <button
            onClick={toggle}
            aria-label={dark ? 'Ativar modo claro' : 'Ativar modo escuro'}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-content-muted transition-colors hover:bg-surface-border hover:text-content"
          >
            {dark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-content-muted hover:text-content transition-colors">
                Minhas viagens
              </Link>
              <button
                onClick={() => { sessionStorage.removeItem('travel-ai:plan-form'); navigate('/plan') }}
                className="text-sm font-medium text-content-muted hover:text-content transition-colors"
              >
                Planejar
              </button>
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
