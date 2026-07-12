
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.section_headers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  eyebrow text,
  title text,
  subtitle text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.section_headers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.section_headers TO authenticated;
GRANT ALL ON public.section_headers TO service_role;

ALTER TABLE public.section_headers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read section_headers" ON public.section_headers FOR SELECT USING (true);
CREATE POLICY "Authenticated manage section_headers" ON public.section_headers FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TRIGGER trg_section_headers_updated_at
  BEFORE UPDATE ON public.section_headers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.section_headers (slug, eyebrow, title, subtitle) VALUES
  ('why_not_scaling', 'Why your ads aren''t scaling', 'Stop guessing. Start tracking every conversion.', NULL),
  ('metrics', NULL, NULL, NULL),
  ('faqs', 'FAQs', 'Questions you may Ask', 'Any queries you have'),
  ('process', 'Process', 'A clear path from audit to accurate data.', NULL),
  ('logo_marquee', NULL, 'Trusted by teams at', NULL);
