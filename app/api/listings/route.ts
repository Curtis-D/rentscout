import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { searchRateLimit } from '@/lib/rate-limit'
import { Database } from '@/types/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Rate limiting
    const identifier = request.headers.get('x-forwarded-for') || 'anonymous'
    const { success, remaining, resetAt } = searchRateLimit.check(identifier)
    
    if (!success) {
      return NextResponse.json(
        { 
          error: 'Too many requests. Please try again later.',
          resetAt: new Date(resetAt).toISOString()
        },
        { status: 429 }
      )
    }
    
    // Get user session
    const cookieStore = await cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.delete(name)
          },
        },
      }
    )
    const { data: { user } } = await supabase.auth.getUser()
    
    // Check if this is a new search (has filters)
    const hasFilters = searchParams.has('city') || 
                      searchParams.has('minPrice') || 
                      searchParams.has('maxPrice') ||
                      searchParams.has('bedrooms') ||
                      searchParams.has('propertyType')
    
    if (user && hasFilters) {
      // Check search limits for free users
      const { data: userProfile } = await supabaseAdmin
        .from('users')
        .select('subscription_tier, searches_today, last_search_reset')
        .eq('id', user.id)
        .single()
      
      if (userProfile?.subscription_tier === 'free') {
        // Reset daily searches if needed
        const lastReset = new Date(userProfile.last_search_reset)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        if (lastReset < today) {
          await supabaseAdmin
            .from('users')
            .update({ 
              searches_today: 0, 
              last_search_reset: new Date().toISOString() 
            })
            .eq('id', user.id)
          
          userProfile.searches_today = 0
        }
        
        // Check search limit
        if (userProfile.searches_today >= 3) {
          return NextResponse.json(
            { 
              error: 'Daily search limit reached. Upgrade to premium for unlimited searches.',
              searchLimitReached: true
            },
            { status: 403 }
          )
        }
        
        // Increment search count
        await supabaseAdmin
          .from('users')
          .update({ searches_today: userProfile.searches_today + 1 })
          .eq('id', user.id)
        
        // Log search history
        await supabaseAdmin
          .from('search_history')
          .insert({
            user_id: user.id,
            search_query: {
              city: searchParams.get('city'),
              minPrice: searchParams.get('minPrice'),
              maxPrice: searchParams.get('maxPrice'),
              bedrooms: searchParams.get('bedrooms'),
              propertyType: searchParams.get('propertyType')
            }
          })
      }
    }
    
    // Build query
    let query = supabaseAdmin
      .from('listings')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    // Apply filters
    if (searchParams.get('city')) {
      query = query.ilike('city', `%${searchParams.get('city')}%`)
    }
    
    if (searchParams.get('minPrice')) {
      query = query.gte('price', parseInt(searchParams.get('minPrice')!))
    }
    
    if (searchParams.get('maxPrice')) {
      query = query.lte('price', parseInt(searchParams.get('maxPrice')!))
    }
    
    if (searchParams.get('bedrooms')) {
      query = query.eq('bedrooms', searchParams.get('bedrooms'))
    }
    
    if (searchParams.get('propertyType')) {
      query = query.eq('property_type', searchParams.get('propertyType'))
    }
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20
    const from = (page - 1) * limit
    const to = from + limit - 1
    
    query = query.range(from, to)
    
    const { data: listings, error, count } = await query
    
    if (error) {
      console.error('Listings fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch listings' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        listings: listings || [],
        totalCount: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit)
      },
      {
        headers: {
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': new Date(resetAt).toISOString()
        }
      }
    )
  } catch (error) {
    console.error('Listings API error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}