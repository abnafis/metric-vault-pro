
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS eyebrow TEXT,
  ADD COLUMN IF NOT EXISTS badge TEXT,
  ADD COLUMN IF NOT EXISTS accent TEXT NOT NULL DEFAULT 'amber',
  ADD COLUMN IF NOT EXISTS cta_label TEXT NOT NULL DEFAULT 'Book this service';

INSERT INTO public.section_headers (slug, eyebrow, title, subtitle)
VALUES ('services', '— What I do', 'Tracking that actually tracks.',
        'Five focused services — from pixel installs to server-side offline conversions — built to give your ad platforms the clean data they need to spend smarter.')
ON CONFLICT (slug) DO NOTHING;
