-- Hero: floating tiles + status badge
ALTER TABLE public.hero_content
  ADD COLUMN IF NOT EXISTS status_label text NOT NULL DEFAULT 'Currently',
  ADD COLUMN IF NOT EXISTS status_value text NOT NULL DEFAULT 'Analytics Engineer',
  ADD COLUMN IF NOT EXISTS since_label text NOT NULL DEFAULT 'Since',
  ADD COLUMN IF NOT EXISTS since_value text NOT NULL DEFAULT '2019',
  ADD COLUMN IF NOT EXISTS projects_label text NOT NULL DEFAULT 'Projects',
  ADD COLUMN IF NOT EXISTS projects_value text NOT NULL DEFAULT '100+';

-- Case Studies section header (single-row settings stored in dashboard_showcase? No — new table)
CREATE TABLE IF NOT EXISTS public.case_studies_meta (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  eyebrow text NOT NULL DEFAULT '— Selected work',
  title text NOT NULL DEFAULT 'Real results,',
  title_highlight text NOT NULL DEFAULT 'proven',
  title_suffix text NOT NULL DEFAULT 'impact.',
  subtitle text NOT NULL DEFAULT 'A handful of projects where measurement clarity unlocked meaningful growth.',
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.case_studies_meta ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone read case_studies_meta" ON public.case_studies_meta FOR SELECT USING (true);
CREATE POLICY "Auth insert case_studies_meta" ON public.case_studies_meta FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update case_studies_meta" ON public.case_studies_meta FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
INSERT INTO public.case_studies_meta DEFAULT VALUES;

-- Testimonials section header
CREATE TABLE IF NOT EXISTS public.testimonials_meta (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  eyebrow text NOT NULL DEFAULT '— Voices',
  title text NOT NULL DEFAULT 'Trusted by teams',
  title_highlight text NOT NULL DEFAULT 'worldwide',
  title_suffix text NOT NULL DEFAULT '.',
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.testimonials_meta ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone read testimonials_meta" ON public.testimonials_meta FOR SELECT USING (true);
CREATE POLICY "Auth insert testimonials_meta" ON public.testimonials_meta FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update testimonials_meta" ON public.testimonials_meta FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
INSERT INTO public.testimonials_meta DEFAULT VALUES;

-- Blog section header
CREATE TABLE IF NOT EXISTS public.blog_section_meta (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  eyebrow text NOT NULL DEFAULT '— Journal',
  title text NOT NULL DEFAULT 'From the',
  title_highlight text NOT NULL DEFAULT 'blog',
  title_suffix text NOT NULL DEFAULT '.',
  view_all_text text NOT NULL DEFAULT 'View all articles',
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.blog_section_meta ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone read blog_section_meta" ON public.blog_section_meta FOR SELECT USING (true);
CREATE POLICY "Auth insert blog_section_meta" ON public.blog_section_meta FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update blog_section_meta" ON public.blog_section_meta FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
INSERT INTO public.blog_section_meta DEFAULT VALUES;

-- Footer headline (extend site_settings)
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS footer_eyebrow text NOT NULL DEFAULT '— Get in touch',
  ADD COLUMN IF NOT EXISTS footer_headline text NOT NULL DEFAULT 'Let''s build',
  ADD COLUMN IF NOT EXISTS footer_headline_highlight text NOT NULL DEFAULT 'accurate',
  ADD COLUMN IF NOT EXISTS footer_headline_suffix text NOT NULL DEFAULT 'data together.',
  ADD COLUMN IF NOT EXISTS footer_navigate_label text NOT NULL DEFAULT 'Navigate',
  ADD COLUMN IF NOT EXISTS footer_elsewhere_label text NOT NULL DEFAULT 'Elsewhere';

-- CTA bullets
ALTER TABLE public.cta_content
  ADD COLUMN IF NOT EXISTS bullets jsonb NOT NULL DEFAULT '["Free 30-minute audit call","Detailed loom walkthrough","No obligation, no spam"]'::jsonb,
  ADD COLUMN IF NOT EXISTS eyebrow text NOT NULL DEFAULT '— Contact';