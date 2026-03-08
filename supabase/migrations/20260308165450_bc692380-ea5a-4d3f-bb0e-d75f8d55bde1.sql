
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS site_name text NOT NULL DEFAULT 'TrackRight',
  ADD COLUMN IF NOT EXISTS site_tagline text NOT NULL DEFAULT 'Web Analytics & Conversion Tracking Specialist',
  ADD COLUMN IF NOT EXISTS logo_url text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS dark_logo_url text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS page_titles jsonb NOT NULL DEFAULT '{
    "homepage": {"title": "Home", "meta_title": "TrackRight — Web Analytics & Conversion Tracking", "meta_description": "Expert GA4, GTM, Server-Side Tracking & Conversion implementation for data-driven businesses."},
    "blog": {"title": "Blog", "meta_title": "Blog | TrackRight", "meta_description": "Insights on web analytics, tracking, and conversion optimization."},
    "services": {"title": "Services", "meta_title": "Services | TrackRight", "meta_description": "Professional analytics and tracking services."},
    "case_studies": {"title": "Case Studies", "meta_title": "Case Studies | TrackRight", "meta_description": "Real results from our tracking implementations."},
    "contact": {"title": "Contact", "meta_title": "Contact | TrackRight", "meta_description": "Get in touch for a free tracking audit."}
  }'::jsonb,
  ADD COLUMN IF NOT EXISTS title_format text NOT NULL DEFAULT '{page} | {site}';
