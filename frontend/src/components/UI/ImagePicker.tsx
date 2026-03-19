import { useState, useEffect, useRef } from 'react'
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

export function ImagePicker({ destination, value, itineraryId, onChange, onFileSelected }: ImagePickerProps) {
  const [tab, setTab] = useState<Tab>('suggestions')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [suggestionsError, setSuggestionsError] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [uploadLoading, setUploadLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const objectUrlRef = useRef<string | null>(null)

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
                      value === s.url ? 'border-brand' : 'border-transparent hover:border-surface-border'
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
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="mb-2 text-sm text-content-muted"
          />
          {uploadError && <p className="mt-1 text-xs text-status-error-text">{uploadError}</p>}
          {uploadLoading && <p className="mt-2 text-sm text-content-muted">Enviando...</p>}
          {(previewUrl || (value && !value.startsWith('blob:') && itineraryId)) && (
            <img
              src={previewUrl || value}
              alt="Preview"
              className="mt-2 h-[80px] w-full rounded-[8px] object-cover"
            />
          )}
        </div>
      )}
    </div>
  )
}
