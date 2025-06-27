'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { apiClient } from '@/lib/api-client'
import { Mail, Lock, AlertCircle } from 'lucide-react'
import { FaFacebook } from 'react-icons/fa'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendSuccess, setResendSuccess] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResendSuccess(false)

    try {
      const response = await apiClient.login(email, password)

      if (response.error) {
        throw new Error(response.error)
      }

      // After successful login, Supabase auth will be handled server-side
      // We need to refresh the page to pick up the new session
      window.location.href = '/listings'
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your email address first')
      return
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (error) throw error

      setResendSuccess(true)
      setError(null)
    } catch (error: any) {
      setError(error.message)
    }
  }

  const handleFacebookLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
          scopes: 'email public_profile'
        }
      })

      if (error) throw error
    } catch (error: any) {
      setError(error.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-semibold text-gray-900">
            Welcome to RentScout
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to find your perfect home
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-amber-50 border border-amber-200 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="ml-3 flex-1">
                <p className="text-sm text-amber-800 font-medium">
                  {error === 'Email not confirmed' ? 'Please verify your email first!' : error}
                </p>
                {error === 'Email not confirmed' && (
                  <>
                    <p className="text-sm text-amber-700 mt-1">
                      Check your inbox for a verification email from RentScout. Make sure to check your spam folder too!
                    </p>
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      className="text-sm text-[#1877f2] hover:text-[#1465d8] font-medium mt-2"
                    >
                      Resend verification email
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {resendSuccess && (
          <div className="rounded-md bg-green-50 border border-green-200 p-4">
            <p className="text-sm text-green-800">
              Verification email sent! Please check your inbox.
            </p>
          </div>
        )}

        {/* Facebook Login - Primary Option */}
        <div className="mt-8">
          <button
            onClick={handleFacebookLogin}
            className="w-full flex justify-center items-center px-6 py-4 border border-transparent rounded-lg shadow-md text-base font-medium text-white bg-[#1877f2] hover:bg-[#1465d8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1877f2] transition-colors duration-200 cursor-pointer"
          >
            <FaFacebook className="h-6 w-6 mr-3" />
            Continue with Facebook
          </button>
          <p className="mt-3 text-center text-xs text-gray-500">
            Quick and secure login with your Facebook account
          </p>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">Or sign in with email</span>
          </div>
        </div>
        
        {/* Email/Password Form - Secondary Option */}
        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="space-y-3">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full pl-10 pr-3 py-2.5 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-slate-500 focus:border-slate-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full pl-10 pr-3 py-2.5 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-slate-500 focus:border-slate-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link href="/auth/reset-password" className="font-medium text-gray-600 hover:text-gray-800">
                Forgot password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-50 transition-colors duration-200"
            >
              {loading ? 'Signing in...' : 'Sign in with email'}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="font-medium text-[#1877f2] hover:text-[#1465d8]">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}