import { supabase } from '@/lib/supabase'
import type { User, SavedSearch, SearchFilters } from '@/types'

export async function createUser(userId: string, email: string, authProvider: string = 'email') {
  const { data, error } = await supabase
    .from('users')
    .insert({ 
      id: userId, 
      email,
      auth_provider: authProvider 
    })
    .select()
    .single()

  if (error) throw error
  return data as User
}

export async function getUser(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned - user doesn't exist yet
      return null
    }
    throw error
  }
  return data as User
}

export async function checkAndResetDailySearches(userId: string) {
  const user = await getUser(userId)
  
  if (!user) {
    throw new Error('User not found')
  }
  
  const lastReset = new Date(user.last_search_reset)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Reset if last reset was before today
  if (lastReset < today) {
    const { error } = await supabase
      .from('users')
      .update({ 
        searches_today: 0,
        last_search_reset: new Date().toISOString()
      })
      .eq('id', userId)
    
    if (error) throw error
    return { ...user, searches_today: 0 }
  }
  
  return user
}

export async function incrementSearchCount(userId: string) {
  const { data: user } = await supabase
    .from('users')
    .select('searches_today')
    .eq('id', userId)
    .single()
  
  if (user) {
    const { error } = await supabase
      .from('users')
      .update({ searches_today: user.searches_today + 1 })
      .eq('id', userId)
    
    if (error) throw error
  }
}

export async function recordSearch(userId: string, searchQuery: SearchFilters) {
  const { error } = await supabase
    .from('search_history')
    .insert({ user_id: userId, search_query: searchQuery })
  
  if (error) throw error
}

export async function canUserSearch(userId: string): Promise<boolean> {
  const user = await checkAndResetDailySearches(userId)
  
  if (user.subscription_tier === 'premium') {
    return true
  }
  
  const FREE_SEARCH_LIMIT = parseInt(process.env.NEXT_PUBLIC_FREE_SEARCHES_PER_DAY || '3')
  return user.searches_today < FREE_SEARCH_LIMIT
}

export async function getSavedSearches(userId: string) {
  const { data, error } = await supabase
    .from('saved_searches')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as SavedSearch[]
}

export async function createSavedSearch(
  userId: string, 
  filters: SearchFilters, 
  alertEnabled: boolean = false
) {
  const { data, error } = await supabase
    .from('saved_searches')
    .insert({ 
      user_id: userId, 
      filters, 
      alert_enabled: alertEnabled 
    })
    .select()
    .single()

  if (error) throw error
  return data as SavedSearch
}

export async function updateSavedSearch(
  searchId: string,
  updates: Partial<SavedSearch>
) {
  const { data, error } = await supabase
    .from('saved_searches')
    .update(updates)
    .eq('id', searchId)
    .select()
    .single()

  if (error) throw error
  return data as SavedSearch
}

export async function deleteSavedSearch(searchId: string) {
  const { error } = await supabase
    .from('saved_searches')
    .delete()
    .eq('id', searchId)

  if (error) throw error
}