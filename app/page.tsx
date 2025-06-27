'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

export default function HomePage() {
  const { user } = useAuth()
  
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-50 to-white px-4 py-16 sm:py-20 md:py-28">
        <div className="container mx-auto text-center max-w-5xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-slate-900 mb-6 leading-tight">
            Find verified rentals in the Philippines,
            <br />
            <span className="text-slate-700">skip the <span className="text-[#1877f2]">Facebook</span> chaos</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-3xl mx-auto">
            We aggregate and verify rental listings from trusted <span className="text-[#1877f2] font-medium">Facebook</span> groups, 
            making your search simple, fast, and reliable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/listings" 
              className="bg-slate-900 text-white px-8 py-4 rounded-md font-medium hover:bg-slate-800 transition-colors inline-flex items-center justify-center"
            >
              Start Searching →
            </Link>
            <Link 
              href="#how-it-works" 
              className="border border-slate-300 text-slate-700 px-8 py-4 rounded-md font-medium hover:bg-slate-50 transition-colors"
            >
              How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-semibold text-center text-slate-900 mb-4">
            Your rental search, simplified
          </h2>
          <p className="text-lg text-slate-600 text-center mb-16 max-w-2xl mx-auto">
            We handle the tedious parts so you can focus on finding your perfect home
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-slate-100 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-5">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Daily Updates</h3>
              <p className="text-slate-600">
                Fresh listings added daily from verified <span className="text-[#1877f2] font-medium">Facebook</span> rental groups across Metro Manila and beyond
              </p>
            </div>
            <div className="text-center">
              <div className="bg-slate-100 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-5">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Smart Filtering</h3>
              <p className="text-slate-600">
                Filter by location, price range, bedrooms, and property type to find exactly what matches your needs
              </p>
            </div>
            <div className="text-center">
              <div className="bg-slate-100 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-5">
                <span className="text-2xl">🔔</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Instant Alerts</h3>
              <p className="text-slate-600">
                Premium members get notified immediately when new listings match their saved search criteria
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-semibold text-center text-slate-900 mb-4">
            Choose your plan
          </h2>
          <p className="text-lg text-slate-600 text-center mb-16">
            Start free or unlock all features with Premium
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl border border-slate-200">
              <h3 className="text-2xl font-semibold text-slate-900 mb-2">Free</h3>
              <p className="text-slate-600 mb-6">For casual searchers</p>
              <p className="text-4xl font-semibold text-slate-900 mb-8">
                ₱0<span className="text-lg font-normal text-slate-600">/month</span>
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <span className="text-green-600 mr-3">✓</span>
                  <span className="text-slate-700">3 searches per day</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-3">✓</span>
                  <span className="text-slate-700">Basic location and price filters</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-3">✓</span>
                  <span className="text-slate-700">Access to all verified listings</span>
                </li>
              </ul>
              <Link 
                href="/auth/signup" 
                className="block text-center border border-slate-300 text-slate-700 px-6 py-3 rounded-md font-medium hover:bg-slate-50 transition-colors"
              >
                Get Started
              </Link>
            </div>
            <div className="bg-slate-900 text-white p-8 rounded-xl relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                  50% OFF
                </span>
              </div>
              <h3 className="text-2xl font-semibold mb-2">Premium</h3>
              <p className="text-slate-300 mb-6">For serious home seekers</p>
              <div className="mb-8">
                <p className="text-lg text-slate-400 line-through">₱600/month</p>
                <p className="text-4xl font-semibold">
                  ₱300<span className="text-lg font-normal text-slate-400">/month</span>
                </p>
                <p className="text-sm text-red-400 mt-2">Limited time offer!</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <span className="text-green-400 mr-3">✓</span>
                  <span>Unlimited daily searches</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-3">✓</span>
                  <span>All advanced filters unlocked</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-3">✓</span>
                  <span>SMS and email alerts for new matches</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-3">✓</span>
                  <span>See listings 24 hours early</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-3">✓</span>
                  <span>Save unlimited search preferences</span>
                </li>
              </ul>
              <Link 
                href={user ? "/upgrade/premium" : "/auth/signup?plan=premium"} 
                className="block text-center bg-white text-slate-900 px-6 py-3 rounded-md font-medium hover:bg-slate-100 transition-colors"
              >
                Start Premium
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-4">
            Start your search today
          </h2>
          <p className="text-lg text-slate-600 mb-10">
            Join thousands of renters who&apos;ve found their perfect home with RentScout
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/listings" 
              className="bg-slate-900 text-white px-8 py-4 rounded-md font-medium hover:bg-slate-800 transition-colors inline-flex items-center"
            >
              Browse Listings →
            </Link>
            <Link 
              href={user ? "/upgrade/premium" : "/auth/signup?plan=premium"} 
              className="border border-slate-300 text-slate-700 px-8 py-4 rounded-md font-medium hover:bg-slate-50 transition-colors"
            >
              Get Premium Access
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 sm:py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col items-center space-y-4 sm:space-y-0 sm:flex-row sm:justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🏠</span>
              <span className="font-semibold text-slate-900">RentScout PH</span>
            </div>
            <div className="flex space-x-6 text-sm text-slate-600">
              <Link href="/terms" className="hover:text-slate-900">Terms</Link>
              <Link href="/privacy" className="hover:text-slate-900">Privacy</Link>
              <Link href="/contact" className="hover:text-slate-900">Contact</Link>
            </div>
          </div>
          <div className="mt-6 sm:mt-8 text-center text-sm text-slate-500">
            © 2024 RentScout PH. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}