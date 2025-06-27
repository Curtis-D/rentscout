'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import SearchFilters from '@/components/search/search-filters'
import ListingCard from '@/components/listings/listing-card'
import { ListingCardSkeleton } from '@/components/ui/skeleton'
import { apiClient } from '@/lib/api-client'
import type { Listing, SearchFilters as ISearchFilters } from '@/types'
import { Filter, X } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'

export default function ListingsContainer() {
  const searchParams = useSearchParams()
  const { user, userProfile } = useAuth()
  const [listings, setListings] = useState<Listing[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ISearchFilters>({})
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [searchLimitReached, setSearchLimitReached] = useState(false)

  // Load cities on mount
  useEffect(() => {
    async function loadCities() {
      try {
        // For now, hardcode cities. In production, this could be an API endpoint
        setCities(['Manila', 'Quezon City', 'Makati', 'Taguig', 'Pasig', 'Mandaluyong', 'Pasay'])
      } catch (error) {
        console.error('Error loading cities:', error)
      }
    }
    loadCities()
  }, [])

  // Track if this is a new search (filters changed) vs pagination
  const [isNewSearch, setIsNewSearch] = useState(true)

  // Load listings when filters or page changes
  useEffect(() => {
    async function loadListings() {
      setLoading(true)
      setSearchLimitReached(false)
      
      try {
        // Prepare search parameters for API - convert arrays to strings
        const searchParams = {
          city: filters.city,
          minPrice: filters.price_min?.toString(),
          maxPrice: filters.price_max?.toString(),
          bedrooms: filters.bedrooms?.join(','),
          propertyType: filters.property_type?.join(','),
          page
        }
        
        // Call API to get listings
        const response = await apiClient.getListings(searchParams)
        
        if (response.error) {
          if (response.searchLimitReached) {
            setSearchLimitReached(true)
            setLoading(false)
            return
          }
          throw new Error(response.error)
        }
        
        if (response.data) {
          setListings(response.data.listings || [])
          setTotalPages(response.data.totalPages || 1)
          setTotal(response.data.totalCount || 0)
          setIsNewSearch(false) // Reset after successful load
        }
      } catch (error) {
        console.error('Error loading listings:', error)
        // If user is not authenticated, show sign in prompt
        if (!user) {
          setSearchLimitReached(true)
        }
      } finally {
        setLoading(false)
      }
    }
    loadListings()
  }, [filters, page, user, isNewSearch])

  const handleFiltersChange = (newFilters: ISearchFilters) => {
    setFilters(newFilters)
    setPage(1) // Reset to page 1 when filters change
    setIsNewSearch(true) // Mark as new search
  }

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(value => 
    value !== undefined && value !== null && 
    (Array.isArray(value) ? value.length > 0 : true)
  ).length

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 relative"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-slate-900 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-1">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Filter Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileFilters(false)} />
          <div className="fixed inset-0 bg-white flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Filters</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setFilters({})
                    handleFiltersChange({})
                  }}
                  className="text-sm text-slate-600 hover:text-slate-900 px-2 py-1"
                >
                  Clear all
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <SearchFilters 
                onFiltersChange={(newFilters) => {
                  handleFiltersChange(newFilters)
                }} 
                cities={cities}
                showHeader={false}
                currentFilters={filters}
              />
            </div>
            <div className="p-4 border-t">
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full bg-slate-900 text-white py-3 px-4 rounded-md font-medium hover:bg-slate-800 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar - Desktop */}
        <aside className="hidden lg:block lg:w-80 flex-shrink-0">
          <SearchFilters 
            onFiltersChange={handleFiltersChange} 
            cities={cities}
            currentFilters={filters}
          />
        </aside>

      {/* Listings Grid */}
      <main className="flex-1">
        {/* Results Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900">
            {loading ? 'Loading...' : `${total} Rentals Found`}
          </h2>
        </div>

        {/* Search Limit Reached */}
        {searchLimitReached ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            {user ? (
              <>
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                  Daily Search Limit Reached
                </h3>
                <p className="text-yellow-800 mb-4">
                  Free users can perform {process.env.NEXT_PUBLIC_FREE_SEARCHES_PER_DAY || 3} searches per day.
                  Upgrade to Premium for unlimited searches!
                </p>
                <Link 
                  href="/upgrade/premium"
                  className="inline-block bg-slate-900 text-white px-6 py-2 rounded-md hover:bg-slate-800 transition-colors"
                >
                  Upgrade to Premium
                </Link>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                  Sign In Required
                </h3>
                <p className="text-yellow-800 mb-4">
                  You need to sign in to browse rental listings.
                </p>
                <div className="flex gap-3 justify-center">
                  <Link 
                    href="/auth/login"
                    className="inline-block bg-slate-900 text-white px-6 py-2 rounded-md hover:bg-slate-800 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/auth/signup"
                    className="inline-block border border-slate-300 text-slate-700 px-6 py-2 rounded-md hover:bg-slate-50 transition-colors"
                  >
                    Create Account
                  </Link>
                </div>
              </>
            )}
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-slate-600">
              No listings found matching your criteria.
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Try adjusting your filters or check back later.
            </p>
          </div>
        ) : (
          <>
            {/* Listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-slate-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="px-4 py-2 text-sm text-slate-700">
                  Page {page} of {totalPages}
                </span>
                
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-slate-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
    </>
  )
}