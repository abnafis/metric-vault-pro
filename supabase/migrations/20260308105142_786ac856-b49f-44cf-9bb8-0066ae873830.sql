
CREATE TABLE public.platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  link TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read platforms" ON public.platforms FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Auth can insert platforms" ON public.platforms FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth can update platforms" ON public.platforms FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth can delete platforms" ON public.platforms FOR DELETE TO authenticated USING (true);

INSERT INTO storage.buckets (id, name, public) VALUES ('platform-logos', 'platform-logos', true);

CREATE POLICY "Anyone can view platform logos" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'platform-logos');
CREATE POLICY "Auth can upload platform logos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'platform-logos');
CREATE POLICY "Auth can update platform logos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'platform-logos');
CREATE POLICY "Auth can delete platform logos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'platform-logos');
