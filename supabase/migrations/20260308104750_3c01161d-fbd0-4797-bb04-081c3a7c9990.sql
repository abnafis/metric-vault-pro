
CREATE TABLE public.case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  problem TEXT NOT NULL,
  solution TEXT NOT NULL,
  metrics JSONB NOT NULL DEFAULT '[]',
  chart_data JSONB DEFAULT '[]',
  image_url TEXT,
  client_name TEXT,
  platform_used TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read case studies"
  ON public.case_studies FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Authenticated can insert case studies"
  ON public.case_studies FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update case studies"
  ON public.case_studies FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can delete case studies"
  ON public.case_studies FOR DELETE TO authenticated USING (true);

INSERT INTO storage.buckets (id, name, public) VALUES ('case-studies', 'case-studies', true);

CREATE POLICY "Anyone can view case study images"
  ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'case-studies');

CREATE POLICY "Auth can upload case study images"
  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'case-studies');

CREATE POLICY "Auth can update case study images"
  ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'case-studies');

CREATE POLICY "Auth can delete case study images"
  ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'case-studies');
