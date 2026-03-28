import { useState, useEffect } from 'react'
import { fetchItineraries, deleteItinerary } from '../services/api'
import { Itinerary } from '../types'
import { TripCard } from '../components/Dashboard/TripCard'
import { EmptyState } from '../components/Dashboard/EmptyState'
import { Spinner } from '../components/UI/Spinner'
import { ConfirmDialog } from '../components/UI/ConfirmDialog'
import { useNavigate } from 'react-router-dom'
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

const PAGE_SIZE = 9

export default function DashboardPage() {
  const navigate = useNavigate()
  const [itineraries, setItineraries] = useState<Itinerary[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<ViewMode>('grid')
  const [pendingDelete, setPendingDelete] = useState<Itinerary | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchItineraries()
      .then(setItineraries)
      .catch(() => toast.error('Erro ao carregar viagens'))
      .finally(() => setLoading(false))
  }, [])

  async function confirmDelete() {
    if (!pendingDelete) return
    try {
      await deleteItinerary(pendingDelete.id)
      setItineraries(prev => {
        const next = prev.filter(i => i.id !== pendingDelete.id)
        const newTotalPages = Math.ceil(next.length / PAGE_SIZE)
        if (page > newTotalPages) setPage(Math.max(1, newTotalPages))
        return next
      })
      toast.success('Viagem excluída')
    } catch {
      toast.error('Erro ao excluir viagem')
    } finally {
      setPendingDelete(null)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <ConfirmDialog
        open={!!pendingDelete}
        title={`Excluir "${pendingDelete?.title}"?`}
        description="Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
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
          <Button onClick={() => { sessionStorage.removeItem('travel-ai:plan-form'); navigate('/plan') }}>
            + Nova viagem
          </Button>
        </div>
      </div>

      {loading ? (
        <Spinner message="Carregando viagens..." />
      ) : itineraries.length === 0 ? (
        <EmptyState />
      ) : (() => {
        const totalPages = Math.ceil(itineraries.length / PAGE_SIZE)
        const paginated = itineraries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
        return (
          <>
            {view === 'grid' ? (
              <div className="grid gap-[14px] sm:grid-cols-2 lg:grid-cols-3">
                {paginated.map(it => (
                  <TripCard key={it.id} itinerary={it} onDelete={setPendingDelete} view="grid" />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {paginated.map(it => (
                  <TripCard key={it.id} itinerary={it} onDelete={setPendingDelete} view="list" />
                ))}
              </div>
            )}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-border text-content-muted transition-colors hover:border-surface-border-filled hover:text-content disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Página anterior"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border text-[13px] font-semibold transition-colors ${
                      n === page
                        ? 'border-brand bg-brand-muted text-brand-dark'
                        : 'border-surface-border text-content-muted hover:border-surface-border-filled hover:text-content'
                    }`}
                    aria-current={n === page ? 'page' : undefined}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-border text-content-muted transition-colors hover:border-surface-border-filled hover:text-content disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Próxima página"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>
            )}
          </>
        )
      })()}
    </div>
  )
}
