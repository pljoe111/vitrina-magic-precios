-- Create leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  profession TEXT NOT NULL,
  specialty TEXT,
  practice_type TEXT NOT NULL,
  clinic_name TEXT,
  role TEXT NOT NULL,
  patients_per_month TEXT NOT NULL,
  offers_peptides BOOLEAN NOT NULL DEFAULT false,
  uses_glp1 BOOLEAN NOT NULL DEFAULT false,
  interests TEXT[] NOT NULL DEFAULT '{}',
  main_intent TEXT NOT NULL,
  consent BOOLEAN NOT NULL DEFAULT true,
  lead_score INTEGER NOT NULL DEFAULT 0,
  lead_classification TEXT NOT NULL DEFAULT 'FRIO'
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (public form)
CREATE POLICY "Anyone can submit a lead"
  ON public.leads
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to read (future admin)
CREATE POLICY "Authenticated users can read leads"
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (true);