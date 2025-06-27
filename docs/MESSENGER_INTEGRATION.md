# Facebook Messenger Integration Guide

## Overview

This document outlines how to integrate Facebook Messenger functionality to allow RentScout users to send direct messages to property listers.

## Prerequisites

1. Facebook App with approved permissions
2. Business verification (for production)
3. Facebook Page (acts as the sender)

## Required Permissions

### For Sending Messages
- `pages_messaging` - Send messages on behalf of a Page
- `pages_manage_metadata` - Access Page metadata
- `pages_read_engagement` - Read Page messages

### For Advanced Features
- `pages_messaging_subscriptions` - Subscribe users to messaging
- `pages_messaging_phone_number` - Share phone numbers

## Implementation Approach

### Option 1: Send-to-Messenger Plugin

```typescript
// Add Facebook SDK to layout
<script>
  window.fbAsyncInit = function() {
    FB.init({
      appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
      autoLogAppEvents: true,
      xfbml: true,
      version: 'v18.0'
    });
  };
</script>

// Add Send to Messenger button
<div 
  className="fb-send-to-messenger" 
  messenger_app_id={process.env.NEXT_PUBLIC_FACEBOOK_APP_ID}
  page_id="YOUR_PAGE_ID"
  data-ref={listing.id}
  color="blue"
  size="large">
</div>
```

### Option 2: Customer Chat Plugin

Embed Facebook Messenger chat directly on your site:

```typescript
// Add to layout
<div id="fb-root"></div>
<div id="fb-customer-chat" className="fb-customerchat"></div>

<script>
  var chatbox = document.getElementById('fb-customer-chat');
  chatbox.setAttribute("page_id", "YOUR_PAGE_ID");
  chatbox.setAttribute("attribution", "biz_inbox");
</script>
```

### Option 3: Click-to-Messenger Links

Generate deep links that open Messenger:

```typescript
const generateMessengerLink = (pageId: string, ref?: string) => {
  const baseUrl = 'https://m.me/';
  const params = ref ? `?ref=${encodeURIComponent(ref)}` : '';
  return `${baseUrl}${pageId}${params}`;
}

// Usage in listing card
<a 
  href={generateMessengerLink('YOUR_PAGE_ID', `listing_${listing.id}`)}
  target="_blank"
  className="btn-messenger"
>
  Message on Messenger
</a>
```

## Database Schema Updates

```sql
-- Track messenger conversations
CREATE TABLE messenger_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  listing_id UUID REFERENCES listings(id),
  page_scoped_user_id TEXT, -- Facebook's PSID
  thread_id TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Store messenger templates
CREATE TABLE message_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Implementation

```typescript
// app/api/messenger/send/route.ts
export async function POST(request: Request) {
  const { recipientId, message, listingId } = await request.json()
  
  // Get Page Access Token
  const pageAccessToken = await getPageAccessToken()
  
  // Send message via Graph API
  const response = await fetch(
    `https://graph.facebook.com/v18.0/me/messages?access_token=${pageAccessToken}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text: message },
        messaging_type: 'RESPONSE'
      })
    }
  )
  
  return Response.json(await response.json())
}
```

## Webhook Handler

```typescript
// app/api/messenger/webhook/route.ts
export async function POST(request: Request) {
  const body = await request.json()
  
  // Handle different webhook events
  body.entry.forEach(entry => {
    entry.messaging.forEach(event => {
      if (event.message) {
        // Handle incoming message
        handleIncomingMessage(event)
      } else if (event.postback) {
        // Handle postback
        handlePostback(event)
      }
    })
  })
  
  return Response.json({ status: 'ok' })
}
```

## Privacy Considerations

1. **User Consent**: Always get explicit consent before initiating messages
2. **Data Storage**: Store minimal data, respect user privacy
3. **Opt-out**: Provide clear opt-out mechanisms
4. **Rate Limiting**: Respect Facebook's rate limits

## Monetization Opportunities

1. **Premium Feature**: Offer direct messaging as a premium feature
2. **Message Credits**: Charge per message sent
3. **Verified Listings**: Only allow messaging on verified listings
4. **Response Guarantee**: Premium listers guarantee response times

## Testing

1. Use Facebook's Test Users for development
2. Test with Page roles (Admin, Editor, Moderator)
3. Verify webhook delivery with ngrok
4. Test rate limits and error handling

## Compliance

1. Follow Facebook Platform Terms
2. Implement 24-hour messaging window rules
3. Use message tags appropriately
4. Handle user blocks and opt-outs

## Future Enhancements

1. **Auto-responses**: Set up automated initial responses
2. **Translation**: Auto-translate messages (Filipino ↔ English)
3. **Rich Messages**: Send property cards with images
4. **Appointment Booking**: Integrate viewing schedules
5. **AI Assistant**: Use AI to handle common questions