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

export async function updateItinerary(id: string, content: ItineraryContent): Promise<Itinerary> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_URL}/api/itineraries/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ content }),
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
