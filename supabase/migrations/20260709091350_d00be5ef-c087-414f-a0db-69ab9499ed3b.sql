
-- Extend existing tables
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS announcement_text text DEFAULT 'I help marketers & agencies scale campaigns with accurate tracking...',
  ADD COLUMN IF NOT EXISTS whatsapp_url text DEFAULT 'https://wa.me/';

ALTER TABLE public.hero_content
  ADD COLUMN IF NOT EXISTS social_proof_avatars jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS social_proof_label text DEFAULT '250+ Happy clients';

ALTER TABLE public.testimonials
  ADD COLUMN IF NOT EXISTS video_thumbnail_url text,
  ADD COLUMN IF NOT EXISTS video_duration text,
  ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false;

-- partner_logos
CREATE TABLE IF NOT EXISTS public.partner_logos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  alt text DEFAULT '',
  sort_order int DEFAULT 0,
  visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT ON public.partner_logos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_logos TO authenticated;
GRANT ALL ON public.partner_logos TO service_role;
ALTER TABLE public.partner_logos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read partner_logos" ON public.partner_logos FOR SELECT USING (true);
CREATE POLICY "auth write partner_logos" ON public.partner_logos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- why_features
CREATE TABLE IF NOT EXISTS public.why_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  sort_order int DEFAULT 0,
  visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT ON public.why_features TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.why_features TO authenticated;
GRANT ALL ON public.why_features TO service_role;
ALTER TABLE public.why_features ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read why_features" ON public.why_features FOR SELECT USING (true);
CREATE POLICY "auth write why_features" ON public.why_features FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- hero_metrics
CREATE TABLE IF NOT EXISTS public.hero_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  value text NOT NULL,
  label text NOT NULL,
  sort_order int DEFAULT 0,
  visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT ON public.hero_metrics TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hero_metrics TO authenticated;
GRANT ALL ON public.hero_metrics TO service_role;
ALTER TABLE public.hero_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read hero_metrics" ON public.hero_metrics FOR SELECT USING (true);
CREATE POLICY "auth write hero_metrics" ON public.hero_metrics FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- faqs
CREATE TABLE IF NOT EXISTS public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL DEFAULT '',
  sort_order int DEFAULT 0,
  visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT ON public.faqs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT ALL ON public.faqs TO service_role;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read faqs" ON public.faqs FOR SELECT USING (true);
CREATE POLICY "auth write faqs" ON public.faqs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed defaults
INSERT INTO public.hero_metrics (value, label, sort_order) VALUES
  ('300%', 'Ad revenue', 1),
  ('35%', 'Lower cost', 2),
  ('4:1', 'Average ROAS', 3),
  ('2.7X', 'ROI', 4)
ON CONFLICT DO NOTHING;

INSERT INTO public.why_features (label, sort_order) VALUES
  ('Tracking in 3 Hours', 1),
  ('I Manage Everything', 2),
  ('24/7 Expert Support', 3)
ON CONFLICT DO NOTHING;

INSERT INTO public.faqs (question, answer, sort_order) VALUES
  ('Why is tracking important for me?', 'Accurate tracking ensures every ad dollar is measured correctly, so you know which campaigns actually drive revenue.', 1),
  ('Tell me about your service?', 'I set up GA4, Google Tag Manager, server-side tracking, Meta CAPI, and conversion tracking so your data is complete and reliable.', 2),
  ('Tell me about your workflow?', 'Audit → Setup → Reporting. I review your current stack, implement the tracking, and hand off with clear reporting.', 3),
  ('How long does it take?', 'Most setups are live within 3 business days, depending on stack complexity.', 4),
  ('What do you need from me?', 'Admin access to your ad accounts, GTM, GA4, and website. I''ll walk you through what to share.', 5)
ON CONFLICT DO NOTHING;
