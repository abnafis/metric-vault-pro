
-- 1. Roles infrastructure
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed existing owner account as admin so the admin panel keeps working
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users
ON CONFLICT (user_id, role) DO NOTHING;

-- 2. Public schema: every policy currently granted to bare "authenticated" becomes admin-only
DO $$
DECLARE p RECORD; cond text := 'public.has_role(auth.uid(), ''admin''::public.app_role)';
BEGIN
  FOR p IN
    SELECT schemaname, tablename, policyname, cmd
    FROM pg_policies
    WHERE schemaname = 'public'
      AND roles = '{authenticated}'
      AND tablename <> 'user_roles'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, p.tablename);
    IF p.cmd = 'INSERT' THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (%s)', p.policyname, p.tablename, cond);
    ELSIF p.cmd = 'SELECT' THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (%s)', p.policyname, p.tablename, cond);
    ELSIF p.cmd = 'DELETE' THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (%s)', p.policyname, p.tablename, cond);
    ELSIF p.cmd = 'UPDATE' THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (%s) WITH CHECK (%s)', p.policyname, p.tablename, cond, cond);
    ELSE
      EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (%s) WITH CHECK (%s)', p.policyname, p.tablename, cond, cond);
    END IF;
  END LOOP;
END $$;

-- 3. Storage: scope write policies to admins, keep bucket scoping
DO $$
DECLARE p RECORD; cond text := 'public.has_role(auth.uid(), ''admin''::public.app_role)'; expr text;
BEGIN
  FOR p IN
    SELECT policyname, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND roles = '{authenticated}'
      AND cmd <> 'SELECT'
  LOOP
    expr := COALESCE(p.qual, p.with_check);
    EXECUTE format('DROP POLICY %I ON storage.objects', p.policyname);
    IF p.cmd = 'INSERT' THEN
      EXECUTE format('CREATE POLICY %I ON storage.objects FOR INSERT TO authenticated WITH CHECK ((%s) AND %s)', p.policyname, expr, cond);
    ELSIF p.cmd = 'DELETE' THEN
      EXECUTE format('CREATE POLICY %I ON storage.objects FOR DELETE TO authenticated USING ((%s) AND %s)', p.policyname, expr, cond);
    ELSE
      EXECUTE format('CREATE POLICY %I ON storage.objects FOR UPDATE TO authenticated USING ((%s) AND %s) WITH CHECK ((%s) AND %s)', p.policyname, expr, cond, expr, cond);
    END IF;
  END LOOP;
END $$;
