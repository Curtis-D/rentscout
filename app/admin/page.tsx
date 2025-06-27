'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Home, 
  Users, 
  FileText, 
  DollarSign, 
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash,
  Eye
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import type { Listing } from '@/types'
import FacebookGraphSection from '@/components/admin/facebook-graph-section'

export default function AdminDashboard() {
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalUsers: 0,
    premiumUsers: 0,
    monthlyRevenue: 0
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Load listings through secure API
      const response = await apiClient.getAdminListings()
      
      if (response.error) {
        console.error('Error loading listings:', response.error)
        // Redirect to login if unauthorized
        if (response.error === 'Unauthorized') {
          router.push('/auth/login')
        }
        return
      }
      
      if (response.data) {
        setListings(response.data.listings || [])
        
        // Calculate stats from listings data
        const allListings = response.data.listings || []
        const activeListings = allListings.filter(l => l.is_active)
        
        setStats({
          totalListings: allListings.length,
          activeListings: activeListings.length,
          totalUsers: 0, // These would need separate API endpoints
          premiumUsers: 0,
          monthlyRevenue: 0
        })
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteListing = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return

    try {
      const response = await apiClient.deleteListing(id)
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      await loadDashboardData()
    } catch (error) {
      console.error('Error deleting listing:', error)
      alert('Failed to delete listing')
    }
  }

  const filteredListings = listings.filter(listing => {
    const matchesSearch = 
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && listing.is_active) ||
      (filterStatus === 'inactive' && !listing.is_active)

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <Home className="h-6 w-6 text-slate-700" />
                <span className="text-xl font-semibold text-slate-900">RentScout Admin</span>
              </Link>
            </div>
            <Link
              href="/admin/listings/new"
              className="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Listing</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">{stats.totalListings}</span>
            </div>
            <p className="text-sm text-gray-600">Total Listings</p>
            <p className="text-xs text-green-600 mt-1">{stats.activeListings} active</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">{stats.totalUsers}</span>
            </div>
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-xs text-blue-600 mt-1">{stats.premiumUsers} premium</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-8 w-8 text-yellow-600" />
              <span className="text-2xl font-bold text-gray-900">₱{stats.monthlyRevenue}</span>
            </div>
            <p className="text-sm text-gray-600">Monthly Revenue</p>
            <p className="text-xs text-gray-500 mt-1">From subscriptions</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">{stats.premiumUsers}</span>
            </div>
            <p className="text-sm text-gray-600">Premium Users</p>
            <p className="text-xs text-gray-500 mt-1">Active subscriptions</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Eye className="h-8 w-8 text-indigo-600" />
              <span className="text-2xl font-bold text-gray-900">{stats.activeListings}</span>
            </div>
            <p className="text-sm text-gray-600">Active Listings</p>
            <p className="text-xs text-gray-500 mt-1">Visible to users</p>
          </div>
        </div>

        {/* Facebook Graph API Section */}
        <div className="mb-8">
          <FacebookGraphSection />
        </div>

        {/* Listings Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Manage Listings</h2>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search listings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-slate-500 focus:border-slate-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-slate-500 focus:border-slate-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Listings Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredListings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{listing.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{listing.city}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₱{listing.price.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">{listing.property_type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        listing.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {listing.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          href={`/admin/listings/${listing.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteListing(listing.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredListings.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No listings found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}