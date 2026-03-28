import { useState, useEffect, useRef, useId } from 'react'
import { getImageSuggestions, uploadCoverImage } from '../../services/api'
import { Spinner } from './Spinner'

interface ImagePickerProps {
  destination: string
  value?: string
  itineraryId?: string
  onChange: (url: string) => void
  onFileSelected?: (file: File) => void
}

type Tab = 'suggestions' | 'upload'

interface Suggestion {
  url: string
  photographer: string
  pexels_page: string
}

function pexelsPhotoId(url: string): string | null {
  const m = url.match(/\/photos\/(\d+)\//)
  return m ? m[1] : null
}

function isSameImage(a: string | undefined, b: string): boolean {
  if (!a) return false
  if (a === b) return true
  const idA = pexelsPhotoId(a)
  const idB = pexelsPhotoId(b)
  return !!(idA && idB && idA === idB)
}

export function ImagePicker({ destination, value, itineraryId, onChange, onFileSelected }: ImagePickerProps) {
  const [tab, setTab] = useState<Tab>('suggestions')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [suggestionsError, setSuggestionsError] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [uploadLoading, setUploadLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const objectUrlRef = useRef<string | null>(null)
  const fileInputId = useId()

  useEffect(() => {
    if (!destination) return
    setSuggestionsLoading(true)
    setSuggestionsError('')
    getImageSuggestions(destination)
      .then(setSuggestions)
      .catch(() => setSuggestionsError('image_service_unavailable'))
      .finally(() => setSuggestionsLoading(false))
  }, [destination])

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    }
  }, [])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError('')

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Arquivo muito grande (máx. 5MB)')
      return
    }

    if (itineraryId) {
      setUploadLoading(true)
      try {
        const url = await uploadCoverImage(itineraryId, file)
        setPreviewUrl(url)
        onChange(url)
      } catch {
        setUploadError('Falha ao enviar imagem. Tente novamente.')
      } finally {
        setUploadLoading(false)
      }
    } else {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
      const objUrl = URL.createObjectURL(file)
      objectUrlRef.current = objUrl
      setPreviewUrl(objUrl)
      onChange(objUrl)
      onFileSelected?.(file)
    }
  }

  const tabClass = (t: Tab) =>
    `px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
      tab === t
        ? 'border-brand text-brand'
        : 'border-transparent text-content-muted hover:text-content'
    }`

  return (
    <div className="rounded-[12px] border-[1.5px] border-surface-border bg-surface-bg p-4">
      <p className="mb-3 text-[13px] font-semibold text-content">Imagem de capa</p>

      <div className="mb-4 flex gap-0 border-b border-surface-border">
        <button type="button" className={tabClass('suggestions')} onClick={() => setTab('suggestions')}>
          Sugestões
        </button>
        <button type="button" className={tabClass('upload')} onClick={() => setTab('upload')}>
          Minha foto
        </button>
      </div>

      {tab === 'suggestions' && (
        <div>
          {suggestionsLoading && (
            <div className="flex justify-center py-6">
              <Spinner message="Buscando sugestões..." />
            </div>
          )}
          {!suggestionsLoading && suggestionsError && (
            <p className="text-sm text-content-muted">
              Sugestões temporariamente indisponíveis. Você pode subir sua própria foto.
            </p>
          )}
          {!suggestionsLoading && !suggestionsError && suggestions.length === 0 && (
            <p className="text-sm text-content-muted">Nenhuma sugestão encontrada para este destino.</p>
          )}
          {!suggestionsLoading && !suggestionsError && suggestions.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {suggestions.map((s, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => onChange(s.url)}
                    className={`overflow-hidden rounded-[8px] border-2 transition-colors ${
                      isSameImage(value, s.url) ? 'border-brand' : 'border-transparent hover:border-surface-border'
                    }`}
                  >
                    <img src={s.url} alt={`Sugestão ${i + 1}`} className="h-[80px] w-full object-cover" />
                  </button>
                  <a
                    href={s.pexels_page}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-[10px] text-content-muted hover:text-content"
                  >
                    {s.photographer} / Pexels
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'upload' && (
        <div>
          <input
            id={fileInputId}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="sr-only"
          />
          <label
            htmlFor={fileInputId}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => {
              e.preventDefault()
              setDragging(false)
              const file = e.dataTransfer.files?.[0]
              if (file) handleFileChange({ target: { files: e.dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>)
            }}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[10px] border-2 border-dashed px-4 py-6 transition-colors ${
              dragging ? 'border-brand bg-brand-muted' : 'border-surface-border hover:border-brand hover:bg-brand-muted/40'
            }`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-content-muted">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p className="text-[13px] font-medium text-content-muted">
              {uploadLoading ? 'Enviando...' : 'Arraste uma imagem ou clique para selecionar'}
            </p>
            <p className="text-[11px] text-content-subtle">JPG, PNG, WebP ou GIF — máx. 5 MB</p>
          </label>
          {uploadError && <p className="mt-2 text-xs text-status-error-text">{uploadError}</p>}
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              className="mt-3 h-[80px] w-full rounded-[8px] object-cover"
            />
          )}
        </div>
      )}
    </div>
  )
}
