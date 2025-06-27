export interface Listing {
  id: string
  title: string
  price: number
  location: string
  city: string
  bedrooms: string // 'studio', '1', '2', '3', etc.
  property_type: 'apartment' | 'house' | 'condo' | 'room'
  has_photos: boolean
  listing_url?: string
  listing_source: string
  listing_source_id: string
  posted_date: string
  description?: string
  image_urls?: string[]
  contact_info?: string
  is_verified: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  subscription_tier: 'free' | 'premium'
  searches_today: number
  last_search_reset: string
  is_admin?: boolean
  auth_provider?: string
  created_at: string
  updated_at: string
}

export interface SavedSearch {
  id: string
  user_id: string
  filters: SearchFilters
  alert_enabled: boolean
  last_alert_sent?: string
  created_at: string
  updated_at: string
}

export interface SearchHistory {
  id: string
  user_id: string
  search_query: SearchFilters
  created_at: string
}

export interface SearchFilters {
  location?: string
  city?: string
  price_min?: number
  price_max?: number
  bedrooms?: string[]
  property_type?: Array<'apartment' | 'house' | 'condo' | 'room'>
  has_photos_only?: boolean
}

export interface PaginationParams {
  page: number
  limit: number
}

// Database type exports
export type PropertyType = 'apartment' | 'house' | 'condo' | 'room'
export type SubscriptionTier = 'free' | 'premium'