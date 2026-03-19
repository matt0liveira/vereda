import { Link } from 'react-router-dom'
import { Itinerary } from '../../types'
import { Badge, STATUS_BADGE } from '../UI/Badge'
import { Button } from '../UI/Button'

interface TripCardProps {
  itinerary: Itinerary
  onDelete: (id: string) => void
  view: 'grid' | 'list'
}

const BUDGET_LABELS: Record<string, string> = {
  economico: 'Econômico',
  moderado: 'Moderado',
  luxo: 'Luxo',
}

const STATUS_LABELS: Record<string, string> = {
  draft:  'Rascunho',
  saved:  'Planejado',
  done:   'Concluído',
  error:  'Erro',
}

function getUnsplashUrl(destination: string): string {
  const query = encodeURIComponent(destination.split(',')[0].trim())
  return `https://source.unsplash.com/featured/400x200?${query},travel,city`
}

function PhotoFallback() {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #FED7AA, #EA580C)' }}
    >
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
        <line x1="8" y1="2" x2="8" y2="18"/>
        <line x1="16" y1="6" x2="16" y2="22"/>
      </svg>
    </div>
  )
}

export function TripCard({ itinerary, onDelete, view }: TripCardProps) {
  const badge = (
    <Badge
      variant={STATUS_BADGE[itinerary.status] ?? 'draft'}
      label={STATUS_LABELS[itinerary.status] ?? 'Rascunho'}
    />
  )

  if (view === 'list') {
    return (
      <div className="flex overflow-hidden rounded-[14px] border border-surface-border bg-surface">
        {/* Thumbnail */}
        <div className="relative h-[72px] w-[72px] flex-shrink-0 overflow-hidden">
          <img
            src={getUnsplashUrl(itinerary.destination)}
            alt={itinerary.destination}
            className="h-full w-full object-cover"
            onError={e => {
              const img = e.currentTarget as HTMLImageElement
              img.style.display = 'none'
              const fallback = img.nextElementSibling as HTMLElement
              if (fallback) fallback.style.display = 'flex'
            }}
          />
          <div className="absolute inset-0 hidden">
            <PhotoFallback />
          </div>
        </div>

        {/* Data */}
        <div className="flex flex-1 items-center gap-8 px-5 py-3">
          <div className="min-w-[140px]">
            <h3 className="text-sm font-bold text-content">{itinerary.title}</h3>
            <p className="mt-0.5 text-xs text-content-muted">{itinerary.destination}</p>
          </div>
          <div className="hidden sm:flex gap-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-content-subtle">Período</p>
              <p className="mt-0.5 text-[13px] font-semibold text-content">
                {itinerary.start_date} – {itinerary.end_date}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-content-subtle">Orçamento</p>
              <p className="mt-0.5 text-[13px] font-semibold text-content">{BUDGET_LABELS[itinerary.budget]}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-content-subtle">Status</p>
              <div className="mt-0.5">{badge}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 px-4">
          <Link to={`/preview/${itinerary.id}`}>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-border bg-surface text-content-muted transition-colors hover:text-content" aria-label="Ver roteiro">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </Link>
          <button
            onClick={() => onDelete(itinerary.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-border bg-surface text-content-muted transition-colors hover:text-status-error-text"
            aria-label="Excluir viagem"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/>
            </svg>
          </button>
        </div>
      </div>
    )
  }

  // Grid mode
  return (
    <div className="overflow-hidden rounded-[14px] border border-surface-border bg-surface transition-shadow hover:shadow-md">
      {/* Photo */}
      <div className="relative h-[130px]">
        <img
          src={getUnsplashUrl(itinerary.destination)}
          alt={itinerary.destination}
          className="h-full w-full object-cover"
          onError={e => {
            const img = e.currentTarget as HTMLImageElement
            img.style.display = 'none'
            const fallback = img.nextElementSibling as HTMLElement
            if (fallback) fallback.style.display = 'flex'
          }}
        />
        <div className="absolute inset-0 hidden">
          <PhotoFallback />
        </div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)' }} />
        <span className="absolute right-2.5 top-2.5 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-bold text-content">
          {itinerary.start_date} – {itinerary.end_date}
        </span>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="text-sm font-bold text-content">{itinerary.title}</h3>
        <p className="mt-0.5 text-xs text-content-muted">{itinerary.destination}</p>

        <div className="mt-3 flex items-center justify-between border-t border-surface-border pt-3">
          <span className="text-xs text-content-muted">{BUDGET_LABELS[itinerary.budget]}</span>
          {badge}
        </div>

        <div className="mt-3 flex gap-2">
          <Link to={`/preview/${itinerary.id}`} className="flex-1">
            <Button variant="secondary" className="w-full text-xs">Ver roteiro</Button>
          </Link>
          <Button variant="danger" onClick={() => onDelete(itinerary.id)} className="text-xs">
            Excluir
          </Button>
        </div>
      </div>
    </div>
  )
}
