-- Add is_admin field to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Update RLS policies for listings to allow admin operations
-- Admins can insert listings
CREATE POLICY "Admins can insert listings" ON public.listings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND is_admin = true
    )
  );

-- Admins can update any listing
CREATE POLICY "Admins can update listings" ON public.listings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND is_admin = true
    )
  );

-- Admins can delete listings
CREATE POLICY "Admins can delete listings" ON public.listings
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND is_admin = true
    )
  );

-- Update the old admin policies to be more flexible
DROP POLICY IF EXISTS "Only admins can insert listings" ON public.listings;
DROP POLICY IF EXISTS "Only admins can update listings" ON public.listings;