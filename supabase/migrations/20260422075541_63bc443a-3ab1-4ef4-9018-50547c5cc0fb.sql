
-- 1. Extend app_role enum with vendor roles
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'property_owner';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'printing_vendor';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'agency';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'business';

-- 2. Listing status enum
DO $$ BEGIN
  CREATE TYPE public.listing_status AS ENUM ('available', 'booked', 'inactive');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Listings table
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  city TEXT NOT NULL,
  area TEXT,
  type TEXT NOT NULL DEFAULT 'Billboard',
  size TEXT,
  width_ft NUMERIC,
  height_ft NUMERIC,
  price_per_day INTEGER NOT NULL DEFAULT 0,
  price_per_week INTEGER,
  price_per_month INTEGER,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  images TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  traffic_estimate TEXT,
  status public.listing_status NOT NULL DEFAULT 'available',
  legacy_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_listings_owner ON public.listings(owner_id);
CREATE INDEX IF NOT EXISTS idx_listings_city ON public.listings(city);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone signed in can view available listings"
  ON public.listings FOR SELECT
  TO authenticated
  USING (status = 'available' OR owner_id = auth.uid());

CREATE POLICY "Owners insert own listings"
  ON public.listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners update own listings"
  ON public.listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners delete own listings"
  ON public.listings FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. user_role_selections (tracks explicit role picks)
CREATE TABLE IF NOT EXISTS public.user_role_selections (
  user_id UUID NOT NULL PRIMARY KEY,
  primary_role public.app_role NOT NULL,
  selected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_role_selections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own role selection"
  ON public.user_role_selections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own role selection"
  ON public.user_role_selections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own role selection"
  ON public.user_role_selections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. Seed hardcoded billboards into listings (owner_id NULL = marketplace seed)
INSERT INTO public.listings (legacy_id, title, description, city, area, type, size, price_per_day, latitude, longitude, tags, traffic_estimate, status)
VALUES
  ('bb-1', 'Bandra-Kurla Complex Premium', 'High-visibility billboard in Mumbai''s premier business district', 'Mumbai', 'Bandra-Kurla Complex', 'Billboard', '40x20 ft', 15000, 19.0596, 72.8656, ARRAY['Premium','Business','High Traffic'], '50,000+ daily', 'available'),
  ('bb-2', 'Cyber Hub Gurgaon Digital', 'Digital LED billboard at the heart of Gurgaon tech hub', 'Gurgaon', 'Cyber Hub', 'Digital', '30x15 ft', 22000, 28.4946, 77.0890, ARRAY['Digital','Tech','Premium'], '80,000+ daily', 'available'),
  ('bb-3', 'MG Road Bangalore', 'Iconic location in central Bangalore with massive footfall', 'Bangalore', 'MG Road', 'Billboard', '35x18 ft', 12000, 12.9716, 77.6094, ARRAY['Central','Shopping','Youth'], '60,000+ daily', 'available'),
  ('bb-4', 'Connaught Place Delhi', 'Historic and high-traffic billboard in Delhi''s commercial heart', 'Delhi', 'Connaught Place', 'Billboard', '40x22 ft', 18000, 28.6315, 77.2167, ARRAY['Tourist','Premium','Heritage'], '70,000+ daily', 'available'),
  ('bb-5', 'Powai IIT Junction', 'Strategic billboard near IIT Bombay and tech parks', 'Mumbai', 'Powai', 'Billboard', '32x16 ft', 9500, 19.1197, 72.9089, ARRAY['Tech','Education','Affordable'], '35,000+ daily', 'available'),
  ('bb-6', 'Jubilee Hills Hyderabad', 'Premium digital screen in upscale Hyderabad neighborhood', 'Hyderabad', 'Jubilee Hills', 'Digital', '28x14 ft', 14000, 17.4239, 78.4071, ARRAY['Upscale','Digital','Premium'], '45,000+ daily', 'available'),
  ('bb-7', 'T Nagar Chennai', 'Bustling shopping district billboard with massive female footfall', 'Chennai', 'T Nagar', 'Billboard', '36x18 ft', 11000, 13.0418, 80.2341, ARRAY['Shopping','Female','High Traffic'], '55,000+ daily', 'available'),
  ('bb-8', 'Park Street Kolkata', 'Cultural hub billboard in Kolkata''s entertainment district', 'Kolkata', 'Park Street', 'Billboard', '34x17 ft', 8500, 22.5535, 88.3500, ARRAY['Culture','Entertainment','Affordable'], '40,000+ daily', 'available')
ON CONFLICT (legacy_id) DO NOTHING;

-- 6. Storage bucket for listing images
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view listing images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-images');

CREATE POLICY "Authenticated users can upload listing images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own listing images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own listing images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);
