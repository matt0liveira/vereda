import { useState, useEffect } from 'react'
import { fetchItineraries, deleteItinerary } from '../services/api'
import { Itinerary } from '../types'
import { TripCard } from '../components/Dashboard/TripCard'
import { EmptyState } from '../components/Dashboard/EmptyState'
import { Spinner } from '../components/UI/Spinner'
import { Link } from 'react-router-dom'
import { Button } from '../components/UI/Button'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const [itineraries, setItineraries] = useState<Itinerary[]>([])
  const [loading, setLoading] = useState(true)

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
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Minhas Viagens</h1>
        <Link to="/plan"><Button>+ Nova viagem</Button></Link>
      </div>

      {loading ? (
        <Spinner message="Carregando viagens..." />
      ) : itineraries.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {itineraries.map(it => (
            <TripCard key={it.id} itinerary={it} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
