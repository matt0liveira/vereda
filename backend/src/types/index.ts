import { Request } from 'express'
import { User } from '@supabase/supabase-js'

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

export interface Itinerary {
  id: string
  user_id: string
  title: string
  destination: string
  start_date: string
  end_date: string
  budget: 'economico' | 'moderado' | 'luxo'
  interests: string[]
  content: ItineraryContent
  status: 'draft' | 'saved' | 'error'
  created_at: string
  cover_image?: string
}

export interface GenerateItineraryRequest {
  destination: string
  start_date: string
  end_date: string
  budget: 'economico' | 'moderado' | 'luxo'
  interests: string[]
  title: string
  transport?: string
  accommodation?: string
  people_count?: number
  checkin_time?: string
  checkout_time?: string
  origin?: string
  notes?: string
}

export interface AuthRequest extends Request {
  user?: User
}
