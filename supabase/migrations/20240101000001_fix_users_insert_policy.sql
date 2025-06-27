-- Add missing INSERT policy for users table to allow new users to create their profile
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);