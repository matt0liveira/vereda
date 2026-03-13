import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useItinerary } from '../hooks/useItinerary'
import { ItineraryDay } from '../components/Preview/ItineraryDay'
import { Spinner } from '../components/UI/Spinner'
import { Button } from '../components/UI/Button'
import { Badge } from '../components/UI/Badge'
import { getPdfUrl } from '../services/api'

const BUDGET_LABELS: Record<string, string> = {
  economico: 'Econômico',
  moderado: 'Moderado',
  luxo: 'Luxo',
}

export default function PreviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { itinerary, loading, saving, error, updateActivity, deleteActivity, save } = useItinerary(id!)

  if (loading) return <Spinner message="Carregando roteiro..." />
  if (error || !itinerary) return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-center">
      <p className="mb-4 text-red-600">{error || 'Roteiro não encontrado'}</p>
      <Button onClick={() => navigate('/plan')}>Tentar novamente</Button>
    </div>
  )

  async function handleSave() {
    await save()
    toast.success('Viagem salva com sucesso!')
    navigate('/dashboard')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{itinerary.title}</h1>
          <p className="mt-1 text-gray-500">
            📍 {itinerary.destination} &nbsp;·&nbsp;
            📅 {itinerary.start_date} – {itinerary.end_date} &nbsp;·&nbsp;
            <Badge label={BUDGET_LABELS[itinerary.budget]} color="blue" />
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={getPdfUrl(itinerary.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            ⬇ PDF
          </a>
          {itinerary.status !== 'saved' && (
            <Button onClick={handleSave} loading={saving}>Salvar viagem</Button>
          )}
          {itinerary.status === 'saved' && (
            <Badge label="Salvo" color="green" />
          )}
        </div>
      </div>

      {itinerary.content.days.map((day, index) => (
        <ItineraryDay
          key={day.day}
          day={day}
          dayIndex={index}
          onUpdateActivity={updateActivity}
          onDeleteActivity={deleteActivity}
        />
      ))}
    </div>
  )
}
