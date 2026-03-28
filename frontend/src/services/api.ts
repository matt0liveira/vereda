import { supabase } from '../lib/supabase'
import { GenerateItineraryInput, Itinerary, ItineraryContent } from '../types'

const API_URL = import.meta.env.VITE_API_URL || ''

async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  }
}

async function getAuthHeadersRaw(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')
  return { Authorization: `Bearer ${session.access_token}` }
}

export async function generateItinerary(input: GenerateItineraryInput): Promise<Itinerary> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_URL}/api/itineraries/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify(input),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Erro ao gerar roteiro')
  return data
}

export async function fetchItineraries(): Promise<Itinerary[]> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_URL}/api/itineraries`, { headers })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Erro ao buscar roteiros')
  return data
}

export async function fetchItinerary(id: string): Promise<Itinerary> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_URL}/api/itineraries/${id}`, { headers })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Roteiro não encontrado')
  return data
}

export async function updateItinerary(
  id: string,
  payload: { content?: ItineraryContent; cover_image?: string }
): Promise<Itinerary> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_URL}/api/itineraries/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Erro ao atualizar roteiro')
  return data
}

export async function saveItinerary(id: string): Promise<Itinerary> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_URL}/api/itineraries/${id}/save`, {
    method: 'POST',
    headers,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Erro ao salvar roteiro')
  return data
}

export async function deleteItinerary(id: string): Promise<void> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_URL}/api/itineraries/${id}`, {
    method: 'DELETE',
    headers,
  })
  if (!res.ok) throw new Error('Erro ao excluir roteiro')
}

export async function downloadPdf(id: string, filename: string): Promise<void> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_URL}/api/itineraries/${id}/pdf`, { headers })
  if (!res.ok) throw new Error('Erro ao gerar PDF')
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}

export async function regenerateItinerary(id: string, input: GenerateItineraryInput): Promise<Itinerary> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_URL}/api/itineraries/${id}/regenerate`, {
    method: 'POST',
    headers,
    body: JSON.stringify(input),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Erro ao gerar roteiro')
  return data
}

export async function getImageSuggestions(destination: string): Promise<
  { url: string; photographer: string; pexels_page: string }[]
> {
  const headers = await getAuthHeaders()
  const res = await fetch(
    `${API_URL}/api/images/suggestions?destination=${encodeURIComponent(destination)}`,
    { headers }
  )
  if (!res.ok) throw new Error('image_service_unavailable')
  return res.json()
}

export async function uploadCoverImage(itineraryId: string, file: File): Promise<string> {
  const headers = await getAuthHeadersRaw()
  const form = new FormData()
  form.append('file', file)
  form.append('itinerary_id', itineraryId)
  const res = await fetch(`${API_URL}/api/images/upload`, {
    method: 'POST',
    headers,
    body: form,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Upload failed')
  return data.url
}
