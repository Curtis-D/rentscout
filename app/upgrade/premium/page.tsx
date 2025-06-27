'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { CreditCard, Smartphone, Check, Shield, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PremiumUpgradePage() {
  const router = useRouter()
  const { user, userProfile, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'gcash' | 'paymaya'>('card')

  useEffect(() => {
    // Wait for auth to finish loading before redirecting
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login')
      } else if (userProfile?.subscription_tier === 'premium') {
        router.push('/dashboard')
      }
    }
  }, [user, userProfile, router, authLoading])

  const handlePayment = async () => {
    setLoading(true)
    setError(null)

    try {
      // Create payment intent on the server
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 30000, // ₱300 in centavos (50% off from ₱600)
          paymentMethod,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create payment')
      }

      const { paymentUrl } = await response.json()
      
      // Redirect to PayMongo checkout
      window.location.href = paymentUrl
    } catch (error: any) {
      setError(error.message || 'Payment failed. Please try again.')
      setLoading(false)
    }
  }

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <Link 
          href="/dashboard"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Plan Details */}
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-4">
              Upgrade to Premium
            </h1>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 font-semibold">🎉 Limited Time: 50% OFF Premium!</p>
              <p className="text-sm text-red-600">Save ₱300 per month - offer ends soon!</p>
            </div>
            <p className="text-lg text-gray-600 mb-8">
              Unlock unlimited searches and instant alerts for new listings
            </p>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Premium Plan</h2>
                  <p className="text-gray-600">Billed monthly</p>
                </div>
                <div className="text-right">
                  <p className="text-lg text-gray-400 line-through">₱600</p>
                  <p className="text-3xl font-bold text-gray-900">₱300</p>
                  <p className="text-sm text-gray-600">/month</p>
                  <span className="inline-block bg-red-600 text-white text-xs px-2 py-1 rounded-full font-medium">50% OFF</span>
                </div>
              </div>

              <ul className="space-y-4">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Unlimited daily searches</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">SMS and email alerts for new matches</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">See listings 24 hours before free users</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Save unlimited search preferences</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Priority customer support</span>
                </li>
              </ul>
            </div>

            {/* Trust Badges */}
            <div className="bg-slate-50 rounded-lg p-4 flex items-center">
              <Shield className="w-5 h-5 text-slate-600 mr-3" />
              <p className="text-sm text-slate-700">
                Secure payment powered by PayMongo. Cancel anytime.
              </p>
            </div>
          </div>

          {/* Right Column - Payment Form */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Choose Payment Method
              </h3>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="space-y-3 mb-6">
                {/* Card Payment */}
                <label className="relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="mr-3"
                  />
                  <CreditCard className="w-5 h-5 text-gray-600 mr-3" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Credit/Debit Card</p>
                    <p className="text-sm text-gray-600">Visa, Mastercard, JCB</p>
                  </div>
                </label>

                {/* GCash */}
                <label className="relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="gcash"
                    checked={paymentMethod === 'gcash'}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="mr-3"
                  />
                  <Smartphone className="w-5 h-5 text-blue-600 mr-3" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">GCash</p>
                    <p className="text-sm text-gray-600">Pay with your GCash wallet</p>
                  </div>
                </label>

                {/* PayMaya */}
                <label className="relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paymaya"
                    checked={paymentMethod === 'paymaya'}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="mr-3"
                  />
                  <Smartphone className="w-5 h-5 text-green-600 mr-3" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Maya</p>
                    <p className="text-sm text-gray-600">Pay with your Maya wallet</p>
                  </div>
                </label>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-slate-900 text-white py-3 px-4 rounded-md font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Upgrade to Premium'}
              </button>

              <p className="text-xs text-center text-gray-500 mt-4">
                By upgrading, you agree to our{' '}
                <Link href="/terms" className="text-[#1877f2] hover:text-[#1465d8]">
                  Terms of Service
                </Link>
                . You can cancel anytime from your dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}