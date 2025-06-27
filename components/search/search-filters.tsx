'use client'

import { useState, useEffect } from 'react'
import type { SearchFilters } from '@/types'

interface SearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void
  cities: string[]
  showHeader?: boolean
  currentFilters: SearchFilters
}

export default function SearchFilters({ onFiltersChange, cities, showHeader = true, currentFilters }: SearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>(currentFilters)

  // Sync with parent filters when they change
  useEffect(() => {
    setFilters(currentFilters)
  }, [currentFilters])

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onFiltersChange(updated)
  }

  const clearFilters = () => {
    setFilters({})
    onFiltersChange({})
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
      {showHeader && (
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
          <button
            onClick={clearFilters}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="space-y-4 sm:space-y-6">
        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            City
          </label>
          <select
            value={filters.city || ''}
            onChange={(e) => handleFilterChange({ city: e.target.value || undefined })}
            className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 text-base sm:text-sm"
          >
            <option value="">All Cities</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Price Range (₱)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.price_min || ''}
              onChange={(e) => handleFilterChange({ 
                price_min: e.target.value ? parseInt(e.target.value) : undefined 
              })}
              className="w-1/2 px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 text-base sm:text-sm"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.price_max || ''}
              onChange={(e) => handleFilterChange({ 
                price_max: e.target.value ? parseInt(e.target.value) : undefined 
              })}
              className="w-1/2 px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 text-base sm:text-sm"
            />
          </div>
        </div>

        {/* Bedrooms */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Bedrooms
          </label>
          <div className="space-y-2">
            {['studio', '1', '2', '3', '4+'].map(bedroom => (
              <label key={bedroom} className="flex items-center cursor-pointer py-2">
                <input
                  type="checkbox"
                  checked={filters.bedrooms?.includes(bedroom) || false}
                  onChange={(e) => {
                    const current = filters.bedrooms || []
                    if (e.target.checked) {
                      handleFilterChange({ bedrooms: [...current, bedroom] })
                    } else {
                      handleFilterChange({ 
                        bedrooms: current.filter(b => b !== bedroom) 
                      })
                    }
                  }}
                  className="mr-3 h-4 w-4 rounded text-slate-600 focus:ring-slate-500"
                />
                <span className="text-sm text-slate-700">
                  {bedroom === 'studio' ? 'Studio' : `${bedroom} Bedroom${bedroom !== '1' ? 's' : ''}`}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Property Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Property Type
          </label>
          <div className="space-y-2">
            {[
              { value: 'apartment', label: 'Apartment' },
              { value: 'house', label: 'House' },
              { value: 'condo', label: 'Condo' },
              { value: 'room', label: 'Room' }
            ].map(type => (
              <label key={type.value} className="flex items-center cursor-pointer py-2">
                <input
                  type="checkbox"
                  checked={filters.property_type?.includes(type.value as any) || false}
                  onChange={(e) => {
                    const current = filters.property_type || []
                    if (e.target.checked) {
                      handleFilterChange({ 
                        property_type: [...current, type.value as any] 
                      })
                    } else {
                      handleFilterChange({ 
                        property_type: current.filter(t => t !== type.value) 
                      })
                    }
                  }}
                  className="mr-3 h-4 w-4 rounded text-slate-600 focus:ring-slate-500"
                />
                <span className="text-sm text-slate-700">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Photos Only */}
        <label className="flex items-center cursor-pointer py-1">
          <input
            type="checkbox"
            checked={filters.has_photos_only || false}
            onChange={(e) => handleFilterChange({ 
              has_photos_only: e.target.checked || undefined 
            })}
            className="mr-3 h-4 w-4 rounded text-slate-600 focus:ring-slate-500"
          />
          <span className="text-sm text-slate-700 font-medium">With Photos Only</span>
        </label>
      </div>
    </div>
  )
}