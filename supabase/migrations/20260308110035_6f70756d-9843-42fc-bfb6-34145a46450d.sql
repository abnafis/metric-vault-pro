
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  footer_description text NOT NULL DEFAULT 'Web Analytics & Conversion Tracking Specialist',
  copyright_text text NOT NULL DEFAULT '© {year} TrackRight. All rights reserved.',
  contact_email text NOT NULL DEFAULT 'contact@trackright.io',
  cta_form_email text NOT NULL DEFAULT 'contact@trackright.io',
  seo_title text NOT NULL DEFAULT 'TrackRight — Web Analytics & Conversion Tracking',
  seo_description text NOT NULL DEFAULT 'Expert GA4, GTM, Server-Side Tracking & Conversion implementation for data-driven businesses.',
  nav_links jsonb NOT NULL DEFAULT '[{"label":"Services","href":"#services"},{"label":"Process","href":"#process"},{"label":"Case Studies","href":"#cases"},{"label":"About","href":"#about"},{"label":"Contact","href":"#cta"}]'::jsonb,
  social_links jsonb NOT NULL DEFAULT '[{"label":"LinkedIn","href":"#","visible":true},{"label":"X / Twitter","href":"#","visible":true},{"label":"GitHub","href":"#","visible":true},{"label":"YouTube","href":"#","visible":true}]'::jsonb,
  favicon_url text NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Auth can update settings" ON public.site_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth can insert settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (true);

INSERT INTO public.site_settings (id) VALUES (gen_random_uuid());
