
-- Pages table
CREATE TABLE public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  seo_title text NOT NULL DEFAULT '',
  seo_description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published pages" ON public.pages FOR SELECT USING (true);
CREATE POLICY "Auth can insert pages" ON public.pages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth can update pages" ON public.pages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth can delete pages" ON public.pages FOR DELETE TO authenticated USING (true);

-- Page blocks table
CREATE TABLE public.page_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  block_type text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.page_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read visible blocks" ON public.page_blocks FOR SELECT USING (true);
CREATE POLICY "Auth can insert blocks" ON public.page_blocks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth can update blocks" ON public.page_blocks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth can delete blocks" ON public.page_blocks FOR DELETE TO authenticated USING (true);

-- Storage bucket for page builder images
INSERT INTO storage.buckets (id, name, public) VALUES ('page-builder', 'page-builder', true);

CREATE POLICY "Anyone can read page-builder files" ON storage.objects FOR SELECT USING (bucket_id = 'page-builder');
CREATE POLICY "Auth can upload page-builder files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'page-builder');
CREATE POLICY "Auth can update page-builder files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'page-builder');
CREATE POLICY "Auth can delete page-builder files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'page-builder');
