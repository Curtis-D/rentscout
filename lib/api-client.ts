// Client-side API wrapper for secure server communication

interface ApiResponse<T = any> {
  data?: T
  error?: string
  searchLimitReached?: boolean
}

class ApiClient {
  private baseUrl = '/api'
  
  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        return { error: data.error || 'An error occurred', ...data }
      }
      
      return { data }
    } catch (error) {
      console.error('API request error:', error)
      return { error: 'Network error occurred' }
    }
  }
  
  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }
  
  async register(email: string, password: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }
  
  // User endpoints
  async getUserProfile() {
    return this.request('/user/profile')
  }
  
  async updateUserProfile(updates: any) {
    return this.request('/user/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  }
  
  // Listings endpoints
  async getListings(params: {
    city?: string
    minPrice?: string
    maxPrice?: string
    bedrooms?: string
    propertyType?: string
    page?: number
  } = {}) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString())
      }
    })
    
    return this.request(`/listings?${searchParams.toString()}`)
  }
  
  // Admin endpoints
  async getAdminListings() {
    return this.request('/admin/listings')
  }
  
  async createListing(listing: any) {
    return this.request('/admin/listings', {
      method: 'POST',
      body: JSON.stringify(listing),
    })
  }
  
  async updateListing(id: string, updates: any) {
    return this.request(`/admin/listings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  }
  
  async deleteListing(id: string) {
    return this.request(`/admin/listings/${id}`, {
      method: 'DELETE',
    })
  }
}

export const apiClient = new ApiClient()