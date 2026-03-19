export interface Activity {
  id: string
  time: string
  title: string
  description: string
  location: {
    name: string
    address: string
    mapsUrl: string
  }
}

export interface Day {
  day: number
  date: string
  activities: Activity[]
}

export interface ItineraryContent {
  days: Day[]
}

export type Budget = 'economico' | 'moderado' | 'luxo'
export type Interest = 'cultura' | 'gastronomia' | 'aventura' | 'kids-friendly' | 'natureza' | 'compras'

export interface Itinerary {
  id: string
  user_id: string
  title: string
  destination: string
  start_date: string
  end_date: string
  budget: Budget
  interests: Interest[]
  content: ItineraryContent
  status: 'draft' | 'saved' | 'error'
  created_at: string
  cover_image?: string
}

export interface GenerateItineraryInput {
  title: string
  destination: string
  start_date: string
  end_date: string
  budget: Budget
  interests: Interest[]
  cover_image?: string
}
