
CREATE TABLE public.quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  data jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read quotes" ON public.quotes FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert quotes" ON public.quotes FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update quotes" ON public.quotes FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete quotes" ON public.quotes FOR DELETE TO public USING (true);
