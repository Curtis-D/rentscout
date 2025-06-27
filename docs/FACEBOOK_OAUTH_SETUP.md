# Facebook OAuth Setup Guide

## Overview

This guide will help you set up Facebook OAuth authentication for RentScout PH, allowing users to sign in with their Facebook accounts.

## Prerequisites

1. A Facebook Developer account
2. A Facebook App
3. Supabase project with authentication enabled

## Step 1: Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Choose "Consumer" as the app type
4. Fill in the app details:
   - App Name: RentScout PH
   - App Contact Email: your-email@example.com
   - App Purpose: Yourself or your own business

## Step 2: Configure Facebook Login

1. In your Facebook App dashboard, click "Set Up" under Facebook Login
2. Choose "Web" as the platform
3. Add your Site URL: `https://yourdomain.com` (or `http://localhost:3000` for development)
4. Save changes

### Configure OAuth Redirect URIs

1. Go to Facebook Login → Settings
2. Add these Valid OAuth Redirect URIs:
   ```
   https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback (for local development)
   ```
3. Ensure "Client OAuth Login" is enabled
4. Ensure "Web OAuth Login" is enabled
5. Save changes

## Step 3: Get App Credentials

1. Go to Settings → Basic
2. Copy your:
   - App ID
   - App Secret (click "Show" and enter your password)

## Step 4: Configure Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to Authentication → Providers
4. Find "Facebook" and enable it
5. Enter your Facebook App credentials:
   - Facebook App ID
   - Facebook App Secret
6. Save the configuration

## Step 5: Configure Redirect URLs

1. In Supabase Authentication → URL Configuration
2. Add your site URL to "Redirect URLs":
   ```
   http://localhost:3000/**
   https://yourdomain.com/**
   ```

## Step 6: Update Environment Variables

Add the Facebook App ID to your `.env.local`:

```env
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id
```

## Step 7: Submit for Facebook App Review (Production)

For production use, you'll need Facebook approval:

1. Go to App Review → Permissions and Features
2. Request these permissions:
   - `email` (for user email)
   - `public_profile` (for basic profile info)
3. Complete the App Review process

## Testing

### Local Development

1. Facebook allows `localhost` URLs for testing
2. You can test with your developer account and test users
3. Create test users in App Roles → Test Users

### Test Flow

1. Click "Continue with Facebook" on login/signup page
2. Authorize the app on Facebook
3. Get redirected back to `/auth/callback`
4. User profile is automatically created
5. User is logged in and redirected to listings

## Messenger Integration (Future)

To enable sending DMs through your app, you'll need additional permissions:

1. `pages_messaging` - Send messages to Facebook Pages
2. `pages_manage_metadata` - Manage Page metadata
3. Business verification may be required

These require Facebook App Review and approval.

## Troubleshooting

### Common Issues

1. **Invalid OAuth redirect URI**
   - Ensure the redirect URI in Facebook matches exactly with Supabase
   - Check for trailing slashes

2. **App not set up**
   - Error: "App not set up: This app is still in development mode"
   - Solution: Add users as testers or switch to live mode

3. **Missing email**
   - Some Facebook users don't share email
   - Handle this case in your user creation logic

### Debug Mode

Enable debug mode in Facebook Login settings to see detailed error messages.

## Security Notes

1. Never expose your App Secret in client-side code
2. Use HTTPS in production
3. Regularly rotate your App Secret
4. Monitor your app's usage in Facebook Analytics