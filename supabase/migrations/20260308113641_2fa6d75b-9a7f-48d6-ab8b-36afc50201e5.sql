
-- About content table
CREATE TABLE public.about_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_title text NOT NULL DEFAULT 'Data-Driven',
  section_title_highlight text NOT NULL DEFAULT 'Expertise',
  profile_title text NOT NULL DEFAULT 'The Specialist',
  profile_description text NOT NULL DEFAULT 'With years of hands-on experience in web analytics and conversion tracking, I help businesses fix broken data, implement accurate attribution, and build the measurement infrastructure that modern marketing teams need to scale confidently. From GA4 setup to server-side tracking, I''ve worked across every major ad platform and analytics tool.',
  certifications jsonb NOT NULL DEFAULT '["GA4 & GTM certified expert","Server-side tracking specialist","Cross-platform attribution"]'::jsonb,
  stats jsonb NOT NULL DEFAULT '[{"icon":"BarChart3","value":"100+","label":"Tracking Setups"},{"icon":"Globe","value":"15+","label":"Ad Platforms Integrated"},{"icon":"Zap","value":"50+","label":"Businesses Helped"}]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read about content" ON public.about_content FOR SELECT USING (true);
CREATE POLICY "Auth can update about content" ON public.about_content FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth can insert about content" ON public.about_content FOR INSERT TO authenticated WITH CHECK (true);

-- Seed default row
INSERT INTO public.about_content (id) VALUES (gen_random_uuid());

-- CTA content table
CREATE TABLE public.cta_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  headline text NOT NULL DEFAULT 'Fix Your Tracking.',
  headline_highlight text NOT NULL DEFAULT 'Unlock Accurate Marketing Data.',
  description text NOT NULL DEFAULT 'Get a free tracking audit and start making data-driven decisions with confidence.',
  button_text text NOT NULL DEFAULT 'Request Free Audit',
  success_title text NOT NULL DEFAULT 'Request Received!',
  success_description text NOT NULL DEFAULT 'I''ll review your setup and get back to you within 24 hours.',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cta_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cta content" ON public.cta_content FOR SELECT USING (true);
CREATE POLICY "Auth can update cta content" ON public.cta_content FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth can insert cta content" ON public.cta_content FOR INSERT TO authenticated WITH CHECK (true);

-- Seed default row
INSERT INTO public.cta_content (id) VALUES (gen_random_uuid());
