import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { FacebookGraphClient } from '@/lib/facebook-graph/client'
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
    
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Facebook access token not configured' },
        { status: 400 }
      )
    }
    
    const client = new FacebookGraphClient(accessToken)
    
    try {
      // Get token info and permissions
      const [tokenInfo, permissions] = await Promise.all([
        client.debugToken(),
        client.getPermissions()
      ])
      
      return NextResponse.json({
        tokenInfo: tokenInfo.data,
        permissions: permissions.data,
        configured: true
      })
    } catch (error: any) {
      return NextResponse.json({
        error: 'Failed to debug token',
        details: error.response?.data,
        configured: false
      })
    }
    
  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json(
      { error: 'Failed to debug Facebook token' },
      { status: 500 }
    )
  }
}