-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE property_type AS ENUM ('apartment', 'house', 'condo', 'room');
CREATE TYPE subscription_tier AS ENUM ('free', 'premium');

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscription_tier subscription_tier DEFAULT 'free' NOT NULL,
  searches_today INTEGER DEFAULT 0 NOT NULL,
  last_search_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create listings table
CREATE TABLE public.listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  price INTEGER NOT NULL,
  location TEXT NOT NULL,
  city TEXT NOT NULL,
  bedrooms TEXT NOT NULL, -- Can be 'studio', '1', '2', etc.
  property_type property_type NOT NULL,
  has_photos BOOLEAN DEFAULT false NOT NULL,
  fb_post_url TEXT NOT NULL,
  fb_group_name TEXT NOT NULL,
  post_date TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT,
  images TEXT[] DEFAULT '{}' NOT NULL,
  is_verified BOOLEAN DEFAULT false NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create saved searches table
CREATE TABLE public.saved_searches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  filters JSONB NOT NULL,
  alert_enabled BOOLEAN DEFAULT false NOT NULL,
  last_alert_sent TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create search history table (for tracking daily limits)
CREATE TABLE public.search_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  search_query JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_listings_city ON public.listings(city);
CREATE INDEX idx_listings_price ON public.listings(price);
CREATE INDEX idx_listings_bedrooms ON public.listings(bedrooms);
CREATE INDEX idx_listings_property_type ON public.listings(property_type);
CREATE INDEX idx_listings_created_at ON public.listings(created_at DESC);
CREATE INDEX idx_listings_is_active ON public.listings(is_active);
CREATE INDEX idx_search_history_user_id ON public.search_history(user_id);
CREATE INDEX idx_search_history_created_at ON public.search_history(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_searches_updated_at BEFORE UPDATE ON public.saved_searches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to reset daily search count
CREATE OR REPLACE FUNCTION reset_daily_searches()
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET searches_today = 0,
      last_search_reset = NOW()
  WHERE last_search_reset < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Create RLS (Row Level Security) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Listings are public to read
CREATE POLICY "Listings are viewable by everyone" ON public.listings
  FOR SELECT USING (is_active = true);

-- Only authenticated users can create listings (for admin)
CREATE POLICY "Only admins can insert listings" ON public.listings
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update listings" ON public.listings
  FOR UPDATE WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Saved searches belong to users
CREATE POLICY "Users can view own saved searches" ON public.saved_searches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own saved searches" ON public.saved_searches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved searches" ON public.saved_searches
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved searches" ON public.saved_searches
  FOR DELETE USING (auth.uid() = user_id);

-- Search history belongs to users
CREATE POLICY "Users can view own search history" ON public.search_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own search history" ON public.search_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);