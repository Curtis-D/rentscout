import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/types/supabase'

// Simple in-memory rate limiting (use Redis in production)
const attempts = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(identifier: string): boolean {
  const now = Date.now()
  const userAttempts = attempts.get(identifier)
  
  if (!userAttempts || now > userAttempts.resetAt) {
    attempts.set(identifier, { count: 1, resetAt: now + 3600000 }) // 1 hour
    return true
  }
  
  if (userAttempts.count >= 5) {
    return false
  }
  
  userAttempts.count++
  return true
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    // Rate limiting
    const identifier = request.headers.get('x-forwarded-for') || 'anonymous'
    if (!checkRateLimit(identifier)) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      )
    }
    
    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }
    
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }
    
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }
    
    // Create user
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
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${request.headers.get('origin')}/auth/callback`,
      },
    })
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    // Create user profile with server-side validation
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          subscription_tier: 'free',
          searches_today: 0,
          auth_provider: 'email'
        })
      
      if (profileError) {
        console.error('Profile creation error:', profileError)
        // User is created but profile failed - handle this case
      }
    }
    
    return NextResponse.json(
      { message: 'Registration successful. Please check your email to verify your account.' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}