# Security Architecture - RentScout PH

## Overview

RentScout PH implements a secure, server-side architecture where all database operations go through API routes. This ensures proper authentication, authorization, validation, and rate limiting.

## Architecture Layers

### 1. Client Layer (Browser)
- React components use `apiClient` to make requests
- No direct database access
- Authentication tokens stored in httpOnly cookies
- Client-side validation for UX, not security

### 2. API Layer (Next.js Routes)
- All database operations go through `/api/*` routes
- Authentication verification on every request
- Rate limiting to prevent abuse
- Input validation and sanitization
- Structured error responses

### 3. Database Layer (Supabase)
- Row Level Security (RLS) as backup protection
- Service role key only used server-side
- No direct client access to database

## Security Features

### Authentication & Authorization
- Supabase Auth with httpOnly cookies
- Admin role verification for protected endpoints
- Session validation on every API request

### Rate Limiting
- Auth endpoints: 5 attempts per hour
- Search endpoints: 100 requests per hour  
- General endpoints: 60 requests per minute
- In-memory storage (upgrade to Redis for production)

### Input Validation
- Server-side validation for all inputs
- Type checking and sanitization
- SQL injection prevention via parameterized queries

### Data Protection
- Sensitive fields (subscription_tier, is_admin) cannot be modified by users
- Search history tracked server-side only
- Payment operations isolated to webhook endpoints

## API Endpoints

### Public Endpoints
- `POST /api/auth/login` - User login with rate limiting
- `POST /api/auth/register` - User registration with validation

### Protected Endpoints (Requires Auth)
- `GET /api/listings` - Search listings with limit tracking
- `GET /api/user/profile` - Get user profile
- `PATCH /api/user/profile` - Update user profile (limited fields)

### Admin Endpoints (Requires Admin Role)
- `GET /api/admin/listings` - Get all listings
- `POST /api/admin/listings` - Create new listing
- `PATCH /api/admin/listings/[id]` - Update listing
- `DELETE /api/admin/listings/[id]` - Soft delete listing

## Environment Variables

```bash
# Public (safe for client)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Secret (server-only)
SUPABASE_SERVICE_ROLE_KEY=  # NEVER expose to client!
```

## Security Checklist

✅ All database operations go through API routes
✅ Rate limiting on all endpoints
✅ Input validation and sanitization
✅ Authentication check on protected routes
✅ Admin role verification
✅ Sensitive operations use service role key
✅ Error messages don't leak sensitive info
✅ CORS properly configured
✅ SQL injection prevention
✅ XSS protection via React

## Future Enhancements

1. **Redis for Rate Limiting** - Persistent rate limit tracking
2. **API Keys** - For third-party integrations
3. **Request Signing** - HMAC signatures for critical operations
4. **Audit Logging** - Track all admin actions
5. **2FA** - Two-factor authentication for admins
6. **CAPTCHA** - On registration and repeated failed logins
7. **WAF** - Web Application Firewall for DDoS protection

## Migration Notes

When migrating from client-side to server-side:
1. Update all direct Supabase calls to use `apiClient`
2. Remove client-side database imports
3. Update error handling for API responses
4. Test rate limiting behavior
5. Verify admin access controls