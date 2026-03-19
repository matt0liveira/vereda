import { Link } from 'react-router-dom'
import { Button } from '../UI/Button'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-muted">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C2410C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
          <line x1="8" y1="2" x2="8" y2="18"/>
          <line x1="16" y1="6" x2="16" y2="22"/>
        </svg>
      </div>
      <h2 className="mb-2 text-xl font-bold text-content">Nenhuma viagem ainda</h2>
      <p className="mb-6 max-w-xs text-sm text-content-muted">
        Planeje sua primeira aventura e receba um roteiro personalizado dia a dia.
      </p>
      <Link to="/plan">
        <Button>Criar meu primeiro roteiro</Button>
      </Link>
    </div>
  )
}
