
-- Funnels table
CREATE TABLE public.funnels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft',
  redirect_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.funnels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published funnels" ON public.funnels FOR SELECT USING (true);
CREATE POLICY "Auth can insert funnels" ON public.funnels FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth can update funnels" ON public.funnels FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth can delete funnels" ON public.funnels FOR DELETE TO authenticated USING (true);

-- Funnel steps table
CREATE TABLE public.funnel_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funnel_id UUID NOT NULL REFERENCES public.funnels(id) ON DELETE CASCADE,
  step_type TEXT NOT NULL DEFAULT 'form',
  title TEXT NOT NULL DEFAULT '',
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.funnel_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read funnel steps" ON public.funnel_steps FOR SELECT USING (true);
CREATE POLICY "Auth can insert funnel steps" ON public.funnel_steps FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth can update funnel steps" ON public.funnel_steps FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth can delete funnel steps" ON public.funnel_steps FOR DELETE TO authenticated USING (true);

-- Funnel leads table
CREATE TABLE public.funnel_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funnel_id UUID NOT NULL REFERENCES public.funnels(id) ON DELETE CASCADE,
  step_id UUID REFERENCES public.funnel_steps(id) ON DELETE SET NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.funnel_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert leads" ON public.funnel_leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth can read leads" ON public.funnel_leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth can delete leads" ON public.funnel_leads FOR DELETE TO authenticated USING (true);
