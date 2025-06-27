import { PRICE_PATTERNS, LOCATION_PATTERNS } from './config'

export interface GraphAPIPost {
  id: string
  message?: string
  created_time: string
  from?: {
    name: string
    id: string
  }
  attachments?: {
    data: Array<{
      type: string
      media?: {
        image: {
          src: string
          height: number
          width: number
        }
      }
      subattachments?: {
        data: Array<{
          media: {
            image: {
              src: string
            }
          }
        }>
      }
    }>
  }
  permalink_url?: string
  full_picture?: string
}

export interface ParsedListing {
  title: string
  description: string
  price?: number
  location?: string
  city?: string
  bedrooms?: string
  propertyType?: 'apartment' | 'house' | 'condo' | 'room'
  imageUrls: string[]
  fbPostUrl?: string
  fbGroupName?: string
  postDate: Date
  contactInfo?: string
  authorName?: string
}

export class GraphAPIParser {
  
  parsePost(post: GraphAPIPost, groupName?: string): ParsedListing | null {
    if (!post.message) {
      return null
    }
    
    const parsed = this.extractListingData(post.message)
    
    // Skip if not a valid rental listing
    if (!this.isValidRentalPost(post.message, parsed)) {
      return null
    }
    
    // Extract images
    const imageUrls = this.extractImages(post)
    
    return {
      title: parsed.title || this.generateTitle(parsed),
      description: post.message,
      price: parsed.price,
      location: parsed.location,
      city: parsed.city,
      bedrooms: parsed.bedrooms || '1',
      propertyType: parsed.propertyType || 'apartment',
      imageUrls,
      fbPostUrl: post.permalink_url,
      fbGroupName: groupName,
      postDate: new Date(post.created_time),
      contactInfo: parsed.contactInfo,
      authorName: post.from?.name
    }
  }
  
  private extractListingData(text: string) {
    const parsed: Partial<ParsedListing> = {}
    
    // Clean text
    const cleanText = text.replace(/\s+/g, ' ').trim()
    
    // Extract price
    parsed.price = this.extractPrice(cleanText)
    
    // Extract location and city
    const locationData = this.extractLocation(cleanText)
    parsed.location = locationData.location
    parsed.city = locationData.city
    
    // Extract property type
    parsed.propertyType = this.extractPropertyType(cleanText)
    
    // Extract bedrooms
    parsed.bedrooms = this.extractBedrooms(cleanText)
    
    // Extract contact info
    parsed.contactInfo = this.extractContactInfo(cleanText)
    
    return parsed
  }
  
  private extractPrice(text: string): number | undefined {
    for (const pattern of PRICE_PATTERNS) {
      const match = text.match(pattern)
      if (match) {
        let priceStr = match[1].replace(/,/g, '')
        
        // Handle 'k' notation
        if (priceStr.toLowerCase().includes('k')) {
          const numValue = parseFloat(priceStr.replace(/k/i, ''))
          return numValue * 1000
        }
        
        const price = parseFloat(priceStr)
        
        // Sanity check for Philippine rental prices
        if (price >= 3000 && price <= 200000) {
          return price
        }
      }
    }
    
    return undefined
  }
  
  private extractLocation(text: string): { location?: string; city?: string } {
    const result: { location?: string; city?: string } = {}
    
    // Look for cities
    for (const city of LOCATION_PATTERNS.cities) {
      const cityRegex = new RegExp(`\\b${city}\\b`, 'i')
      if (cityRegex.test(text)) {
        result.city = city
        break
      }
    }
    
    // Look for specific areas
    for (const area of LOCATION_PATTERNS.areas) {
      const areaRegex = new RegExp(`\\b${area}\\b`, 'i')
      if (areaRegex.test(text)) {
        result.location = area
        if (!result.city && ['BGC', 'Ortigas', 'Rockwell', 'McKinley'].includes(area)) {
          result.city = 'Taguig'
        }
        break
      }
    }
    
    return result
  }
  
  private extractPropertyType(text: string): 'apartment' | 'house' | 'condo' | 'room' | undefined {
    const lowerText = text.toLowerCase()
    
    if (lowerText.includes('condo') || lowerText.includes('condominium')) {
      return 'condo'
    }
    if (lowerText.includes('apartment') || lowerText.includes('apt')) {
      return 'apartment'
    }
    if (lowerText.includes('house') || lowerText.includes('townhouse')) {
      return 'house'
    }
    if (lowerText.includes('room') || lowerText.includes('bedspace')) {
      return 'room'
    }
    
    return 'apartment'
  }
  
  private extractBedrooms(text: string): string {
    const patterns = [
      /(\d+)\s*(?:bed\s*room|br|bedroom)/i,
      /(\d+)br/i,
      /studio/i
    ]
    
    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) {
        if (pattern.toString().includes('studio')) {
          return 'Studio'
        }
        return match[1]
      }
    }
    
    return '1'
  }
  
  private extractContactInfo(text: string): string | undefined {
    // Philippine phone number patterns
    const phonePatterns = [
      /09\d{9}/,
      /\+639\d{9}/,
      /\(09\d{2}\)\s*\d{3}-\d{4}/
    ]
    
    for (const pattern of phonePatterns) {
      const match = text.match(pattern)
      if (match) {
        return match[0]
      }
    }
    
    return undefined
  }
  
  private extractImages(post: GraphAPIPost): string[] {
    const images: string[] = []
    
    // Add full picture if available
    if (post.full_picture) {
      images.push(post.full_picture)
    }
    
    // Extract from attachments
    if (post.attachments?.data) {
      for (const attachment of post.attachments.data) {
        // Single image
        if (attachment.media?.image?.src) {
          images.push(attachment.media.image.src)
        }
        
        // Multiple images (album)
        if (attachment.subattachments?.data) {
          for (const sub of attachment.subattachments.data) {
            if (sub.media?.image?.src) {
              images.push(sub.media.image.src)
            }
          }
        }
      }
    }
    
    // Remove duplicates and limit to 5
    return [...new Set(images)].slice(0, 5)
  }
  
  private generateTitle(data: Partial<ParsedListing>): string {
    const parts = []
    
    if (data.bedrooms) {
      parts.push(data.bedrooms === 'Studio' ? 'Studio' : `${data.bedrooms}BR`)
    }
    
    if (data.propertyType) {
      parts.push(data.propertyType.charAt(0).toUpperCase() + data.propertyType.slice(1))
    }
    
    if (data.location || data.city) {
      parts.push('in', data.location || data.city)
    }
    
    if (data.price) {
      parts.push('-', `₱${data.price.toLocaleString()}`)
    }
    
    return parts.join(' ') || 'Rental Property'
  }
  
  private isValidRentalPost(text: string, parsed: Partial<ParsedListing>): boolean {
    const lowerText = text.toLowerCase()
    
    // Must contain rental keywords
    const rentalKeywords = ['for rent', 'apartment', 'condo', 'house', 'room', 'studio', 'bedroom']
    const hasRentalKeyword = rentalKeywords.some(keyword => lowerText.includes(keyword))
    
    if (!hasRentalKeyword) {
      return false
    }
    
    // Must not be a "looking for" post
    const excludePatterns = [
      /looking for/i,
      /wanted/i,
      /need.*(?:apartment|room|condo)/i,
      /anyone.*know.*rent/i,
      /pm me if.*available/i
    ]
    
    for (const pattern of excludePatterns) {
      if (pattern.test(text)) {
        return false
      }
    }
    
    // Should have at least price or location
    if (!parsed.price && !parsed.location && !parsed.city) {
      return false
    }
    
    return true
  }
}