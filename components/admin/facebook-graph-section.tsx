'use client'

import { useState, useEffect } from 'react'
import { Facebook, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

export default function FacebookGraphSection() {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalFromGraph: 0,
    todayFromGraph: 0,
    configured: false
  })
  const [lastFetch, setLastFetch] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await apiClient.request('/admin/facebook-graph')
      if (response.data) {
        setStats({
          totalFromGraph: response.data.stats?.totalFromGraph || 0,
          todayFromGraph: response.data.stats?.todayFromGraph || 0,
          configured: response.data.configured || false
        })
      }
    } catch (error) {
      console.error('Error loading Graph API stats:', error)
    }
  }

  const handleFetch = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await apiClient.request('/admin/facebook-graph', {
        method: 'POST'
      })

      if (response.error) {
        setError(response.error)
        console.error('Facebook API Error:', response.error)
      } else {
        setSuccess('Facebook Graph API fetch completed successfully!')
        setLastFetch(new Date().toLocaleString())
        // Show results if available
        if (response.data?.results) {
          console.log('Fetch results:', response.data.results)
        }
        // Reload stats after a delay
        setTimeout(loadStats, 2000)
      }
    } catch (error) {
      setError('Failed to start Graph API fetch')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Facebook className="h-6 w-6 text-[#1877f2]" />
          Facebook Graph API
        </h2>
        {stats.configured ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Configured
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Not Configured
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded p-4">
          <p className="text-sm text-gray-500">Total from Graph API</p>
          <p className="text-2xl font-semibold text-gray-900">{stats.totalFromGraph}</p>
        </div>
        <div className="bg-gray-50 rounded p-4">
          <p className="text-sm text-gray-500">Today's Imports</p>
          <p className="text-2xl font-semibold text-gray-900">{stats.todayFromGraph}</p>
        </div>
      </div>

      {/* Configuration Status */}
      {!stats.configured && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">Configuration Required</h3>
              <div className="mt-2 text-sm text-amber-700">
                <p>To use Facebook Graph API, you need to:</p>
                <ol className="list-decimal list-inside mt-1 space-y-1">
                  <li>Create a Facebook App at developers.facebook.com</li>
                  <li>Get your App ID and Secret</li>
                  <li>Generate an access token</li>
                  <li>Add FACEBOOK_ACCESS_TOKEN to your environment variables</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      {/* Fetch Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleFetch}
          disabled={loading || !stats.configured}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#1877f2] hover:bg-[#166fe5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1877f2] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <RefreshCw className="animate-spin h-4 w-4 mr-2" />
              Fetching...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Fetch Latest Posts
            </>
          )}
        </button>
        
        {lastFetch && (
          <p className="text-sm text-gray-500">
            Last fetch: {lastFetch}
          </p>
        )}
      </div>

      {/* Debug Section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={async () => {
            const response = await apiClient.request('/admin/facebook-graph/debug')
            if (response.data) {
              console.log('Token Debug Info:', response.data)
              alert(`Token Permissions: ${JSON.stringify(response.data.permissions?.map((p: any) => p.permission).join(', '))}`)
            } else {
              alert(`Debug Error: ${response.error}`)
            }
          }}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Debug Token Permissions
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-2">How it works</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Fetches public posts from configured Facebook groups</li>
          <li>• Automatically parses rental information (price, location, etc.)</li>
          <li>• Detects and skips duplicate listings</li>
          <li>• Respects Facebook's rate limits (200 calls/hour)</li>
        </ul>
        
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm">
          <p className="font-medium text-amber-800 mb-1">⚠️ Permission Required</p>
          <p className="text-amber-700">To access Facebook groups, you need:</p>
          <ul className="list-disc list-inside text-amber-700 mt-1">
            <li>groups_access_member_info permission</li>
            <li>App review approval from Facebook</li>
            <li>Or use Page feeds instead of Group feeds</li>
          </ul>
        </div>
      </div>
    </div>
  )
}