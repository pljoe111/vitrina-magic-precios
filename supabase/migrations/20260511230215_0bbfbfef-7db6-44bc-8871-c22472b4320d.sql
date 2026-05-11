CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read app settings"
ON public.app_settings
FOR SELECT
TO public
USING (true);

INSERT INTO public.app_settings (key, value)
VALUES ('free_manual_until', 'null'::jsonb)
ON CONFLICT (key) DO NOTHING;