'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import type { Listing } from '@/types'

const CITIES = [
  'Manila',
  'Makati',
  'Quezon City',
  'Taguig',
  'Pasig',
  'Mandaluyong',
  'Pasay',
  'Parañaque',
  'Las Piñas',
  'Muntinlupa',
  'Marikina',
  'San Juan',
  'Cebu City',
  'Davao City',
  'Caloocan',
  'Antipolo',
  'Other'
]

export default function NewListingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    city: '',
    location: '',
    property_type: 'apartment' as Listing['property_type'],
    bedrooms: '1',
    has_photos: false,
    is_verified: false,
    is_active: true,
    contact_info: '',
    listing_url: '',
    posted_date: new Date().toISOString().split('T')[0],
    image_urls: [] as string[]
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.createListing({
        ...formData,
        price: parseInt(formData.price),
        posted_date: new Date(formData.posted_date).toISOString(),
        listing_source: 'manual',
        listing_source_id: `manual-${Date.now()}`
      })

      if (response.error) {
        throw new Error(response.error)
      }

      router.push('/admin')
    } catch (error: any) {
      setError(error.message || 'Failed to create listing')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleImageUrlsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const urls = e.target.value.split('\n').filter(url => url.trim())
    setFormData(prev => ({
      ...prev,
      image_urls: urls,
      has_photos: urls.length > 0
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/admin"
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Admin
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Add New Listing</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-slate-500 focus:border-slate-500"
                placeholder="e.g., Modern 2BR Condo in Makati CBD"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-slate-500 focus:border-slate-500"
                placeholder="Describe the property..."
              />
            </div>

            {/* Price and Property Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Price (₱) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  required
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-slate-500 focus:border-slate-500"
                  placeholder="15000"
                />
              </div>

              <div>
                <label htmlFor="property_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Property Type *
                </label>
                <select
                  id="property_type"
                  name="property_type"
                  value={formData.property_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-slate-500 focus:border-slate-500"
                >
                  <option value="apartment">Apartment</option>
                  <option value="condo">Condo</option>
                  <option value="house">House</option>
                  <option value="room">Room</option>
                </select>
              </div>
            </div>

            {/* City and Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <select
                  id="city"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-slate-500 focus:border-slate-500"
                >
                  <option value="">Select a city</option>
                  {CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Specific Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-slate-500 focus:border-slate-500"
                  placeholder="e.g., Salcedo Village"
                />
              </div>
            </div>

            {/* Bedrooms */}
            <div>
              <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                Bedrooms *
              </label>
              <select
                id="bedrooms"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-slate-500 focus:border-slate-500"
              >
                <option value="studio">Studio</option>
                <option value="1">1 Bedroom</option>
                <option value="2">2 Bedrooms</option>
                <option value="3">3 Bedrooms</option>
                <option value="4+">4+ Bedrooms</option>
              </select>
            </div>

            {/* Contact Info */}
            <div>
              <label htmlFor="contact_info" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Information *
              </label>
              <input
                type="text"
                id="contact_info"
                name="contact_info"
                required
                value={formData.contact_info}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-slate-500 focus:border-slate-500"
                placeholder="Phone number or email"
              />
            </div>

            {/* Listing URL */}
            <div>
              <label htmlFor="listing_url" className="block text-sm font-medium text-gray-700 mb-1">
                Original Listing URL
              </label>
              <input
                type="url"
                id="listing_url"
                name="listing_url"
                value={formData.listing_url}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-slate-500 focus:border-slate-500"
                placeholder="https://facebook.com/..."
              />
            </div>

            {/* Image URLs */}
            <div>
              <label htmlFor="image_urls" className="block text-sm font-medium text-gray-700 mb-1">
                Image URLs (one per line)
              </label>
              <textarea
                id="image_urls"
                rows={3}
                value={formData.image_urls.join('\n')}
                onChange={handleImageUrlsChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-slate-500 focus:border-slate-500"
                placeholder="https://example.com/image1.jpg
https://example.com/image2.jpg"
              />
            </div>

            {/* Status Options */}
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_verified"
                  checked={formData.is_verified}
                  onChange={handleChange}
                  className="h-4 w-4 text-slate-600 focus:ring-slate-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Verified listing</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 text-slate-600 focus:ring-slate-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Active (visible to users)</span>
              </label>
            </div>

            {/* Posted Date */}
            <div>
              <label htmlFor="posted_date" className="block text-sm font-medium text-gray-700 mb-1">
                Posted Date
              </label>
              <input
                type="date"
                id="posted_date"
                name="posted_date"
                value={formData.posted_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-slate-500 focus:border-slate-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end space-x-3">
            <Link
              href="/admin"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50 flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Creating...' : 'Create Listing'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}