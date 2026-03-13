import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { generateItinerary } from '../services/api'
import { Budget, Interest, GenerateItineraryInput } from '../types'
import { Button } from '../components/UI/Button'
import { Input } from '../components/UI/Input'
import { Spinner } from '../components/UI/Spinner'

const INTERESTS: { value: Interest; label: string }[] = [
  { value: 'cultura', label: 'Cultura' },
  { value: 'gastronomia', label: 'Gastronomia' },
  { value: 'aventura', label: 'Aventura' },
  { value: 'kids-friendly', label: 'Kids Friendly' },
  { value: 'natureza', label: 'Natureza' },
  { value: 'compras', label: 'Compras' },
]

const BUDGETS: { value: Budget; label: string }[] = [
  { value: 'economico', label: 'Econômico' },
  { value: 'moderado', label: 'Moderado' },
  { value: 'luxo', label: 'Luxo' },
]

export default function PlanPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [slowWarning, setSlowWarning] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<GenerateItineraryInput>({
    title: '',
    destination: '',
    start_date: '',
    end_date: '',
    budget: 'moderado',
    interests: [],
  })

  function toggleInterest(interest: Interest) {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.title || !form.destination || !form.start_date || !form.end_date) {
      setError('Preencha todos os campos obrigatórios')
      return
    }

    setLoading(true)
    const timer = setTimeout(() => setSlowWarning(true), 8000)

    try {
      const itinerary = await generateItinerary(form)
      toast.success('Roteiro gerado com sucesso!')
      navigate(`/preview/${itinerary.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar roteiro')
      toast.error('Falha ao gerar roteiro')
    } finally {
      clearTimeout(timer)
      setLoading(false)
      setSlowWarning(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-center">
          <Spinner message="Gerando seu roteiro..." />
          {slowWarning && <p className="mt-2 text-sm text-gray-500">Ainda processando...</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Planejar Viagem</h1>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6 rounded-2xl bg-white p-8 shadow-lg">
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <Input label="Título da viagem" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required aria-label="Título" />
        <Input label="Destino" value={form.destination} onChange={e => setForm(p => ({ ...p, destination: e.target.value }))} required placeholder="Ex: Paris, França" aria-label="Destino" />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Data de início" type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} required aria-label="Data de início" />
          <Input label="Data de fim" type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} required aria-label="Data de fim" />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">Orçamento</p>
          <div className="flex gap-3">
            {BUDGETS.map(b => (
              <label key={b.value} className={`flex flex-1 cursor-pointer items-center justify-center rounded-lg border-2 py-2 text-sm font-medium transition-colors ${form.budget === b.value ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                <input type="radio" name="budget" value={b.value} checked={form.budget === b.value} onChange={() => setForm(p => ({ ...p, budget: b.value }))} className="sr-only" />
                {b.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">Interesses</p>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map(i => (
              <button
                key={i.value}
                type="button"
                onClick={() => toggleInterest(i.value)}
                className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${form.interests.includes(i.value) ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
              >
                {i.label}
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" className="mt-2 w-full py-3 text-base">Gerar Roteiro ✨</Button>
      </form>
    </div>
  )
}
