
-- Lock down coa-pdfs bucket writes (uploads now go through edge function w/ service role)
DROP POLICY IF EXISTS "Anyone can upload coa-pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update coa-pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete coa-pdfs" ON storage.objects;

-- Explicit deny-by-default on quotes (all access via admin edge function w/ service role)
DROP POLICY IF EXISTS "Deny all public access to quotes" ON public.quotes;
CREATE POLICY "Deny all public access to quotes"
  ON public.quotes
  AS RESTRICTIVE
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

COMMENT ON TABLE public.quotes IS 'Locked down: all access goes through admin-manage-codes edge function with service_role. No direct client access.';
