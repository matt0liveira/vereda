import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useItinerary } from '../hooks/useItinerary'
import { ItineraryDay } from '../components/Preview/ItineraryDay'
import { Spinner } from '../components/UI/Spinner'
import { Button } from '../components/UI/Button'
import { Badge, STATUS_BADGE } from '../components/UI/Badge'
import { downloadPdf } from '../services/api'

const BUDGET_LABELS: Record<string, string> = {
  economico: 'Econômico',
  moderado: 'Moderado',
  luxo: 'Luxo',
}

function formatDate(isoDate: string): string {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}

export default function PreviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { itinerary, loading, saving, error, updateActivity, deleteActivity, save } = useItinerary(id!)
  const [pdfLoading, setPdfLoading] = useState(false)

  if (loading) return <Spinner message="Carregando roteiro..." />
  if (error || !itinerary) return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-center">
      <p className="mb-4 text-red-600">{error || 'Roteiro não encontrado'}</p>
      <Button onClick={() => navigate('/plan')}>Tentar novamente</Button>
    </div>
  )

  async function handleSave() {
    try {
      await save()
      toast.success('Viagem salva com sucesso!')
      navigate('/dashboard')
    } catch {
      toast.error('Erro ao salvar viagem')
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <button
        onClick={() => navigate('/plan')}
        className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        ← Voltar ao formulário
      </button>
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{itinerary.title}</h1>
          <p className="mt-1 text-gray-500">
            📍 {itinerary.destination} &nbsp;·&nbsp;
            📅 {formatDate(itinerary.start_date)} – {formatDate(itinerary.end_date)} &nbsp;·&nbsp;
            <Badge label={BUDGET_LABELS[itinerary.budget]} variant="planned" />
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            loading={pdfLoading}
            onClick={async () => {
              setPdfLoading(true)
              try {
                await downloadPdf(itinerary.id, itinerary.title)
              } catch {
                toast.error('Erro ao gerar PDF')
              } finally {
                setPdfLoading(false)
              }
            }}
          >
            ⬇ PDF
          </Button>
          {itinerary.status !== 'saved' && (
            <Button onClick={handleSave} loading={saving}>Salvar viagem</Button>
          )}
          {itinerary.status === 'saved' && (
            <Badge label="Salvo" variant={STATUS_BADGE['saved']} />
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
