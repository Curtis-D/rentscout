import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { generalRateLimit } from '@/lib/rate-limit'
import { Database } from '@/types/supabase'

// Middleware to check admin status
async function checkAdmin(request: Request) {
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
    return { authorized: false, error: 'Unauthorized', status: 401 }
  }
  
  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  
  if (!profile?.is_admin) {
    return { authorized: false, error: 'Forbidden', status: 403 }
  }
  
  return { authorized: true, userId: user.id }
}

export async function GET(request: Request) {
  try {
    // Rate limiting
    const identifier = request.headers.get('x-forwarded-for') || 'anonymous'
    const { success } = generalRateLimit.check(identifier)
    
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }
    
    // Check admin
    const adminCheck = await checkAdmin(request)
    if (!adminCheck.authorized) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      )
    }
    
    // Fetch all listings for admin
    const { data: listings, error } = await supabaseAdmin
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Admin listings fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch listings' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ listings: listings || [] })
  } catch (error) {
    console.error('Admin listings API error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Rate limiting
    const identifier = request.headers.get('x-forwarded-for') || 'anonymous'
    const { success } = generalRateLimit.check(identifier)
    
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }
    
    // Check admin
    const adminCheck = await checkAdmin(request)
    if (!adminCheck.authorized) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      )
    }
    
    const listing = await request.json()
    
    // Validate required fields
    const requiredFields = ['title', 'price', 'location', 'city', 'bedrooms', 'property_type']
    for (const field of requiredFields) {
      if (!listing[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }
    
    // Create listing
    const { data, error } = await supabaseAdmin
      .from('listings')
      .insert({
        ...listing,
        listing_source: 'admin',
        is_verified: true
      })
      .select()
      .single()
    
    if (error) {
      console.error('Listing creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create listing' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ listing: data }, { status: 201 })
  } catch (error) {
    console.error('Create listing API error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}