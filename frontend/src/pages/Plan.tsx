import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { generateItinerary, regenerateItinerary, fetchItinerary, uploadCoverImage, updateItinerary } from '../services/api'
import { Budget, Interest, Transport, Accommodation, GenerateItineraryInput } from '../types'
import { Button } from '../components/UI/Button'
import { Input } from '../components/UI/Input'
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

const TRANSPORTS: { value: Transport; label: string }[] = [
  { value: 'metro-onibus', label: 'Metrô/Ônibus' },
  { value: 'uber-taxi', label: 'Uber/Táxi' },
  { value: 'carro-proprio', label: 'Carro próprio' },
  { value: 'aluguel-carro', label: 'Aluguel de carro' },
]

const ACCOMMODATIONS: { value: Accommodation; label: string }[] = [
  { value: 'hostel', label: 'Hostel' },
  { value: 'airbnb', label: 'Airbnb' },
  { value: 'pousada', label: 'Pousada' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'resort', label: 'Resort' },
  { value: 'casa-conhecidos', label: 'Casa de Conhecidos' },
]

const FORM_KEY = 'travel-ai:plan-form'

interface Tip { title: string; text: string }

function LoadingScreen({ tips, slowWarning }: { tips: Tip[]; slowWarning: boolean }) {
  const [tipIndex, setTipIndex] = useState(0)
  const [visible,  setVisible]  = useState(true)

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setTipIndex(i => (i + 1) % tips.length)
        setVisible(true)
      }, 400)
    }, 5000)
    return () => clearInterval(id)
  }, [tips.length])

  const tip = tips[tipIndex]

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Spinner + status */}
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <div className="relative h-12 w-12">
            <svg className="absolute inset-0 h-12 w-12 animate-spin" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" className="text-surface-border" />
              <path d="M24 4 a20 20 0 0 1 20 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-brand" />
            </svg>
          </div>
          <div>
            <p className="text-[17px] font-bold text-content">Gerando seu roteiro...</p>
            <p className="mt-1 text-[13px] text-content-muted">
              {slowWarning ? 'Isso pode levar mais alguns segundos.' : 'Personalizando cada detalhe para você.'}
            </p>
          </div>
        </div>

        {/* Tip */}
        <div
          className="rounded-[14px] border border-surface-border bg-surface px-5 py-4"
          style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease' }}
        >
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[1px] text-content-subtle">{tip.title}</p>
          <p className="text-[13px] leading-relaxed text-content-muted">{tip.text}</p>
        </div>

      </div>
    </div>
  )
}

