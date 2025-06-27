# Facebook Graph API Setup Guide

## Overview

This guide explains how to set up Facebook Graph API access to legally fetch public group data for RentScout.

## Prerequisites

- Facebook Developer Account
- Facebook App
- Business Verification (for production)

## Step 1: Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com)
2. Click "My Apps" → "Create App"
3. Choose "Business" type
4. Fill in app details:
   - App Name: "RentScout PH"
   - App Purpose: "Business"
   - Business Account: Select or create one

## Step 2: Configure App Settings

1. In your app dashboard, go to "Settings" → "Basic"
2. Add your app domains:
   - App Domains: `rentscout.ph`, `localhost:3000` (for development)
   - Privacy Policy URL: `https://rentscout.ph/privacy`
   - Terms of Service URL: `https://rentscout.ph/terms`

## Step 3: Get Access Token

### Development (Short-term Token)

1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app
3. Generate Access Token
4. Copy the token

### Production (Long-term Token)

1. Go to "Tools" → "Access Token Tool"
2. Generate a User Token
3. Exchange for Long-Lived Token:

```bash
curl -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id={app-id}&client_secret={app-secret}&fb_exchange_token={short-lived-token}"
```

## Step 4: Request Permissions

For public group access, you need these permissions:

1. `groups_access_member_info` - Access group member information
2. `publish_to_groups` - Optional, for posting

### App Review Process

1. Go to "App Review" → "Permissions and Features"
2. Request the required permissions
3. Provide:
   - Clear use case description
   - Screen recordings showing how you use the data
   - Test user credentials

## Step 5: Configure RentScout

Add to your `.env.local`:

```bash
# Facebook Graph API
FACEBOOK_ACCESS_TOKEN=your-long-lived-access-token
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-app-secret
```

## Step 6: Find Group IDs

To get a group's ID:

1. Visit the Facebook group
2. View page source (Ctrl+U)
3. Search for `"group_id":`
4. Copy the numeric ID

Or use the Graph API:

```bash
curl -X GET "https://graph.facebook.com/v18.0/search?type=group&q=apartment+rent+manila&access_token={token}"
```

## Step 7: Update Group Configuration

Edit `/lib/facebook-graph/fetcher.ts`:

```typescript
export const FACEBOOK_GROUPS = [
  {
    name: 'Apartment for Rent Manila',
    id: '123456789', // Replace with actual group ID
  },
  // Add more groups
]
```

## Usage

Once configured, admins can trigger the Graph API fetch:

```bash
# Via API
POST /api/admin/facebook-graph

# Response
{
  "message": "Facebook Graph API fetch started",
  "startedAt": "2024-01-15T10:00:00Z"
}
```

## Important Notes

### Rate Limits

- 200 calls per hour per user
- 4800 calls per day per app
- Respect these limits to avoid suspension

### Data Access

- Only PUBLIC group posts are accessible
- Private groups require member approval
- Some groups may have API access disabled

### Compliance

- Only fetch data you have permission to use
- Respect Facebook's Platform Policy
- Don't store user data without consent
- Include attribution when displaying Facebook content

## Troubleshooting

### "Invalid OAuth access token"
- Token may have expired
- Generate a new long-lived token

### "Group Not Found"
- Group may be private
- Group ID might be incorrect
- Your app might not have permission

### "Rate Limit Exceeded"
- Wait before making more requests
- Implement exponential backoff
- Check your daily/hourly limits

## Alternative: Facebook Login Integration

For better access, implement Facebook Login:

1. Users log in with Facebook
2. Request permissions from users
3. Access groups they're members of
4. More reliable and compliant

## Resources

- [Graph API Documentation](https://developers.facebook.com/docs/graph-api/)
- [Groups API Reference](https://developers.facebook.com/docs/graph-api/reference/group/)
- [Access Tokens Guide](https://developers.facebook.com/docs/facebook-login/access-tokens/)
- [App Review Guidelines](https://developers.facebook.com/docs/app-review/)