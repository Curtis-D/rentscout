// Simple in-memory rate limiter for MVP
// In production, use Redis or similar persistent storage

interface RateLimitEntry {
  count: number
  resetAt: number
}

class RateLimiter {
  private limits = new Map<string, RateLimitEntry>()
  
  constructor(
    private maxAttempts: number,
    private windowMs: number
  ) {}
  
  check(identifier: string): { success: boolean; remaining: number; resetAt: number } {
    const now = Date.now()
    const entry = this.limits.get(identifier)
    
    // Clean up old entries periodically
    if (this.limits.size > 1000) {
      this.cleanup()
    }
    
    if (!entry || now > entry.resetAt) {
      this.limits.set(identifier, {
        count: 1,
        resetAt: now + this.windowMs
      })
      return {
        success: true,
        remaining: this.maxAttempts - 1,
        resetAt: now + this.windowMs
      }
    }
    
    if (entry.count >= this.maxAttempts) {
      return {
        success: false,
        remaining: 0,
        resetAt: entry.resetAt
      }
    }
    
    entry.count++
    return {
      success: true,
      remaining: this.maxAttempts - entry.count,
      resetAt: entry.resetAt
    }
  }
  
  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetAt) {
        this.limits.delete(key)
      }
    }
  }
}

// Different rate limiters for different endpoints
export const authRateLimit = new RateLimiter(5, 60 * 60 * 1000) // 5 attempts per hour
export const searchRateLimit = new RateLimiter(100, 60 * 60 * 1000) // 100 searches per hour
export const generalRateLimit = new RateLimiter(60, 60 * 1000) // 60 requests per minute