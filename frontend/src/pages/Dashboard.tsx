import { useState, useEffect } from 'react'
import { fetchItineraries, deleteItinerary } from '../services/api'
import { Itinerary } from '../types'
import { TripCard } from '../components/Dashboard/TripCard'
import { EmptyState } from '../components/Dashboard/EmptyState'
import { Spinner } from '../components/UI/Spinner'
import { Link } from 'react-router-dom'
import { Button } from '../components/UI/Button'
import toast from 'react-hot-toast'

type ViewMode = 'grid' | 'list'

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  )
}

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  )
}

export default function DashboardPage() {
  const [itineraries, setItineraries] = useState<Itinerary[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<ViewMode>('grid')

  useEffect(() => {
    fetchItineraries()
      .then(setItineraries)
      .catch(() => toast.error('Erro ao carregar viagens'))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta viagem?')) return
    try {
      await deleteItinerary(id)
      setItineraries(prev => prev.filter(i => i.id !== id))
      toast.success('Viagem excluída')
    } catch {
      toast.error('Erro ao excluir viagem')
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-[26px] font-extrabold tracking-[-0.7px] text-content">Minhas Viagens</h1>
        <div className="flex items-center gap-2.5">
          {/* Toggle grade/lista */}
          <div className="flex overflow-hidden rounded-lg border border-surface-border bg-surface">
            <button
              onClick={() => setView('grid')}
              aria-label="Modo grade"
              className={`flex items-center justify-center p-2 transition-colors ${
                view === 'grid' ? 'bg-brand-muted text-brand-dark' : 'text-content-muted hover:text-content'
              }`}
            >
              <GridIcon />
            </button>
            <button
              onClick={() => setView('list')}
              aria-label="Modo lista"
              className={`flex items-center justify-center p-2 transition-colors ${
                view === 'list' ? 'bg-brand-muted text-brand-dark' : 'text-content-muted hover:text-content'
              }`}
            >
              <ListIcon />
            </button>
          </div>
          <Link to="/plan">
            <Button>+ Nova viagem</Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <Spinner message="Carregando viagens..." />
      ) : itineraries.length === 0 ? (
        <EmptyState />
      ) : view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {itineraries.map(it => (
            <TripCard key={it.id} itinerary={it} onDelete={handleDelete} view="grid" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {itineraries.map(it => (
            <TripCard key={it.id} itinerary={it} onDelete={handleDelete} view="list" />
          ))}
        </div>
      )}
    </div>
  )
}
