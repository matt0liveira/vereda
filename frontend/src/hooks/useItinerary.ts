import { useState, useEffect, useRef } from 'react'
import { Itinerary, ItineraryContent } from '../types'
import { fetchItinerary, updateItinerary, saveItinerary } from '../services/api'

export function useItinerary(id: string) {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetchItinerary(id)
      .then(setItinerary)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [id])

  function updateActivity(activityId: string, changes: Partial<{ title: string; description: string }>) {
    if (!itinerary) return

    const newContent: ItineraryContent = {
      days: itinerary.content.days.map(day => ({
        ...day,
        activities: day.activities.map(act =>
          act.id === activityId ? { ...act, ...changes } : act
        ),
      })),
    }

    setItinerary(prev => prev ? { ...prev, content: newContent } : null)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      updateItinerary(id, newContent).catch(e => setError(e.message))
    }, 500)
  }

  function deleteActivity(dayIndex: number, activityId: string) {
    if (!itinerary) return

    const newContent: ItineraryContent = {
      days: itinerary.content.days.map((day, i) =>
        i === dayIndex
          ? { ...day, activities: day.activities.filter(a => a.id !== activityId) }
          : day
      ),
    }

    setItinerary(prev => prev ? { ...prev, content: newContent } : null)
    updateItinerary(id, newContent).catch(e => setError(e.message))
  }

  async function save() {
    setSaving(true)
    try {
      const updated = await saveItinerary(id)
      setItinerary(updated)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erro ao salvar'
      setError(message)
      throw new Error(message)  // re-throw so caller can handle
    } finally {
      setSaving(false)
    }
  }

  return { itinerary, loading, saving, error, updateActivity, deleteActivity, save }
}
