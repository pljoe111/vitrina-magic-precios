
-- 1. Lock down quotes: remove all permissive public policies. All access goes through admin edge function (service_role).
DROP POLICY IF EXISTS "Anyone can delete quotes" ON public.quotes;
DROP POLICY IF EXISTS "Anyone can insert quotes" ON public.quotes;
DROP POLICY IF EXISTS "Anyone can read quotes" ON public.quotes;
DROP POLICY IF EXISTS "Anyone can update quotes" ON public.quotes;
REVOKE ALL ON public.quotes FROM anon, authenticated;
GRANT ALL ON public.quotes TO service_role;

-- 2. Lock down access_codes: remove public select (it exposed live codes). Validation now via edge function.
DROP POLICY IF EXISTS "Anyone can validate codes" ON public.access_codes;
REVOKE ALL ON public.access_codes FROM anon, authenticated;
GRANT ALL ON public.access_codes TO service_role;

-- 3. Storage: drop the catch-all public-read policy on coa-pdfs (bucket will be flipped to public to match intent).
DROP POLICY IF EXISTS "Public read coa-pdfs" ON storage.objects;
