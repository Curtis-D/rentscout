import ListingsContainer from '@/components/listings/listings-container'
import { Suspense } from 'react'

export default function ListingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold text-slate-900 mb-8">
          Find Your Perfect Rental
        </h1>
        
        <Suspense fallback={<div>Loading...</div>}>
          <ListingsContainer />
        </Suspense>
      </div>
    </div>
  )
}