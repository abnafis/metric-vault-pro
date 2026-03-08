
ALTER TABLE public.about_content ADD COLUMN profile_image_url text DEFAULT NULL;

INSERT INTO storage.buckets (id, name, public) VALUES ('profile-images', 'profile-images', true);

CREATE POLICY "Anyone can read profile images" ON storage.objects FOR SELECT USING (bucket_id = 'profile-images');
CREATE POLICY "Auth can upload profile images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profile-images');
CREATE POLICY "Auth can update profile images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'profile-images');
CREATE POLICY "Auth can delete profile images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'profile-images');
