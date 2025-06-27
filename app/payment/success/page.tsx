'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/dashboard')
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
        
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          Payment Successful!
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Welcome to RentScout Premium! You now have unlimited access to all features.
        </p>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-green-900 mb-2">
            What&apos;s Next?
          </h2>
          <ul className="text-sm text-green-800 space-y-2 text-left">
            <li>• Start searching without limits</li>
            <li>• Set up alerts for your ideal listings</li>
            <li>• Access exclusive early listings</li>
            <li>• Enjoy priority support</li>
          </ul>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Redirecting to dashboard in {countdown} seconds...
        </p>

        <Link
          href="/dashboard"
          className="inline-block bg-slate-900 text-white px-6 py-3 rounded-md font-medium hover:bg-slate-800 transition-colors"
        >
          Go to Dashboard Now
        </Link>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  )
}