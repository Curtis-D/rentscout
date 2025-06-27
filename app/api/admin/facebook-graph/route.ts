import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { GraphAPIFetcher } from '@/lib/facebook-graph/fetcher'
import { Database } from '@/types/supabase'

// Check if user is admin
async function checkAdmin() {
  const cookieStore = await cookies()
  
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
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

export async function POST(request: Request) {
  try {
    // Check admin
    const adminCheck = await checkAdmin()
    if (!adminCheck.authorized) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      )
    }
    
    // Get Facebook access token from environment or request
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN
    
    if (!accessToken) {
      return NextResponse.json(
        { 
          error: 'Facebook access token not configured',
          instructions: 'Please set FACEBOOK_ACCESS_TOKEN in your environment variables'
        },
        { status: 400 }
      )
    }
    
    // Create fetcher and run
    const fetcher = new GraphAPIFetcher(accessToken)
    
    // Run the fetch and wait for initial response to catch errors
    try {
      const results = await fetcher.fetchAllGroups()
      
      return NextResponse.json({
        message: 'Facebook Graph API fetch completed',
        results,
        startedAt: new Date().toISOString()
      })
    } catch (fetchError: any) {
      console.error('Graph API fetch error:', fetchError)
      
      // Extract error details
      const errorMessage = fetchError.response?.data?.error?.message || 
                          fetchError.message || 
                          'Unknown error occurred'
      
      return NextResponse.json(
        { 
          error: `Graph API Error: ${errorMessage}`,
          details: fetchError.response?.data?.error
        },
        { status: 400 }
      )
    }
    
  } catch (error) {
    console.error('Graph API route error:', error)
    return NextResponse.json(
      { error: 'Failed to start Graph API fetch' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    // Check admin
    const adminCheck = await checkAdmin()
    if (!adminCheck.authorized) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      )
    }
    
    // Get stats
    const { count: totalFromGraph } = await supabaseAdmin
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('listing_source', 'facebook-graph')
    
    const { count: todayFromGraph } = await supabaseAdmin
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('listing_source', 'facebook-graph')
      .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
    
    return NextResponse.json({
      stats: {
        totalFromGraph: totalFromGraph || 0,
        todayFromGraph: todayFromGraph || 0
      },
      configured: !!process.env.FACEBOOK_ACCESS_TOKEN
    })
    
  } catch (error) {
    console.error('Graph API stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Graph API stats' },
      { status: 500 }
    )
  }
}