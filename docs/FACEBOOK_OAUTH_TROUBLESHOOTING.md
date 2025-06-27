# Facebook OAuth Troubleshooting

## Error: "The domain of this URL isn't included in the app's domains"

This error occurs when your redirect URL doesn't match the domains configured in your Facebook App.

## Solution Steps

### 1. Add App Domains in Facebook

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Select your app
3. Go to **Settings** → **Basic**
4. In the **App Domains** field, add ALL these domains:
   ```
   localhost
   yourdomain.com
   your-project-ref.supabase.co
   ```
   
   For example:
   ```
   localhost
   rentscout.ph
   abcdefghijk.supabase.co
   ```

5. **Save Changes**

### 2. Configure OAuth Redirect URIs

1. In Facebook App Dashboard, go to **Facebook Login** → **Settings**
2. In **Valid OAuth Redirect URIs**, add:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   https://yourdomain.com/auth/callback
   ```

   Example for local development:
   ```
   http://localhost:3000/auth/callback
   https://abcdefghijk.supabase.co/auth/v1/callback
   ```

3. **Save Changes**

### 3. Update Supabase Redirect URLs

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Navigate to **Authentication** → **URL Configuration**
3. Add these to **Redirect URLs**:
   ```
   http://localhost:3000/**
   https://yourdomain.com/**
   ```

### 4. Check Your Environment Variables

Make sure your `.env.local` has the correct URL:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000  # for development
# or
NEXT_PUBLIC_APP_URL=https://yourdomain.com  # for production
```

### 5. For Vercel Deployments

If deploying to Vercel, also add:
- Your Vercel preview URLs: `https://*.vercel.app`
- Your production domain

## Common Issues and Solutions

### Issue: Localhost Not Working

Facebook now requires HTTPS except for localhost. Make sure you're using exactly:
- `http://localhost:3000` (not `http://127.0.0.1:3000`)

### Issue: Supabase URL Mismatch

Find your exact Supabase URL:
1. Go to Supabase Dashboard → Settings → API
2. Copy the **URL** field (looks like `https://abcdefghijk.supabase.co`)
3. Use this exact URL in Facebook settings

### Issue: Multiple Redirect URLs

If you have multiple environments, add all of them:
```
http://localhost:3000/auth/callback
https://rentscout-staging.vercel.app/auth/callback
https://rentscout.ph/auth/callback
https://your-project-ref.supabase.co/auth/v1/callback
```

### Issue: HTTPS Required

For production, Facebook requires HTTPS. Solutions:
- Use Vercel/Netlify for automatic HTTPS
- Set up SSL certificate for custom domains
- Use ngrok for local HTTPS testing

## Testing Checklist

1. ✅ App Domain includes all your domains
2. ✅ Valid OAuth Redirect URIs include Supabase callback URL
3. ✅ Supabase Redirect URLs include your app URLs
4. ✅ Environment variables are correct
5. ✅ Using correct protocol (http for localhost, https for production)

## Quick Debug Steps

1. Check browser console for the exact redirect URL being used
2. Compare it with your Facebook App settings
3. Ensure NO trailing slashes in URLs
4. Try in incognito mode to rule out cache issues

## Still Not Working?

1. Clear your browser cache and cookies
2. Remove and re-add the Facebook provider in Supabase
3. Create a new Facebook App for testing
4. Enable "Embedded Browser OAuth Login" in Facebook Login settings