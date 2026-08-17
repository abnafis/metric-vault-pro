ALTER TABLE public.hero_content
  ADD COLUMN IF NOT EXISTS platform_chips jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS tracked_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS flow_title text NOT NULL DEFAULT 'Accurate Data Flow',
  ADD COLUMN IF NOT EXISTS flow_nodes jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS flow_destinations jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS flow_footer jsonb NOT NULL DEFAULT '[]'::jsonb;