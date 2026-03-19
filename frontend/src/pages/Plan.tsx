import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { generateItinerary, uploadCoverImage, updateItinerary } from '../services/api'
import { Budget, Interest, GenerateItineraryInput } from '../types'
import { Button } from '../components/UI/Button'
import { Input } from '../components/UI/Input'
import { Spinner } from '../components/UI/Spinner'
import { DestinationAutocomplete } from '../components/UI/DestinationAutocomplete'
import { ImagePicker } from '../components/UI/ImagePicker'

const INTERESTS: { value: Interest; label: string }[] = [
  { value: 'cultura', label: 'Cultura' },
  { value: 'gastronomia', label: 'Gastronomia' },
  { value: 'aventura', label: 'Aventura' },
  { value: 'kids-friendly', label: 'Kids Friendly' },
  { value: 'natureza', label: 'Natureza' },
  { value: 'compras', label: 'Compras' },
]

const BUDGETS: { value: Budget; label: string; description: string }[] = [
  { value: 'economico', label: 'Econômico', description: 'até R$\u00a0300/dia' },
  { value: 'moderado', label: 'Moderado', description: 'R$\u00a0300–800/dia' },
  { value: 'luxo', label: 'Luxo', description: 'acima de R$\u00a0800/dia' },
]

const FORM_KEY = 'travel-ai:plan-form'

function loadSavedForm(): GenerateItineraryInput {
  try {
    const saved = sessionStorage.getItem(FORM_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return { title: '', destination: '', start_date: '', end_date: '', budget: 'moderado', interests: [] }
}

export default function PlanPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [slowWarning, setSlowWarning] = useState(false)
  const [error, setError] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverUrl, setCoverUrl] = useState('')
  const [form, setForm] = useState<GenerateItineraryInput>(loadSavedForm)

  useEffect(() => {
    try {
      sessionStorage.setItem(FORM_KEY, JSON.stringify(form))
    } catch {}
  }, [form])

  function toggleInterest(interest: Interest) {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  function handleStartDateChange(value: string) {
    setForm(prev => ({
      ...prev,
      start_date: value,
      // Reset end_date if it's before the new start_date
      end_date: prev.end_date && prev.end_date < value ? '' : prev.end_date,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.title || !form.destination || !form.start_date || !form.end_date) {
      setError('Preencha todos os campos obrigatórios')
      return
    }

    if (form.end_date < form.start_date) {
      setError('A data de fim não pode ser anterior à data de início')
      return
    }

    setLoading(true)
    const timer = setTimeout(() => setSlowWarning(true), 8000)

    try {
      const itinerary = await generateItinerary(form)

      // Determine final cover_image
      let finalCoverUrl: string | undefined
      if (coverFile) {
        try {
          finalCoverUrl = await uploadCoverImage(itinerary.id, coverFile)
        } catch {
          toast('Não foi possível salvar a imagem de capa.', { icon: '⚠️' })
        }
      } else if (coverUrl && !coverUrl.startsWith('blob:')) {
        finalCoverUrl = coverUrl
      }

      if (finalCoverUrl) {
        try {
          await updateItinerary(itinerary.id, { cover_image: finalCoverUrl })
        } catch {
          // Non-blocking — itinerary was created successfully
        }
      }

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
          {slowWarning && <p className="mt-2 text-sm text-content-muted">Ainda processando...</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-[26px] font-extrabold tracking-[-0.7px] text-content">Planejar Viagem</h1>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6 rounded-[14px] border-[1.5px] border-surface-border bg-surface p-8">
        {error && (
          <div role="alert" className="flex items-center gap-2 rounded-lg border border-status-error-border bg-status-error-bg px-3.5 py-2.5">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-[13px] text-status-error-text">{error}</p>
          </div>
        )}

        <Input
          label="Título da viagem"
          value={form.title}
          onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
          required
          aria-label="Título"
        />

        <DestinationAutocomplete
          value={form.destination}
          onChange={dest => setForm(p => ({ ...p, destination: dest }))}
        />

        <ImagePicker
          destination={form.destination}
          value={coverUrl}
          onChange={setCoverUrl}
          onFileSelected={setCoverFile}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="start_date" className="mb-1.5 block text-[13px] font-semibold text-content">
              Data de início <span className="text-status-error-text">*</span>
            </label>
            <input
              id="start_date"
              type="date"
              value={form.start_date}
              onChange={e => handleStartDateChange(e.target.value)}
              required
              aria-label="Data de início"
              className="w-full rounded-[9px] border-[1.5px] px-3.5 py-2.5 text-sm text-content outline-none transition-colors placeholder:text-content-subtle border-surface-border bg-surface-bg focus:border-brand focus:bg-surface"
            />
          </div>
          <div>
            <label htmlFor="end_date" className="mb-1.5 block text-[13px] font-semibold text-content">
              Data de fim <span className="text-status-error-text">*</span>
            </label>
            <input
              id="end_date"
              type="date"
              value={form.end_date}
              min={form.start_date || undefined}
              onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))}
              required
              aria-label="Data de fim"
              className="w-full rounded-[9px] border-[1.5px] px-3.5 py-2.5 text-sm text-content outline-none transition-colors placeholder:text-content-subtle border-surface-border bg-surface-bg focus:border-brand focus:bg-surface disabled:cursor-not-allowed disabled:bg-surface-bg disabled:text-content-muted"
            />
            {form.start_date && form.end_date && form.end_date < form.start_date && (
              <p className="mt-1 text-xs text-status-error-text">A data de fim deve ser igual ou posterior à de início</p>
            )}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[1px] text-content-subtle">Orçamento</p>
          <div className="flex gap-3">
            {BUDGETS.map(b => (
              <label
                key={b.value}
                className={`flex flex-1 cursor-pointer flex-col items-center justify-center rounded-[10px] border-[1.5px] px-[10px] py-[14px] text-center transition-colors ${
                  form.budget === b.value
                    ? 'border-brand bg-brand-muted'
                    : 'border-surface-border bg-surface-bg'
                }`}
              >
                <input
                  type="radio"
                  name="budget"
                  value={b.value}
                  checked={form.budget === b.value}
                  onChange={() => setForm(p => ({ ...p, budget: b.value }))}
                  className="sr-only"
                />
                <span className={`text-[13px] font-bold ${form.budget === b.value ? 'text-brand-dark' : 'text-content'}`}>{b.label}</span>
                <span className={`mt-0.5 text-[11px] ${form.budget === b.value ? 'text-brand' : 'text-content-subtle'}`}>
                  {b.description}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[1px] text-content-subtle">Interesses</p>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map(i => (
              <button
                key={i.value}
                type="button"
                onClick={() => toggleInterest(i.value)}
                className={`rounded-[20px] border-[1.5px] px-[14px] py-[7px] text-[13px] font-medium transition-colors ${
                  form.interests.includes(i.value)
                    ? 'border-brand bg-brand-muted text-brand-muted-text font-semibold'
                    : 'border-surface-border bg-surface-bg text-content-muted hover:border-surface-border-filled hover:text-content'
                }`}
              >
                {i.label}
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" className="mt-2 w-full py-3 gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" fill="white" stroke="white"/>
          </svg>
          Gerar Roteiro
        </Button>
      </form>
    </div>
  )
}
