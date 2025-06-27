import { FacebookGraphClient } from './client'
import { GraphAPIParser } from './parser'
import { supabaseAdmin } from '@/lib/supabase-server'

// Facebook groups configuration
export const FACEBOOK_GROUPS = [
  {
    name: 'Test Properties',
    id: '744733927996234',
  },
  // Add more groups with their IDs
]

export class GraphAPIFetcher {
  private client: FacebookGraphClient
  private parser: GraphAPIParser
  
  constructor(accessToken: string) {
    this.client = new FacebookGraphClient(accessToken)
    this.parser = new GraphAPIParser()
  }
  
  /**
   * Fetch listings from all configured groups
   */
  async fetchAllGroups() {
    console.log('Starting Graph API fetch...')
    
    const results = {
      totalFetched: 0,
      totalSaved: 0,
      errors: [] as string[]
    }
    
    for (const group of FACEBOOK_GROUPS) {
      try {
        console.log(`Fetching from ${group.name}...`)
        const groupResults = await this.fetchGroupListings(group.id, group.name)
        
        results.totalFetched += groupResults.fetched
        results.totalSaved += groupResults.saved
        
      } catch (error) {
        const errorMsg = `Failed to fetch ${group.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        console.error(errorMsg)
        results.errors.push(errorMsg)
      }
    }
    
    console.log('Graph API fetch complete:', results)
    return results
  }
  
  /**
   * Fetch listings from a specific group
   */
  async fetchGroupListings(groupId: string, groupName: string) {
    const results = {
      fetched: 0,
      saved: 0
    }
    
    try {
      // Get group feed
      const feedData = await this.client.getGroupFeed(groupId)
      
      if (!feedData.data || feedData.data.length === 0) {
        console.log(`No posts found in ${groupName}`)
        return results
      }
      
      // Process each post
      for (const post of feedData.data) {
        results.fetched++
        
        // Parse the post
        const listing = this.parser.parsePost(post, groupName)
        
        if (listing) {
          // Save to database
          const saved = await this.saveListing(listing)
          if (saved) {
            results.saved++
          }
        }
      }
      
      console.log(`${groupName}: Fetched ${results.fetched} posts, saved ${results.saved} listings`)
      
      // Handle pagination if needed
      if (feedData.paging?.next) {
        // You can implement pagination here if needed
        // const nextResults = await this.client.getNextPage(feedData.paging.next)
      }
      
    } catch (error) {
      console.error(`Error fetching ${groupName}:`, error)
      throw error
    }
    
    return results
  }
  
  /**
   * Save listing to database
   */
  private async saveListing(listing: any): Promise<boolean> {
    try {
      // Check if listing already exists
      if (listing.fbPostUrl) {
        const { data: existing } = await supabaseAdmin
          .from('listings')
          .select('id')
          .eq('listing_url', listing.fbPostUrl)
          .single()
        
        if (existing) {
          return false // Already exists
        }
      }
      
      // Prepare for database
      const dbListing = {
        title: listing.title,
        description: listing.description,
        price: listing.price || 0,
        location: listing.location || listing.city || 'Unknown',
        city: listing.city || 'Unknown',
        bedrooms: listing.bedrooms,
        property_type: listing.propertyType,
        image_urls: listing.imageUrls,
        has_photos: listing.imageUrls.length > 0,
        contact_info: listing.contactInfo,
        listing_url: listing.fbPostUrl,
        listing_source: 'facebook-graph',
        listing_source_id: listing.fbPostUrl,
        posted_date: listing.postDate,
        is_verified: false,
        is_active: true
      }
      
      const { error } = await supabaseAdmin
        .from('listings')
        .insert(dbListing)
      
      if (error) {
        console.error('Error saving listing:', error)
        return false
      }
      
      return true
      
    } catch (error) {
      console.error('Error saving listing:', error)
      return false
    }
  }
}