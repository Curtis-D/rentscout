import type { Listing } from '@/types'
import { MapPin, Calendar, ExternalLink } from 'lucide-react'

interface ListingCardProps {
  listing: Listing
}

export default function ListingCard({ listing }: ListingCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getBedroomLabel = (bedrooms: string) => {
    if (bedrooms === 'studio') return 'Studio'
    return `${bedrooms} BR`
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      {listing.has_photos && listing.image_urls && listing.image_urls.length > 0 ? (
        <div className="relative h-48 bg-gray-200">
          <img 
            src={listing.image_urls[0]} 
            alt={listing.title}
            className="w-full h-full object-cover"
          />
          {listing.is_verified && (
            <span className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
              Verified
            </span>
          )}
        </div>
      ) : (
        <div className="h-48 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400">No photo available</span>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-slate-900 mb-2 line-clamp-2">
          {listing.title}
        </h3>

        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-slate-900">
            {formatPrice(listing.price)}
          </span>
          <span className="text-sm text-slate-600">
            /month
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-slate-600">
            <MapPin className="w-4 h-4 mr-1.5" />
            {listing.location}
          </div>
          <div className="flex items-center text-sm text-slate-600">
            <Calendar className="w-4 h-4 mr-1.5" />
            Posted {formatDate(listing.posted_date)}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex gap-2 mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
              {getBedroomLabel(listing.bedrooms)}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 capitalize">
              {listing.property_type}
            </span>
          </div>
          {listing.listing_source && (
            <span className="text-xs text-slate-500 line-clamp-1">
              via {listing.listing_source}
            </span>
          )}
        </div>

        {listing.listing_url ? (
          <a
            href={listing.listing_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#1877f2] text-white py-2 px-4 rounded-md font-medium hover:bg-[#1465d8] transition-colors inline-flex items-center justify-center"
          >
            View on Facebook
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>
        ) : listing.contact_info ? (
          <div className="text-center py-2 px-4 bg-gray-100 rounded-md">
            <span className="text-sm text-gray-700">Contact: {listing.contact_info}</span>
          </div>
        ) : null}
      </div>
    </div>
  )
}