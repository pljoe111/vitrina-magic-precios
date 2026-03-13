

## Store Lead Form Answers

The form currently logs to console and redirects. There's no Supabase connected to this project, so we need to set up a backend to persist submissions.

### Approach: Lovable Cloud (Supabase)

1. **Enable Supabase via Lovable Cloud** — spin up a backend without needing an external account

2. **Create `leads` table** with migration:
   - `id` (uuid, PK)
   - `created_at` (timestamptz)
   - `full_name`, `email`, `phone`, `city`, `country` (text)
   - `profession`, `specialty`, `practice_type`, `clinic_name`, `role`, `patients_per_month`, `main_intent` (text)
   - `offers_peptides`, `uses_glp1` (boolean)
   - `interests` (text array)
   - `consent` (boolean)
   - `lead_score` (integer)
   - `lead_classification` (text — CALIENTE/TIBIO/FRIO)
   - RLS: enable with insert-only policy for anonymous users, select for authenticated (future admin)

3. **Update `LeadForm.tsx`**
   - Import Supabase client
   - On submit, insert the form data + computed score/classification into the `leads` table
   - Show error toast on failure

4. **Add Supabase client** (`src/integrations/supabase/client.ts`) — standard Lovable setup

### Files changed
- **New migration**: Create `leads` table
- **`src/integrations/supabase/client.ts`**: Supabase client init
- **`src/components/leads/LeadForm.tsx`**: Insert to Supabase on submit

### Viewing answers
Once stored, you can view submissions directly in the Supabase dashboard (Table Editor → `leads`). If you want an in-app admin view, we can build that as a follow-up.

