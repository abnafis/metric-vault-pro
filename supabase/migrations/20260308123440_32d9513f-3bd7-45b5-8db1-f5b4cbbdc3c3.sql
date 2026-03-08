
-- Blog categories
CREATE TABLE public.blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read blog categories" ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "Auth can insert blog categories" ON public.blog_categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth can update blog categories" ON public.blog_categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth can delete blog categories" ON public.blog_categories FOR DELETE TO authenticated USING (true);

-- Blog posts
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text NOT NULL DEFAULT '',
  excerpt text NOT NULL DEFAULT '',
  featured_image_url text,
  author_name text NOT NULL DEFAULT 'Admin',
  category_id uuid REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  tags text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft',
  featured boolean NOT NULL DEFAULT false,
  publish_date timestamptz,
  meta_title text NOT NULL DEFAULT '',
  meta_description text NOT NULL DEFAULT '',
  og_image_url text,
  read_time_minutes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read published posts" ON public.blog_posts FOR SELECT USING (true);
CREATE POLICY "Auth can insert blog posts" ON public.blog_posts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth can update blog posts" ON public.blog_posts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth can delete blog posts" ON public.blog_posts FOR DELETE TO authenticated USING (true);

-- Storage bucket for blog images
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true);
CREATE POLICY "Anyone can read blog images" ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');
CREATE POLICY "Auth can upload blog images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'blog-images');
CREATE POLICY "Auth can update blog images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'blog-images');
CREATE POLICY "Auth can delete blog images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'blog-images');

-- Seed default categories
INSERT INTO public.blog_categories (name, slug, sort_order) VALUES
  ('GA4', 'ga4', 0),
  ('Google Tag Manager', 'google-tag-manager', 1),
  ('Conversion Tracking', 'conversion-tracking', 2),
  ('Server-Side Tracking', 'server-side-tracking', 3),
  ('Marketing Analytics', 'marketing-analytics', 4);
