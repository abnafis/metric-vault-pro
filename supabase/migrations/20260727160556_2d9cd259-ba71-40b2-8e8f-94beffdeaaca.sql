
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS cta_link text NOT NULL DEFAULT '#contact',
  ADD COLUMN IF NOT EXISTS cta_style text NOT NULL DEFAULT 'link',
  ADD COLUMN IF NOT EXISTS icon_image_url text,
  ADD COLUMN IF NOT EXISTS card_bg_preset text NOT NULL DEFAULT 'light',
  ADD COLUMN IF NOT EXISTS card_bg_color text,
  ADD COLUMN IF NOT EXISTS card_bg_image_url text,
  ADD COLUMN IF NOT EXISTS price_label text,
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.services_cta (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  eyebrow text NOT NULL DEFAULT '— Not sure what you need?',
  headline text NOT NULL DEFAULT 'Let''s diagnose your tracking in',
  headline_highlight text NOT NULL DEFAULT '15 minutes.',
  button_label text NOT NULL DEFAULT 'Free audit call',
  button_link text NOT NULL DEFAULT '#contact',
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.services_cta TO anon, authenticated;
GRANT ALL ON public.services_cta TO service_role;

ALTER TABLE public.services_cta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "services_cta public read" ON public.services_cta FOR SELECT USING (true);
CREATE POLICY "services_cta authed insert" ON public.services_cta FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "services_cta authed update" ON public.services_cta FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE TRIGGER services_cta_set_updated_at
  BEFORE UPDATE ON public.services_cta
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.services_cta (id) VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;
