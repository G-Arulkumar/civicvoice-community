CREATE POLICY "Anyone can upload images" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'issue-images');

CREATE POLICY "Anyone can view images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'issue-images');