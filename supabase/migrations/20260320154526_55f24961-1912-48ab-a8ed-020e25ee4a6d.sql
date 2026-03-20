
CREATE TABLE public.access_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  label text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to select active codes (for validation)
CREATE POLICY "Anyone can validate codes"
  ON public.access_codes
  FOR SELECT
  USING (is_active = true AND expires_at > now());