function loadSavedForm(): GenerateItineraryInput {
  try {
    const saved = sessionStorage.getItem(FORM_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return { title: '', destination: '', start_date: '', end_date: '', budget: 'moderado', interests: [], transport: undefined, accommodation: undefined, people_count: 1 }
}

export default function PlanPage() {
  const navigate = useNavigate()
  const { id: editId } = useParams<{ id?: string }>()
  const isEditing = Boolean(editId)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [slowWarning, setSlowWarning] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set())
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverUrl, setCoverUrl] = useState('')
  const [form, setForm] = useState<GenerateItineraryInput>(
    isEditing
      ? () => ({ title: '', destination: '', start_date: '', end_date: '', budget: 'moderado', interests: [], transport: undefined, accommodation: undefined, people_count: 1 })
      : loadSavedForm
  )

  useEffect(() => {
    if (!isEditing) return
    fetchItinerary(editId!).then(it => {
      setForm({
        title: it.title,
        destination: it.destination,
        start_date: it.start_date,
        end_date: it.end_date,
        budget: it.budget as Budget,
        interests: it.interests as Interest[],
        transport: (it as any).transport
          ? (Array.isArray((it as any).transport) ? (it as any).transport : [(it as any).transport])
          : undefined,
        accommodation: (it as any).accommodation ?? undefined,
        people_count: (it as any).people_count ?? undefined,
        checkin_time: (it as any).checkin_time ?? undefined,
        checkout_time: (it as any).checkout_time ?? undefined,
        origin: (it as any).origin ?? undefined,
        notes: (it as any).notes ?? undefined,
      })
      if (it.cover_image) setCoverUrl(it.cover_image)
    }).catch(() => toast.error('Erro ao carregar roteiro'))
  }, [editId, isEditing])

  useEffect(() => {
    if (isEditing) return
    try { sessionStorage.setItem(FORM_KEY, JSON.stringify(form)) } catch {}
  }, [form, isEditing])

  function toggleInterest(interest: Interest) {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  function handleStartDateChange(value: string) {
    setError('')
    setForm(prev => ({
      ...prev,
      start_date: value,
      end_date: prev.end_date && prev.end_date < value ? '' : prev.end_date,
    }))
  }

  function handleEndDateChange(value: string) {
    setError('')
    setForm(prev => ({ ...prev, end_date: value }))
  }

  function handleNextStep(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const missing = new Set<string>()
    if (!form.title) missing.add('title')
    if (!form.destination) missing.add('destination')
    if (!form.start_date) missing.add('start_date')
    if (!form.end_date) missing.add('end_date')
    setFieldErrors(missing)
    if (missing.size > 0) {
      setError('Preencha todos os campos obrigatórios')
      return
    }
    if (form.end_date < form.start_date) {
      setError('A data de fim não pode ser anterior à data de início')
      return
    }
    setFieldErrors(new Set())
    setStep(2)
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    setError('')
    setLoading(true)
    const timer = setTimeout(() => setSlowWarning(true), 8000)

    try {
      const itinerary = isEditing
        ? await regenerateItinerary(editId!, form)
        : await generateItinerary(form)

      let finalCoverUrl: string | undefined
      if (coverFile) {
        try {
          finalCoverUrl = await uploadCoverImage(itinerary.id, coverFile)
        } catch {
          toast('Não foi possível salvar a imagem de capa.')
        }
      } else if (coverUrl && !coverUrl.startsWith('blob:')) {
        finalCoverUrl = coverUrl
      }

      if (finalCoverUrl) {
        try { await updateItinerary(itinerary.id, { cover_image: finalCoverUrl }) } catch {}
      }

      if (!isEditing) sessionStorage.removeItem(FORM_KEY)
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

  const TIPS = [
    { title: 'Melhor época para viajar', text: 'Pesquise o clima do destino com antecedência. Viajar na baixa temporada costuma ser mais econômico e bem menos movimentado.' },
    { title: 'Documentação e seguro', text: 'Verifique a validade do passaporte com pelo menos 6 meses de antecedência. Um seguro viagem evita surpresas desagradáveis.' },
    { title: 'Dinheiro e pagamentos', text: 'Avise seu banco sobre a viagem e sempre leve um pouco de moeda local em espécie para os primeiros gastos ao chegar.' },
    { title: 'Bagagem inteligente', text: 'Prefira roupas versáteis que combinem entre si. Mala leve significa mais mobilidade e menos taxas de bagagem.' },
    { title: 'Transporte local', text: 'Aplicativos como Google Maps e Moovit funcionam offline. Conhecer o transporte público local economiza tempo e dinheiro.' },
    { title: 'Gastronomia local', text: 'A comida de rua e os restaurantes frequentados por moradores costumam ser mais autênticos e acessíveis que os turísticos.' },
    { title: 'Segurança em viagem', text: 'Guarde cópias digitais dos seus documentos em nuvem e compartilhe seu itinerário com alguém de confiança.' },
    { title: 'Reservas antecipadas', text: 'Atrações muito procuradas esgotam os ingressos com dias de antecedência. Reserve online para não perder nada.' },
  ]

  if (loading) {
    return <LoadingScreen tips={TIPS} slowWarning={slowWarning} />
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-6 text-[26px] font-extrabold tracking-[-0.7px] text-content">
        {isEditing ? 'Editar Roteiro' : 'Planejar Viagem'}
      </h1>

      {/* Progress indicator */}
      <div className="mb-8 flex items-center gap-3">
        {([{ n: 1, label: 'Destino & Datas' }, { n: 2, label: 'Preferências' }, { n: 3, label: 'Resumo' }] as const).map(({ n, label }) => (
          <div key={n} className="flex items-center gap-3">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-bold transition-colors ${
              step >= n ? 'bg-brand text-white' : 'bg-surface-border text-content-muted'
            }`}>
              {step > n ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : n}
            </div>
            <span className={`text-[13px] font-semibold transition-colors ${step >= n ? 'text-content' : 'text-content-muted'}`}>
              {label}
            </span>
            {n < 3 && <div className={`h-px w-8 transition-colors ${step > n ? 'bg-brand' : 'bg-surface-border'}`} />}
          </div>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div role="alert" className="mb-4 flex items-center gap-2 rounded-lg border border-status-error-border bg-status-error-bg px-3.5 py-2.5">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p className="text-[13px] text-status-error-text">{error}</p>
        </div>
      )}

      {/* Step 1 */}
      {step === 1 && (
        <form onSubmit={handleNextStep} noValidate className="flex flex-col gap-6 rounded-[14px] border-[1.5px] border-surface-border bg-surface p-8">
          <Input
            label="Título da viagem"
            value={form.title}
            onChange={e => { setFieldErrors(prev => { const s = new Set(prev); s.delete('title'); return s }); setError(''); setForm(p => ({ ...p, title: e.target.value })) }}
            required
            aria-label="Título"
            error={fieldErrors.has('title') ? 'Preencha o título' : undefined}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <DestinationAutocomplete
              label="Origem"
              value={form.origin ?? ''}
              onChange={origin => setForm(p => ({ ...p, origin: origin || undefined }))}
            />
            <div>
              <DestinationAutocomplete
                label="Destino"
                required
                value={form.destination}
                onChange={dest => { setFieldErrors(prev => { const s = new Set(prev); s.delete('destination'); return s }); setError(''); setForm(p => ({ ...p, destination: dest })) }}
                hasError={fieldErrors.has('destination')}
              />
              {fieldErrors.has('destination') && (
                <p className="mt-1 text-xs text-status-error-text">Preencha o destino</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="start_date" className="mb-1.5 block text-[13px] font-semibold text-content">
                Data de início <span className="text-status-error-text">*</span>
              </label>
              <input
                id="start_date"
                type="date"
                value={form.start_date}
                onChange={e => { setFieldErrors(prev => { const s = new Set(prev); s.delete('start_date'); return s }); handleStartDateChange(e.target.value) }}
                required
                aria-label="Data de início"
                className={`w-full rounded-[9px] border-[1.5px] px-3.5 py-2.5 text-sm text-content outline-none transition-colors placeholder:text-content-subtle ${fieldErrors.has('start_date') ? 'border-status-error-text bg-surface' : 'border-surface-border bg-surface-bg focus:border-brand focus:bg-surface'}`}
              />
              {fieldErrors.has('start_date') && (
                <p className="mt-1 text-xs text-status-error-text">Preencha a data de início</p>
              )}
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
                onChange={e => { setFieldErrors(prev => { const s = new Set(prev); s.delete('end_date'); return s }); handleEndDateChange(e.target.value) }}
                required
                aria-label="Data de fim"
                className={`w-full rounded-[9px] border-[1.5px] px-3.5 py-2.5 text-sm text-content outline-none transition-colors placeholder:text-content-subtle ${fieldErrors.has('end_date') ? 'border-status-error-text bg-surface' : 'border-surface-border bg-surface-bg focus:border-brand focus:bg-surface'}`}
              />
              {fieldErrors.has('end_date') && (
                <p className="mt-1 text-xs text-status-error-text">Preencha a data de fim</p>
              )}
              {form.start_date && form.end_date && form.end_date < form.start_date && (
                <p className="mt-1 text-xs text-status-error-text">A data de fim deve ser igual ou posterior à de início</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="checkin_time" className="mb-1.5 block text-[13px] font-semibold text-content">
                Horário de check-in
              </label>
              <input
                id="checkin_time"
                type="time"
                value={form.checkin_time ?? ''}
                onChange={e => setForm(p => ({ ...p, checkin_time: e.target.value || undefined }))}
                aria-label="Horário de check-in"
                className="w-full rounded-[9px] border-[1.5px] px-3.5 py-2.5 text-sm text-content outline-none transition-colors border-surface-border bg-surface-bg focus:border-brand focus:bg-surface"
              />
            </div>
            <div>
              <label htmlFor="checkout_time" className="mb-1.5 block text-[13px] font-semibold text-content">
                Horário de check-out
              </label>
              <input
                id="checkout_time"
                type="time"
                value={form.checkout_time ?? ''}
                onChange={e => setForm(p => ({ ...p, checkout_time: e.target.value || undefined }))}
                aria-label="Horário de check-out"
                className="w-full rounded-[9px] border-[1.5px] px-3.5 py-2.5 text-sm text-content outline-none transition-colors border-surface-border bg-surface-bg focus:border-brand focus:bg-surface"
              />
            </div>
          </div>

          <ImagePicker
            destination={form.destination}
            value={coverUrl}
            onChange={setCoverUrl}
            onFileSelected={setCoverFile}
          />

          <Button type="submit" className="mt-2 w-full py-3 gap-2">
            Próximo
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </Button>
        </form>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <form onSubmit={e => {
          e.preventDefault()
          const missing: string[] = []
          if (!form.transport?.length) missing.push('transporte')
          if (!form.accommodation) missing.push('hospedagem')
          if (!form.budget) missing.push('orçamento')
          if (!form.interests.length) missing.push('interesses')
          if (missing.length > 0) {
            setError(`Selecione: ${missing.join(', ')}`)
            return
          }
          setError('')
          setStep(3)
        }} noValidate className="flex flex-col gap-6 rounded-[14px] border-[1.5px] border-surface-border bg-surface p-8">

          {/* Transport */}
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[1px] text-content-subtle">
              Transporte durante a viagem <span className="text-status-error-text normal-case tracking-normal">*</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {TRANSPORTS.map(t => {
                const selected = form.transport?.includes(t.value) ?? false
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setForm(p => {
                      const cur = p.transport ?? []
                      const next = cur.includes(t.value)
                        ? cur.filter(v => v !== t.value)
                        : [...cur, t.value]
                      return { ...p, transport: next.length ? next : undefined }
                    })}
                    className={`rounded-[20px] border-[1.5px] px-[14px] py-[7px] text-[13px] font-medium transition-colors ${
                      selected
                        ? 'border-brand bg-brand-muted text-brand-muted-text font-semibold'
                        : 'border-surface-border bg-surface-bg text-content-muted hover:border-surface-border-filled hover:text-content'
                    }`}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Accommodation */}
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[1px] text-content-subtle">
              Hospedagem <span className="text-status-error-text normal-case tracking-normal">*</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {ACCOMMODATIONS.map(a => (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, accommodation: p.accommodation === a.value ? undefined : a.value }))}
                  className={`rounded-[20px] border-[1.5px] px-[14px] py-[7px] text-[13px] font-medium transition-colors ${
                    form.accommodation === a.value
                      ? 'border-brand bg-brand-muted text-brand-muted-text font-semibold'
                      : 'border-surface-border bg-surface-bg text-content-muted hover:border-surface-border-filled hover:text-content'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[1px] text-content-subtle">
              Orçamento <span className="text-status-error-text normal-case tracking-normal">*</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {BUDGETS.map(b => (
                <button
                  key={b.value}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, budget: b.value }))}
                  className={`rounded-[20px] border-[1.5px] px-[14px] py-[7px] text-[13px] font-medium transition-colors ${
                    form.budget === b.value
                      ? 'border-brand bg-brand-muted text-brand-muted-text font-semibold'
                      : 'border-surface-border bg-surface-bg text-content-muted hover:border-surface-border-filled hover:text-content'
                  }`}
                >
                  {b.label}
                  <span className={`ml-1.5 text-[11px] font-normal ${form.budget === b.value ? 'text-brand' : 'text-content-subtle'}`}>
                    {b.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[1px] text-content-subtle">
              Interesses <span className="text-status-error-text normal-case tracking-normal">*</span>
            </p>
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

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="mb-1.5 block text-[13px] font-semibold text-content">
              Observações
            </label>
            <p className="mb-2 text-[12px] text-content-muted">Horários preferidos, tipo de passeio, preferências alimentares, restrições, etc.</p>
            <textarea
              id="notes"
              value={form.notes ?? ''}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value || undefined }))}
              placeholder="Ex: Prefiro sair às 9h, gosto de comida italiana, sou vegetariano..."
              rows={4}
              aria-label="Observações"
              className="w-full resize-none rounded-[9px] border-[1.5px] px-3.5 py-2.5 text-sm text-content outline-none transition-colors placeholder:text-content-subtle border-surface-border bg-surface-bg focus:border-brand focus:bg-surface"
            />
          </div>

          {/* People count */}
          <div>
            <p className="mb-2 text-[13px] font-semibold text-content">Número de pessoas</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, people_count: Math.max(1, (p.people_count ?? 1) - 1) }))}
                disabled={(form.people_count ?? 1) <= 1}
                className="flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-surface-border text-lg font-medium text-content-muted transition-colors hover:border-brand hover:text-brand disabled:opacity-30"
                aria-label="Diminuir"
              >
                −
              </button>
              <span className="w-8 text-center text-[15px] font-semibold text-content">
                {form.people_count ?? '—'}
              </span>
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, people_count: Math.min(50, (p.people_count ?? 0) + 1) }))}
                disabled={(form.people_count ?? 0) >= 50}
                className="flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-surface-border text-lg font-medium text-content-muted transition-colors hover:border-brand hover:text-brand disabled:opacity-30"
                aria-label="Aumentar"
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-2 flex gap-3">
            <Button type="button" variant="secondary" className="flex-1 py-3 gap-2" onClick={() => { setStep(1); setError('') }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
              Voltar
            </Button>
            <Button type="submit" className="flex-1 py-3 gap-2">
              Próximo
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Button>
          </div>
        </form>
      )}

      {/* Step 3 — Resumo */}
      {step === 3 && (() => {
        const transportLabels = form.transport?.length
          ? TRANSPORTS.filter(t => form.transport!.includes(t.value)).map(t => t.label).join(', ')
          : null
        const accommodation = ACCOMMODATIONS.find(a => a.value === form.accommodation)
        const budget = BUDGETS.find(b => b.value === form.budget)
        const interests = INTERESTS.filter(i => form.interests.includes(i.value))
        const formatDate = (d: string) => d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '—'

        const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
          <div className="flex items-start justify-between gap-4 py-3 border-b border-surface-border last:border-0">
            <span className="text-[12px] font-bold uppercase tracking-[0.8px] text-content-subtle w-32 shrink-0">{label}</span>
            <span className="text-[14px] text-content text-right">{value}</span>
          </div>
        )

        return (
          <div className="rounded-[14px] border-[1.5px] border-surface-border bg-surface p-8">
            <p className="mb-4 text-[13px] text-content-muted">Confira os detalhes antes de gerar o roteiro.</p>

            {(coverUrl && !coverUrl.startsWith('blob:')) || coverUrl.startsWith('blob:') ? (
              <img src={coverUrl} alt="Capa" className="mb-4 h-[140px] w-full rounded-[10px] object-cover" />
            ) : null}

            <div>
              <Row label="Título" value={form.title} />
              <Row label="Origem" value={form.origin ?? '—'} />
              <Row label="Destino" value={form.destination} />
              <Row label="Período" value={`${formatDate(form.start_date)} → ${formatDate(form.end_date)}`} />
              <Row label="Orçamento" value={budget ? `${budget.label} (${budget.description})` : '—'} />
              <Row label="Interesses" value={interests.length > 0 ? interests.map(i => i.label).join(', ') : '—'} />
              <Row label="Transporte" value={transportLabels ?? '—'} />
              <Row label="Hospedagem" value={accommodation ? accommodation.label : '—'} />
              <Row label="Check-in" value={form.checkin_time ?? '—'} />
              <Row label="Check-out" value={form.checkout_time ?? '—'} />
              <Row label="Pessoas" value={form.people_count ? String(form.people_count) : '—'} />
              {form.notes && <Row label="Observações" value={form.notes} />}
            </div>

            <div className="mt-6 flex gap-3">
              <Button type="button" variant="secondary" className="flex-1 py-3 gap-2" onClick={() => setStep(2)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                </svg>
                Voltar
              </Button>
              <Button className="flex-1 py-3 gap-2" onClick={() => handleSubmit()}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" fill="white" stroke="white"/>
                </svg>
                {isEditing ? 'Regerar Roteiro' : 'Gerar Roteiro'}
              </Button>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
