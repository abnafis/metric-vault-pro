
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  text TEXT NOT NULL,
  avatar_url TEXT,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  platform TEXT NOT NULL DEFAULT 'Direct Client',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read testimonials" ON public.testimonials FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Auth can insert testimonials" ON public.testimonials FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth can update testimonials" ON public.testimonials FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth can delete testimonials" ON public.testimonials FOR DELETE TO authenticated USING (true);

INSERT INTO storage.buckets (id, name, public) VALUES ('testimonial-avatars', 'testimonial-avatars', true);

CREATE POLICY "Anyone can view testimonial avatars" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'testimonial-avatars');
CREATE POLICY "Auth can upload testimonial avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'testimonial-avatars');
CREATE POLICY "Auth can update testimonial avatars" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'testimonial-avatars');
CREATE POLICY "Auth can delete testimonial avatars" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'testimonial-avatars');
