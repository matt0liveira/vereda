import { Link } from 'react-router-dom'
import { Itinerary } from '../../types'
import { Badge } from '../UI/Badge'
import { Button } from '../UI/Button'

interface TripCardProps {
  itinerary: Itinerary
  onDelete: (id: string) => void
}

const BUDGET_LABELS: Record<string, string> = {
  economico: 'Econômico',
  moderado: 'Moderado',
  luxo: 'Luxo',
}

export function TripCard({ itinerary, onDelete }: TripCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-gray-900">{itinerary.title}</h3>
          <p className="text-sm text-gray-500">📍 {itinerary.destination}</p>
        </div>
        <Badge
          label={itinerary.status === 'saved' ? 'Salvo' : 'Rascunho'}
          color={itinerary.status === 'saved' ? 'green' : 'gray'}
        />
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span>📅 {itinerary.start_date} – {itinerary.end_date}</span>
        <span>·</span>
        <span>💰 {BUDGET_LABELS[itinerary.budget]}</span>
      </div>
      <div className="flex gap-2">
        <Link to={`/preview/${itinerary.id}`} className="flex-1">
          <Button variant="secondary" className="w-full text-sm">Ver roteiro</Button>
        </Link>
        <Button variant="danger" onClick={() => onDelete(itinerary.id)} className="text-sm">Excluir</Button>
      </div>
    </div>
  )
}
