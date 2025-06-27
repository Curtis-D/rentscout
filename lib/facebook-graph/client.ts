import axios from 'axios'

export class FacebookGraphClient {
  private accessToken: string
  private baseUrl = 'https://graph.facebook.com/v18.0'
  
  constructor(accessToken: string) {
    this.accessToken = accessToken
  }
  
  /**
   * Get posts from a public Facebook group
   * Note: Requires app review and permissions from Facebook
   */
  async getGroupFeed(groupId: string, limit = 100) {
    try {
      const response = await axios.get(`${this.baseUrl}/${groupId}/feed`, {
        params: {
          access_token: this.accessToken,
          limit,
          fields: 'id,message,created_time,from,attachments,permalink_url'
        }
      })
      
      return response.data
    } catch (error: any) {
      console.error('Graph API Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      })
      
      // Log specific Facebook error message
      if (error.response?.data?.error) {
        console.error('Facebook Error:', error.response.data.error)
      }
      
      throw error
    }
  }
  
  /**
   * Get posts from a Facebook Page (easier permissions)
   */
  async getPageFeed(pageId: string, limit = 100) {
    try {
      const response = await axios.get(`${this.baseUrl}/${pageId}/posts`, {
        params: {
          access_token: this.accessToken,
          limit,
          fields: 'id,message,created_time,attachments,permalink_url,full_picture'
        }
      })
      
      return response.data
    } catch (error: any) {
      console.error('Page API Error:', error.response?.data)
      throw error
    }
  }
  
  /**
   * Test access token and show permissions
   */
  async debugToken() {
    try {
      const response = await axios.get(`${this.baseUrl}/debug_token`, {
        params: {
          input_token: this.accessToken,
          access_token: this.accessToken
        }
      })
      
      console.log('Token Debug Info:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Token Debug Error:', error.response?.data)
      throw error
    }
  }
  
  /**
   * Get current user's permissions
   */
  async getPermissions() {
    try {
      const response = await axios.get(`${this.baseUrl}/me/permissions`, {
        params: {
          access_token: this.accessToken
        }
      })
      
      console.log('Current Permissions:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Permissions Error:', error.response?.data)
      throw error
    }
  }
  
  /**
   * Get detailed information about a specific post
   */
  async getPost(postId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/${postId}`, {
        params: {
          access_token: this.accessToken,
          fields: 'id,message,created_time,from,attachments,full_picture,permalink_url'
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Graph API Error:', error)
      throw error
    }
  }
  
  /**
   * Search for public groups
   * Note: Requires app review
   */
  async searchGroups(query: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          access_token: this.accessToken,
          q: query,
          type: 'group',
          limit: 50
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Graph API Error:', error)
      throw error
    }
  }
  
  /**
   * Get next page of results
   */
  async getNextPage(nextUrl: string) {
    try {
      const response = await axios.get(nextUrl)
      return response.data
    } catch (error) {
      console.error('Graph API Error:', error)
      throw error
    }
  }
}