# Database Migration Guide

## Overview

This guide will help you apply all database schema changes to your Supabase project.

## Option 1: Run Complete Migration (Recommended for New Projects)

If you're setting up a new Supabase project, run the complete migration:

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **SQL Editor**
4. Click **New Query**
5. Copy and paste the entire contents of `/supabase/run_all_migrations.sql`
6. Click **Run** to execute the migration

## Option 2: Run Individual Migrations (For Existing Projects)

If you already have some tables created, run only the migrations you need:

### Check What You Already Have

First, check which tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Individual Migration Files

1. **Initial Schema** - `/supabase/migrations/20240101000000_initial_schema.sql`
   - Creates: users, listings, saved_searches, search_history tables
   - Sets up: RLS policies, indexes, triggers

2. **Fix Users Insert Policy** - `/supabase/migrations/20240101000001_fix_users_insert_policy.sql`
   - Adds: INSERT policy for users table
   - Fixes: "new row violates row-level security policy" error

3. **Add Payments** - `/supabase/migrations/20240101000002_add_payments_table.sql`
   - Creates: payments, subscriptions tables
   - Adds: Payment tracking for premium features

4. **Add Admin Features** - `/supabase/migrations/20240101000003_add_admin_policies.sql`
   - Adds: is_admin column to users table
   - Creates: Admin RLS policies for listings management

5. **Add Auth Provider** - `/supabase/migrations/20240101000004_add_auth_provider.sql`
   - Adds: auth_provider column to track login method (email/facebook)

## Important Steps After Migration

### 1. Set Admin Users

If you want to access the admin panel, run:

```sql
UPDATE public.users 
SET is_admin = true 
WHERE email = 'your-email@example.com';
```

### 2. Verify RLS Policies

Check that all RLS policies are created:

```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### 3. Test User Creation

Try creating a test user to ensure policies work:

```sql
-- This should work when authenticated
INSERT INTO public.users (id, email) 
VALUES (auth.uid(), 'test@example.com');
```

## Troubleshooting

### Error: "permission denied for schema public"

This means RLS is enabled but you're not authenticated. Either:
- Run queries through your app (authenticated)
- Temporarily disable RLS (not recommended for production)

### Error: "new row violates row-level security policy"

Make sure you've run migration #2 (fix_users_insert_policy.sql)

### Error: "relation does not exist"

You're trying to reference a table that hasn't been created yet. Run the migrations in order.

## Rollback (If Needed)

To remove all tables and start fresh:

```sql
-- WARNING: This will delete all data!
DROP TABLE IF EXISTS public.search_history CASCADE;
DROP TABLE IF EXISTS public.saved_searches CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.listings CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS reset_daily_searches() CASCADE;
```

## Verify Migration Success

Run this query to verify all tables are created:

```sql
SELECT 
  t.table_name,
  COUNT(c.column_name) as column_count,
  COUNT(p.policyname) as policy_count
FROM information_schema.tables t
LEFT JOIN information_schema.columns c 
  ON t.table_name = c.table_name AND t.table_schema = c.table_schema
LEFT JOIN pg_policies p 
  ON t.table_name = p.tablename AND t.table_schema = p.schemaname
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
GROUP BY t.table_name
ORDER BY t.table_name;
```

Expected results:
- users: 8+ columns, 3+ policies
- listings: 15+ columns, 4+ policies  
- payments: 10+ columns, 1+ policies
- subscriptions: 10+ columns, 1+ policies
- saved_searches: 7+ columns, 4+ policies
- search_history: 4+ columns, 2+ policies