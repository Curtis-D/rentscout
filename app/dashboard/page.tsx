'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getSavedSearches } from '@/lib/db/users'
import { getUserSubscription, cancelSubscription } from '@/lib/db/payments'
import type { SavedSearch } from '@/types'
import type { Subscription } from '@/lib/db/payments'
import { Search, Bell, Star, Calendar, CreditCard, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, userProfile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancellingSubscription, setCancellingSubscription] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    async function loadSavedSearches() {
      if (user) {
        try {
          const searches = await getSavedSearches(user.id)
          setSavedSearches(searches)
        } catch (error) {
          console.error('Error loading saved searches:', error)
        } finally {
          setLoading(false)
        }
      }
    }
    loadSavedSearches()
  }, [user])

  useEffect(() => {
    async function loadSubscription() {
      if (user && userProfile?.subscription_tier === 'premium') {
        try {
          const sub = await getUserSubscription(user.id)
          setSubscription(sub)
        } catch (error) {
          console.error('Error loading subscription:', error)
        }
      }
    }
    loadSubscription()
  }, [user, userProfile])

  const handleCancelSubscription = async () => {
    if (!user || !window.confirm('Are you sure you want to cancel your subscription? You will keep access until the end of your billing period.')) {
      return
    }

    setCancellingSubscription(true)
    try {
      await cancelSubscription(user.id)
      setSubscription(prev => prev ? { ...prev, cancel_at_period_end: true } : null)
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      alert('Failed to cancel subscription. Please try again.')
    } finally {
      setCancellingSubscription(false)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    )
  }

  // If user exists but profile is still loading, show a more informative state
  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.email}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Star className="h-8 w-8 text-yellow-500" />
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                userProfile.subscription_tier === 'premium' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {userProfile.subscription_tier === 'premium' ? 'Premium' : 'Free'}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Account Type</h3>
            {userProfile.subscription_tier === 'free' && (
              <div className="mt-2">
                <Link href="/upgrade/premium" className="text-sm text-[#1877f2] hover:text-[#1465d8] inline-block">
                  Upgrade to Premium →
                </Link>
                <span className="ml-2 text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">50% OFF</span>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Search className="h-8 w-8 text-slate-600" />
              <span className="text-2xl font-bold text-gray-900">
                {userProfile.searches_today}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Searches Today</h3>
            <p className="text-sm text-gray-600">
              {userProfile.subscription_tier === 'free' 
                ? `${3 - userProfile.searches_today} remaining` 
                : 'Unlimited'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Bell className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">
                {savedSearches.filter(s => s.alert_enabled).length}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
            <p className="text-sm text-gray-600">
              {userProfile.subscription_tier === 'free' ? (
                <>
                  <Link href="/upgrade/premium" className="text-[#1877f2] hover:text-[#1465d8]">
                    Upgrade for alerts
                  </Link>
                  <span className="ml-1 text-xs text-red-600 font-medium">(50% OFF!)</span>
                </>
              ) : 'Email notifications'}
            </p>
          </div>
        </div>

        {/* Saved Searches */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Saved Searches</h2>
            {savedSearches.length > 0 && (
              <Link 
                href="/listings"
                className="text-sm text-[#1877f2] hover:text-[#1465d8]"
              >
                Create New Search
              </Link>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
            </div>
          ) : savedSearches.length === 0 ? (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">You haven&apos;t saved any searches yet</p>
              <Link 
                href="/listings"
                className="inline-block bg-slate-900 text-white px-6 py-2 rounded-md hover:bg-slate-800 transition-colors"
              >
                Start Searching
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {savedSearches.map((search) => (
                <div key={search.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {search.filters.city || 'All Cities'}
                        {search.filters.price_max && ` - Up to ₱${search.filters.price_max.toLocaleString()}`}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {Object.entries(search.filters).map(([key, value]) => {
                          if (key === 'city' || key === 'price_max') return null
                          if (key === 'price_min') return `Min: ₱${value.toLocaleString()}`
                          if (key === 'bedrooms') return `Bedrooms: ${value.join(', ')}`
                          if (key === 'property_type') return `Type: ${value.join(', ')}`
                          if (key === 'has_photos_only') return 'Photos only'
                          return null
                        }).filter(Boolean).join(' • ')}
                      </p>
                      <p className="text-xs text-gray-500 mt-2 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Created {new Date(search.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {search.alert_enabled && userProfile.subscription_tier === 'premium' && (
                        <Bell className="h-5 w-5 text-green-600" />
                      )}
                      <Link
                        href={`/listings?${new URLSearchParams(search.filters as any).toString()}`}
                        className="text-sm bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors"
                      >
                        View Results
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subscription Management */}
        {userProfile.subscription_tier === 'premium' && subscription && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Subscription Details</h2>
              <CreditCard className="h-6 w-6 text-gray-400" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Status</span>
                <span className={`font-medium ${
                  subscription.cancel_at_period_end ? 'text-amber-600' : 'text-green-600'
                }`}>
                  {subscription.cancel_at_period_end ? 'Cancelling' : 'Active'}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Current Period</span>
                <span className="text-gray-900">
                  {new Date(subscription.current_period_start).toLocaleDateString()} - {new Date(subscription.current_period_end).toLocaleDateString()}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Monthly Price</span>
                <span className="font-medium text-gray-900">₱300 <span className="text-sm text-gray-400 line-through">₱600</span></span>
              </div>

              {subscription.cancel_at_period_end && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="ml-3 text-sm text-amber-800">
                      Your subscription will end on {new Date(subscription.current_period_end).toLocaleDateString()}.
                      You'll retain access until then.
                    </p>
                  </div>
                </div>
              )}

              {!subscription.cancel_at_period_end && (
                <div className="mt-4">
                  <button
                    onClick={handleCancelSubscription}
                    disabled={cancellingSubscription}
                    className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                  >
                    {cancellingSubscription ? 'Cancelling...' : 'Cancel Subscription'}
                  </button>
                  <p className="text-xs text-gray-500 mt-1">
                    You can cancel anytime and keep access until the end of your billing period.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}