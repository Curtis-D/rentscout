'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { getUser as getUserProfile, createUser } from '@/lib/db/users'
import type { User as UserProfile } from '@/types'

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  isAdmin: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  isAdmin: false,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await loadUserProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      
      // For INITIAL_SESSION or TOKEN_REFRESHED, ensure we have the latest session
      if (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
        const { data: { session: refreshedSession } } = await supabase.auth.getSession()
        session = refreshedSession
      }
      
      setUser(session?.user ?? null)
      
      if (session?.user) {
        // Add a small delay for OAuth to ensure server has processed the user
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session.user.app_metadata?.provider === 'facebook') {
          await new Promise(resolve => setTimeout(resolve, 1500))
        }
        await loadUserProfile(session.user.id)
      } else {
        setUserProfile(null)
      }
      
      setLoading(false) // Make sure loading is set to false after auth state changes
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      console.log('Loading user profile for:', userId)
      let profile = await getUserProfile(userId)
      
      // If profile doesn't exist, create it
      if (!profile) {
        console.log('Profile not found, creating new profile')
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const email = user.email || `${user.id}@facebook.local`
          const provider = user.app_metadata?.provider || 'email'
          console.log('Creating user with:', { userId, email, provider })
          await createUser(userId, email, provider)
          
          // Wait a moment for the database to process
          await new Promise(resolve => setTimeout(resolve, 500))
          
          profile = await getUserProfile(userId)
          console.log('Created profile:', profile)
        }
      } else {
        console.log('Found existing profile:', profile)
      }
      
      setUserProfile(profile)
    } catch (error) {
      console.error('Error loading user profile:', error)
      // Retry once after a delay
      setTimeout(async () => {
        try {
          const profile = await getUserProfile(userId)
          if (profile) {
            console.log('Retry successful, found profile:', profile)
            setUserProfile(profile)
          }
        } catch (retryError) {
          console.error('Retry failed:', retryError)
        }
      }, 2000)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserProfile(null)
  }

  const isAdmin = userProfile?.is_admin || false

  const value = {
    user,
    userProfile,
    loading,
    isAdmin,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}