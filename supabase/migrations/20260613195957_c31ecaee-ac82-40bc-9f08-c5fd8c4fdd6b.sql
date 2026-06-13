
CREATE POLICY "Anyone can upload coa-pdfs" ON storage.objects
  FOR INSERT TO public
  WITH CHECK (bucket_id = 'coa-pdfs');

CREATE POLICY "Anyone can update coa-pdfs" ON storage.objects
  FOR UPDATE TO public
  USING (bucket_id = 'coa-pdfs')
  WITH CHECK (bucket_id = 'coa-pdfs');

CREATE POLICY "Anyone can delete coa-pdfs" ON storage.objects
  FOR DELETE TO public
  USING (bucket_id = 'coa-pdfs');
