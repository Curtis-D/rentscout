# Security Considerations for RentScout PH

## Current Architecture vs Production Architecture

### Current (MVP) Architecture
- Direct Supabase access from browser
- RLS policies for security
- Client-side validation

### Recommended Production Architecture

1. **API Layer**: Add Next.js API routes as intermediary
2. **Server-side Validation**: Validate all inputs before database operations
3. **Rate Limiting**: Implement at API level
4. **Sensitive Operations**: Keep these server-side only:
   - User creation with additional validation
   - Payment processing
   - Admin operations
   - Search tracking (to prevent manipulation)

## Migration Path

### Phase 1: Secure Critical Operations (Immediate)
Move these to API routes:
- User registration (add email verification, rate limiting)
- Payment webhooks (already server-side)
- Admin operations
- Search limit tracking

### Phase 2: Add API Layer (Before Scaling)
Create `/api` routes for:
- `/api/auth/register` - Server-side user creation
- `/api/listings/search` - Server-side search with proper tracking
- `/api/subscription/upgrade` - Handle payment intents

### Phase 3: Full Backend (When Scaling)
Consider:
- Separate backend service
- API gateway
- Caching layer
- Queue system for scraping

## Example: Secure User Registration

```typescript
// app/api/auth/register/route.ts
import { createClient } from '@supabase/supabase-js'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  // Rate limiting
  const identifier = request.headers.get('x-forwarded-for') || 'anonymous'
  const { success } = await rateLimit.check(identifier, 5) // 5 attempts per hour
  
  if (!success) {
    return Response.json({ error: 'Too many attempts' }, { status: 429 })
  }

  const { email, password } = await request.json()
  
  // Server-side validation
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return Response.json({ error: 'Invalid email' }, { status: 400 })
  }
  
  // Create user with service role (bypasses RLS)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Server-only key
  )
  
  // Additional checks before creation
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()
    
  if (existingUser) {
    return Response.json({ error: 'User already exists' }, { status: 409 })
  }
  
  // Create user...
}
```

## Security Checklist

- [ ] Move user registration to server-side
- [ ] Add rate limiting for all public endpoints
- [ ] Implement CAPTCHA for registration
- [ ] Add email verification before account activation
- [ ] Move search tracking to server-side
- [ ] Add request signing for sensitive operations
- [ ] Implement proper CORS policies
- [ ] Add API key for admin operations
- [ ] Set up monitoring for suspicious activity
- [ ] Regular security audits of RLS policies

## Current RLS Vulnerabilities to Address

1. **Search History Manipulation**: Users can potentially create fake search history
2. **Profile Data**: Users can modify any field in their profile
3. **Subscription Tier**: While payments are secure, the tier field could be manipulated

## Immediate Actions

1. For MVP/Demo: Current architecture is acceptable with known limitations
2. Before real users: Implement Phase 1 changes
3. Before payment processing: Full security audit and Phase 2
4. Monitor for abuse patterns and adjust accordingly