import { supabase } from '@/lib/supabase'
import type { Listing, SearchFilters, PaginationParams } from '@/types'

export async function searchListings(
  filters: SearchFilters,
  pagination: PaginationParams
) {
  let query = supabase
    .from('listings')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // Apply filters
  if (filters.city) {
    query = query.eq('city', filters.city)
  }

  if (filters.location) {
    query = query.ilike('location', `%${filters.location}%`)
  }

  if (filters.price_min) {
    query = query.gte('price', filters.price_min)
  }

  if (filters.price_max) {
    query = query.lte('price', filters.price_max)
  }

  if (filters.bedrooms && filters.bedrooms.length > 0) {
    query = query.in('bedrooms', filters.bedrooms)
  }

  if (filters.property_type && filters.property_type.length > 0) {
    query = query.in('property_type', filters.property_type)
  }

  if (filters.has_photos_only) {
    query = query.eq('has_photos', true)
  }

  // Apply pagination
  const from = (pagination.page - 1) * pagination.limit
  const to = from + pagination.limit - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) throw error

  return {
    listings: data as Listing[],
    total: count || 0,
    page: pagination.page,
    totalPages: Math.ceil((count || 0) / pagination.limit)
  }
}

export async function getListingById(id: string) {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error) throw error
  return data as Listing
}

export async function getRecentListings(limit: number = 10) {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('is_active', true)
    .eq('is_verified', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as Listing[]
}

export async function getCities() {
  const { data, error } = await supabase
    .from('listings')
    .select('city')
    .eq('is_active', true)

  if (error) throw error

  // Get unique cities
  const uniqueCities = [...new Set(data.map(item => item.city))].sort()
  return uniqueCities
}

// Admin functions
export async function deleteListing(id: string) {
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function updateListing(id: string, data: Partial<Listing>) {
  const { data: updated, error } = await supabase
    .from('listings')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return updated as Listing
}

export async function createListing(data: Omit<Listing, 'id' | 'created_at' | 'updated_at'>) {
  const { data: created, error } = await supabase
    .from('listings')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return created as Listing
}