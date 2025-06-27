'use client'

import Link from 'next/link'
import { Home, User as UserIcon, Menu, X } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { FaFacebook } from 'react-icons/fa'

export default function Header() {
  const { user, userProfile, signOut, isAdmin } = useAuth()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
    setMobileMenuOpen(false)
  }

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [router])

  return (
    <header className="border-b border-gray-100 bg-white relative">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 z-50">
            <Home className="h-6 w-6 text-slate-700" />
            <span className="text-xl font-semibold text-slate-900">RentScout PH</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/listings" className="text-slate-600 hover:text-slate-900 transition-colors">
              Browse Listings
            </Link>
            {isAdmin && (
              <Link href="/admin" className="text-slate-600 hover:text-slate-900 transition-colors">
                Admin
              </Link>
            )}
            {user ? (
              <>
                {userProfile?.subscription_tier === 'premium' && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                    Premium
                  </span>
                )}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors py-2 cursor-pointer">
                    <UserIcon className="h-5 w-5" />
                    <span className="text-sm">{user.email}</span>
                    {userProfile?.auth_provider === 'facebook' && (
                      <FaFacebook className="h-4 w-4 text-[#1877f2]" />
                    )}
                  </button>
                  {/* Invisible bridge to maintain hover */}
                  <div className="absolute right-0 top-full h-2 w-48 invisible group-hover:visible" />
                  <div className="absolute right-0 top-full w-48 bg-white rounded-md shadow-lg py-1 z-50 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-150 border border-gray-100">
                    <Link 
                      href="/dashboard" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Dashboard
                    </Link>
                    {userProfile?.subscription_tier === 'free' && (
                      <Link 
                        href="/upgrade/premium" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Upgrade to Premium
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Login
                </Link>
                <Link 
                  href="/auth/signup" 
                  className="bg-slate-900 text-white px-5 py-2.5 rounded-md hover:bg-slate-800 transition-colors text-sm font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-slate-700" />
            ) : (
              <Menu className="h-6 w-6 text-slate-700" />
            )}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-40">
          <div className="px-4 py-4 space-y-3">
            <Link 
              href="/listings" 
              className="block py-2 text-slate-700 hover:text-slate-900 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Listings
            </Link>
            
            {isAdmin && (
              <Link 
                href="/admin" 
                className="block py-2 text-slate-700 hover:text-slate-900 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </Link>
            )}
            
            {user ? (
              <>
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-600">{user.email}</span>
                      {userProfile?.auth_provider === 'facebook' && (
                        <FaFacebook className="h-4 w-4 text-[#1877f2]" />
                      )}
                    </div>
                    {userProfile?.subscription_tier === 'premium' && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                        Premium
                      </span>
                    )}
                  </div>
                  
                  <Link 
                    href="/dashboard" 
                    className="block py-2 text-slate-700 hover:text-slate-900"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  
                  {userProfile?.subscription_tier === 'free' && (
                    <Link 
                      href="/upgrade/premium" 
                      className="block py-2 text-[#1877f2] hover:text-[#1465d8] font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Upgrade to Premium
                    </Link>
                  )}
                  
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left py-2 text-slate-700 hover:text-slate-900 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="border-t pt-3 space-y-3">
                  <Link 
                    href="/auth/login" 
                    className="block py-2 text-slate-700 hover:text-slate-900"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    href="/auth/signup" 
                    className="block bg-slate-900 text-white px-4 py-3 rounded-md hover:bg-slate-800 transition-colors text-center font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}