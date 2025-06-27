-- Add auth_provider field to track how users signed up
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'email';

-- Update existing users to have 'email' as provider
UPDATE public.users SET auth_provider = 'email' WHERE auth_provider IS NULL;