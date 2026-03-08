
CREATE TABLE public.audit_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  website_url text NOT NULL,
  platforms text NOT NULL DEFAULT '',
  problem_description text NOT NULL DEFAULT '',
  monthly_ad_spend text,
  status text NOT NULL DEFAULT 'new',
  admin_notes text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert audit requests" ON public.audit_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Auth can read audit requests" ON public.audit_requests
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Auth can update audit requests" ON public.audit_requests
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Auth can delete audit requests" ON public.audit_requests
  FOR DELETE TO authenticated USING (true);
