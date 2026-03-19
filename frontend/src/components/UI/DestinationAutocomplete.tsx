import { useState, useEffect, useRef } from 'react'

interface Suggestion {
  display_name: string
  place_id: number
}

interface Props {
  value: string
  onChange: (value: string) => void
}

export function DestinationAutocomplete({ value, onChange }: Props) {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Sync external value reset
  useEffect(() => {
    setQuery(value)
  }, [value])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    onChange('') // clear selection until user picks from list

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (val.length < 2) {
      setSuggestions([])
      setOpen(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&limit=7&featuretype=city&addressdetails=1&accept-language=pt-BR`,
          { headers: { 'Accept-Language': 'pt-BR' } }
        )
        const data: Array<{ display_name: string; place_id: number; type: string; class: string }> = await res.json()

        // Prefer cities, towns, administrative areas
        const filtered = data
          .filter(d => ['city', 'town', 'village', 'municipality', 'administrative'].includes(d.type) || d.class === 'place' || d.class === 'boundary')
          .slice(0, 6)

        setSuggestions(filtered.length > 0 ? filtered : data.slice(0, 6))
        setOpen(filtered.length > 0 || data.length > 0)
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 400)
  }

  function handleSelect(suggestion: Suggestion) {
    // Format: "City, Country" from display_name (which is comma-separated)
    const parts = suggestion.display_name.split(',').map(s => s.trim())
    const city = parts[0]
    const country = parts[parts.length - 1]
    const formatted = parts.length > 1 ? `${city}, ${country}` : city

    setQuery(formatted)
    onChange(formatted)
    setSuggestions([])
    setOpen(false)
  }

  function formatSuggestion(display_name: string): { main: string; sub: string } {
    const parts = display_name.split(',').map(s => s.trim())
    const main = parts[0]
    const sub = parts.slice(1).join(', ')
    return { main, sub }
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-1.5 block text-[13px] font-semibold text-content">
        Destino <span className="text-status-error-text">*</span>
      </label>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Digite a cidade ou destino..."
          required
          aria-label="Destino"
          autoComplete="off"
          className="w-full border-[1.5px] border-surface-border bg-surface-bg rounded-[9px] px-3.5 py-2.5 pr-8 text-sm text-content outline-none focus:border-brand placeholder:text-content-subtle"
        />
        {loading && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          </div>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute top-[calc(100%+4px)] left-0 right-0 bg-surface border-[1.5px] border-surface-border rounded-[10px] shadow-[0_8px_24px_rgba(0,0,0,0.1)] z-10 overflow-hidden">
          {suggestions.map(s => {
            const { main, sub } = formatSuggestion(s.display_name)
            return (
              <li key={s.place_id}>
                <button
                  type="button"
                  onMouseDown={() => handleSelect(s)}
                  className="px-3.5 py-2.5 text-[13px] text-content cursor-pointer flex items-center gap-2.5 w-full text-left hover:bg-brand-muted focus:bg-brand-muted focus:outline-none"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-content-muted shrink-0"
                  >
                    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span className="flex flex-col">
                    <span className="font-normal">{main}</span>
                    {sub && <span className="truncate text-xs text-content-muted">{sub}</span>}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
