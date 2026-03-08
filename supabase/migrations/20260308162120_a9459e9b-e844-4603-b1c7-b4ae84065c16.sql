
CREATE TABLE public.custom_scripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  script_type TEXT NOT NULL DEFAULT 'javascript',
  code TEXT NOT NULL DEFAULT '',
  placement TEXT NOT NULL DEFAULT 'head',
  enabled BOOLEAN NOT NULL DEFAULT false,
  page_path TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_scripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read enabled scripts" ON public.custom_scripts
  FOR SELECT USING (true);

CREATE POLICY "Auth can insert scripts" ON public.custom_scripts
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Auth can update scripts" ON public.custom_scripts
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Auth can delete scripts" ON public.custom_scripts
  FOR DELETE TO authenticated USING (true);
