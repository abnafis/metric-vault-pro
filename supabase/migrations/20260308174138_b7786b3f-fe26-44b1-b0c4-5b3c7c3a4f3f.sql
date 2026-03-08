
-- Process Steps table
CREATE TABLE public.process_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'Settings',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.process_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read process steps" ON public.process_steps FOR SELECT USING (true);
CREATE POLICY "Auth can insert process steps" ON public.process_steps FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth can update process steps" ON public.process_steps FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth can delete process steps" ON public.process_steps FOR DELETE TO authenticated USING (true);

-- Dashboard showcase content table
CREATE TABLE public.dashboard_showcase (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_label text NOT NULL DEFAULT 'Dashboard',
  heading text NOT NULL DEFAULT 'Analytics',
  heading_highlight text NOT NULL DEFAULT 'Dashboard',
  description text NOT NULL DEFAULT 'Custom Looker Studio dashboards that give you real-time visibility into every metric that matters.',
  metrics jsonb NOT NULL DEFAULT '[{"label":"Total Revenue","value":"$482K","change":"+12.4%"},{"label":"Conversions","value":"12,847","change":"+8.2%"},{"label":"Avg. ROAS","value":"5.2x","change":"+15.7%"},{"label":"Active Events","value":"248","change":"+3.1%"}]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.dashboard_showcase ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read dashboard showcase" ON public.dashboard_showcase FOR SELECT USING (true);
CREATE POLICY "Auth can insert dashboard showcase" ON public.dashboard_showcase FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth can update dashboard showcase" ON public.dashboard_showcase FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
