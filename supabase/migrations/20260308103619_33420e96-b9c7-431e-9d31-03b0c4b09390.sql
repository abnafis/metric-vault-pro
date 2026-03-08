
-- Hero content table (single row CMS pattern)
CREATE TABLE public.hero_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  headline TEXT NOT NULL DEFAULT 'Accurate Data. Better Marketing Decisions.',
  subheadline TEXT NOT NULL DEFAULT 'Expert GA4, Google Tag Manager, Server-Side Tracking, Meta CAPI & Conversion Tracking implementation — so every click, conversion and dollar is measured correctly.',
  primary_cta_text TEXT NOT NULL DEFAULT 'Get Tracking Audit',
  primary_cta_link TEXT NOT NULL DEFAULT '#cta',
  secondary_cta_text TEXT NOT NULL DEFAULT 'View Case Studies →',
  secondary_cta_link TEXT NOT NULL DEFAULT '#cases',
  badge_text TEXT NOT NULL DEFAULT 'Trusted by 100+ businesses',
  hero_image_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hero_content ENABLE ROW LEVEL SECURITY;

-- Anyone can read hero content (public website)
CREATE POLICY "Anyone can read hero content"
  ON public.hero_content FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only authenticated users can update
CREATE POLICY "Authenticated users can update hero content"
  ON public.hero_content FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated users can insert
CREATE POLICY "Authenticated users can insert hero content"
  ON public.hero_content FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Storage bucket for hero images
INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-images', 'hero-images', true);

-- Storage policies
CREATE POLICY "Anyone can view hero images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'hero-images');

CREATE POLICY "Authenticated users can upload hero images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'hero-images');

CREATE POLICY "Authenticated users can update hero images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'hero-images');

CREATE POLICY "Authenticated users can delete hero images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'hero-images');
