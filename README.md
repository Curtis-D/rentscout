# RentScout PH

A mobile-friendly web app that aggregates apartment/house rental listings in the Philippines from Facebook groups.

## Quick Start with Vercel + Supabase

### 1. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/rentscout-app)

Or deploy manually:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### 2. Add Supabase Integration

After deployment:
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to "Integrations" tab
4. Search and add "Supabase"
5. Follow the setup wizard (it will create a new Supabase project)
6. Environment variables will be automatically added

### 3. Initialize Database

1. Click the Supabase link in your Vercel dashboard
2. Go to SQL Editor
3. Run the migration script from `/supabase/migrations/20240101000000_initial_schema.sql`
4. (Optional) Load test data from `/supabase/seed.sql`

### 4. Configure Authentication

In Supabase dashboard:
1. Go to Authentication → Providers
2. Enable "Email" provider
3. Go to Authentication → URL Configuration
4. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://your-project.vercel.app/auth/callback`

### 5. Local Development

```bash
# Pull env vars from Vercel
vercel env pull .env.local

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Features Status

- ✅ Landing page with professional design
- ✅ Database schema (users, listings, searches)
- ✅ TypeScript types and interfaces
- ✅ Supabase utilities
- ✅ Search & filtering UI
- ✅ Authentication flow (Email + Facebook OAuth)
- ✅ Payment integration (PayMongo)
- ✅ Admin panel
- ✅ Facebook Graph API integration
- ✅ Secure API routes with rate limiting

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Hosting**: Vercel
- **Payments**: PayMongo (Philippines)

## Environment Variables

After Supabase integration, these will be set automatically:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

You'll need to add:
- `PAYMONGO_SECRET_KEY`
- `PAYMONGO_PUBLIC_KEY`
- `FACEBOOK_ACCESS_TOKEN` (for Graph API)
- `FACEBOOK_APP_ID`
- `FACEBOOK_APP_SECRET`

## Project Structure

```
rentscout-app/
├── app/              # Next.js pages and API routes
│   ├── auth/        # Authentication pages
│   ├── listings/    # Listing pages
│   └── api/         # API endpoints
├── components/       # Reusable React components
│   ├── ui/          # Basic UI components
│   ├── listings/    # Listing-specific components
│   └── search/      # Search and filter components
├── lib/             # Utilities and helpers
│   └── db/          # Database query functions
├── types/           # TypeScript type definitions
├── supabase/        # Database migrations and seeds
└── public/          # Static assets
```

## Next Steps

1. Deploy to Vercel
2. Set up Supabase through Vercel integration
3. Run database migrations
4. Start building features!

## Support

For issues or questions, please open an issue on GitHub.