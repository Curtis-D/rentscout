# Email Configuration Guide

## Development Setup (Quick Start)

1. **In Supabase Dashboard:**
   - Go to Authentication → Providers → Email
   - Ensure "Enable Email Confirmations" is checked
   - Go to Authentication → URL Configuration
   - Add redirect URL: `http://localhost:3000/auth/callback`

2. **Testing without emails:**
   - Go to Authentication → Logs
   - You'll see the confirmation links there
   - Copy and paste in browser to verify

## Production Setup

### Option 1: Resend (Recommended - Easy Setup)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. In Supabase Dashboard → Project Settings → Auth → SMTP Settings:
   ```
   SMTP Host: smtp.resend.com
   Port: 587
   Username: resend
   Password: [your-api-key]
   Sender Email: noreply@yourdomain.com
   Sender Name: RentScout PH
   ```

### Option 2: SendGrid

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create an API key with "Mail Send" permissions
3. Verify your sender email
4. In Supabase:
   ```
   SMTP Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [your-sendgrid-api-key]
   Sender Email: [your-verified-email]
   ```

### Option 3: AWS SES (Cost-Effective)

1. Set up SES in AWS Console
2. Verify your domain
3. Create SMTP credentials
4. In Supabase:
   ```
   SMTP Host: email-smtp.[region].amazonaws.com
   Port: 587
   Username: [your-smtp-username]
   Password: [your-smtp-password]
   ```

## Email Templates

In Supabase Dashboard → Authentication → Email Templates:

### Confirmation Email
```html
<h2>Confirm your RentScout PH account</h2>
<p>Hi there,</p>
<p>Thanks for signing up! Please confirm your email address by clicking the link below:</p>
<p><a href="{{ .ConfirmationURL }}">Verify Email Address</a></p>
<p>If you didn't create an account, you can safely ignore this email.</p>
<p>Best regards,<br>RentScout PH Team</p>
```

### Magic Link Email
```html
<h2>Your RentScout PH login link</h2>
<p>Hi there,</p>
<p>Click the link below to log in to your account:</p>
<p><a href="{{ .ConfirmationURL }}">Log in to RentScout</a></p>
<p>This link will expire in 1 hour.</p>
<p>Best regards,<br>RentScout PH Team</p>
```

## Troubleshooting

1. **Emails not sending:**
   - Check Supabase logs for errors
   - Verify SMTP credentials
   - Check spam folder

2. **Rate limits:**
   - Free Supabase: 3-4 emails/hour
   - Use custom SMTP for higher limits

3. **Testing locally:**
   - Use ngrok for public URL
   - Or check Supabase logs for links