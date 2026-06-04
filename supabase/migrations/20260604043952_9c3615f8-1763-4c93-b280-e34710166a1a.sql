
-- 1. Table
CREATE TABLE public.test_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL,
  product_name text NOT NULL,
  batch_number text NOT NULL,
  lot_number text NOT NULL,
  test_date date,
  exp_date text,
  purity numeric,
  potency text,
  contaminants text DEFAULT 'None detected',
  sterility text DEFAULT 'Pass',
  endotoxins text DEFAULT 'Pass',
  coa_url text,
  coa_label text,
  lab_partner_url text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Grants
GRANT SELECT ON public.test_batches TO anon, authenticated;
GRANT ALL ON public.test_batches TO service_role;

-- 3. RLS
ALTER TABLE public.test_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view non-disabled batches"
  ON public.test_batches FOR SELECT
  USING (status <> 'disabled');

-- 4. updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_test_batches_updated_at
  BEFORE UPDATE ON public.test_batches
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. Public read on coa-pdfs storage bucket
CREATE POLICY "Public read coa-pdfs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'coa-pdfs');

-- 6. Seed existing 14 entries
INSERT INTO public.test_batches (product_id, product_name, batch_number, lot_number, test_date, exp_date, purity, potency, coa_url, coa_label, lab_partner_url, status) VALUES
('retatrutide','Retatrutide 60mg','RT-60-LYO-B251214','RT-60-LYO-B251214','2026-02-23','02/2031',99.7,'66.4mg (110.7%)','/certificates/COA-Retatrutide-RT-60-LYO-B251214.pdf','Purity/Potency (BTLabs)','https://btlabtesting.com/','published'),
('tirzepatide','Tirzepatide 120mg','TZP-120-LYO-B260126','TZP-120-LYO-B260126','2026-02-23','02/2031',99.8,'143.3mg (119.4%)','/certificates/COA-Tirzepatide-TZP-120-LYO-B260126.pdf','Purity/Potency (BTLabs)','https://btlabtesting.com/','published'),
('tirzepatide','Tirzepatide 60mg','TZP-60-LYO-B260115','TZP-60-LYO-B260115','2026-02-23','02/2031',99.8,'63.8mg (106.4%)','/certificates/COA-Tirzepatide-TZP-60-LYO-B260115.pdf','Purity/Potency (BTLabs)','https://btlabtesting.com/','published'),
('tirzepatide','Tirzepatide 30mg','TZP-30-LYO-B260112','TZP-30-LYO-B260112','2026-02-23','02/2031',99.8,'31.2mg (104.1%)','/certificates/COA-Tirzepatide-TZP-30-LYO-B260112.pdf','Purity/Potency (BTLabs)','https://btlabtesting.com/','published'),
('bpc-157','BPC-157 10mg','BPC-10-LYO-B260126','BPC-10-LYO-B260126','2026-02-23','02/2031',99.8,'13.8mg (137.6%)','/certificates/COA-BPC-157-BPC-10-LYO-B260126.pdf','Purity/Potency (BTLabs)','https://btlabtesting.com/','published'),
('tesamorelin','Tesamorelin 2mg','TSM-2-LYO-251230','TSM-2-LYO-251230','2026-02-23','02/2031',99.7,'2.4mg (118.2%)','/certificates/COA-Tesamorelin-TSM-2-LYO-251230.pdf','Purity/Potency (BTLabs)','https://btlabtesting.com/','published'),
('tb-500','TB-500 10mg','TB-10-LYO-B260204','TB-10-LYO-B260204','2026-02-23','02/2031',99.7,'10.3mg (102.9%)','/certificates/COA-TB-500-TB-10-LYO-B260204.pdf','Purity/Potency (BTLabs)','https://btlabtesting.com/','published'),
('ghk-cu','GHK-Cu 50mg','GHK-50-LYO-B260204','GHK-50-LYO-B260204','2026-02-23','02/2031',99.7,'48.7mg (97.4%)','/certificates/COA-GHK-Cu-GHK-50-LYO-B260204.pdf','Purity/Potency (BTLabs)','https://btlabtesting.com/','published'),
('sermorelin','Sermorelin 5mg','SRM-5-LYO-B251216','SRM-5-LYO-B251216','2026-02-23','02/2031',99.4,'5.8mg (115.2%)','/certificates/COA-Sermorelin-SRM-5-LYO-B251216.pdf','Purity/Potency (BTLabs)','https://btlabtesting.com/','published'),
('tirzepatide','Tirzepatide 30mg','TZP-30-LYO-B01-2510','TZP-30-LYO-B01-2510','2025-12-26','12/2030',99.0,'34.3mg (114.3%)','/certificates/COA-Tirzepatide-TZP-30-LYO-B01-2510.pdf','Purity/Potency (BTLabs)','https://btlabtesting.com/','published'),
('retatrutide','Retatrutide 30mg','RTP-30-LYO-B01-2510','RTP-30-LYO-B01-2510','2025-12-26','12/2030',98.6,'33.6mg (111.8%)','/certificates/COA-Retatrutide-RTP-30-LYO-B01-2510.pdf','Purity/Potency (BTLabs)','https://btlabtesting.com/','published'),
('nad','NAD+ 500mg','NAD-500-LYO-B01-2510','NAD-500-LYO-B01-2510','2025-12-26','12/2030',99.9,'559.1mg (111.8%)','/certificates/COA-NAD-500-LYO-B01-2510.pdf','Purity/Potency (BTLabs)','https://btlabtesting.com/','published'),
('tirzepatide','Tirzepatide 20mg','ALCT20-8','ALCT20-8','2025-11-24','11/2030',99.95,'20.4mg (102.1%)','/certificates/COA-Tirzepatide-TZP-20-ALCT20-8.pdf','Purity/Potency (Krause Analytical)','https://krauseanalytical.com/','published'),
('tirzepatide','Tirzepatide 60mg','TZP-60-LYO-B01-2510','TZP-60-LYO-B01-2510','2025-12-26','12/2030',99.4,'67.6mg (112.7%)','/certificates/COA-Tirzepatide-TZP-60-LYO-B01-2510.pdf','Purity/Potency (BTLabs)','https://btlabtesting.com/','published');
