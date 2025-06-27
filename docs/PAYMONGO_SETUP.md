# PayMongo Setup Guide

## Getting Started with PayMongo

1. **Create a PayMongo Account**
   - Go to https://dashboard.paymongo.com/register
   - Sign up for a business account
   - Complete the verification process

2. **Get Your API Keys**
   - Navigate to Developers > API Keys
   - Copy your Test Secret Key and Test Public Key
   - For production, you'll need to activate your account and use Live keys

3. **Set Up Webhooks**
   - Go to Developers > Webhooks
   - Create a new webhook endpoint
   - URL: `https://yourdomain.com/api/payments/webhook`
   - Events to listen for:
     - `payment.paid`
     - `payment.failed`
   - Copy the webhook secret

4. **Configure Environment Variables**
   ```env
   PAYMONGO_SECRET_KEY=sk_test_xxxxxxxxxxxxx
   NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
   PAYMONGO_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

5. **Test Payment Methods**
   - **Card**: Use test card `4343 4343 4343 4343` with any future expiry
   - **GCash**: Use test number `09175555555`
   - **Maya**: Use test number `09175555555`

## Payment Flow

1. User clicks "Upgrade to Premium"
2. System creates a payment intent via PayMongo API
3. User is redirected to PayMongo's secure checkout
4. After payment, PayMongo sends webhook to our server
5. Server updates user's subscription status
6. User is redirected back to success page

## Testing Webhooks Locally

For local development, use ngrok to expose your local server:

```bash
# Install ngrok
npm install -g ngrok

# Start your Next.js app
npm run dev

# In another terminal, expose port 3000
ngrok http 3000

# Use the ngrok URL for webhook configuration
# e.g., https://abc123.ngrok.io/api/payments/webhook
```

## Going Live

1. Complete PayMongo account verification
2. Switch to Live API keys
3. Update webhook URLs to production domain
4. Test with real payment methods