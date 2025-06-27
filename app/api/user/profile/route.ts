import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { generalRateLimit } from '@/lib/rate-limit'
import { Database } from '@/types/supabase'

export async function GET(request: Request) {
  try {
    // Rate limiting
    const identifier = request.headers.get('x-forwarded-for') || 'anonymous'
    const { success } = generalRateLimit.check(identifier)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }
    
    // Get authenticated user
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
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Fetch user profile
    const { data: profile, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (error) {
      console.error('Profile fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    // Rate limiting
    const identifier = request.headers.get('x-forwarded-for') || 'anonymous'
    const { success } = generalRateLimit.check(identifier)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }
    
    // Get authenticated user
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
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const updates = await request.json()
    
    // Validate updates - only allow certain fields
    const allowedFields = ['email'] // Add more as needed
    const filteredUpdates: any = {}
    
    for (const field of allowedFields) {
      if (field in updates) {
        filteredUpdates[field] = updates[field]
      }
    }
    
    // Prevent users from modifying sensitive fields
    delete filteredUpdates.subscription_tier
    delete filteredUpdates.is_admin
    delete filteredUpdates.searches_today
    
    // Update profile
    const { data: profile, error } = await supabaseAdmin
      .from('users')
      .update(filteredUpdates)
      .eq('id', user.id)
      .select()
      .single()
    
    if (error) {
      console.error('Profile update error:', error)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Profile update API error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}