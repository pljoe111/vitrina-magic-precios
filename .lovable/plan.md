
## Goal

Replace the hardcoded `src/data/test-results.ts` with a database-backed system, and add an admin screen in `/alchem-admin` to create batches (with or without CoA), upload/update CoA PDFs, and disable batches.

## What you'll be able to do

In `/alchem-admin → Análisis (Batches)`:
- **Create a batch** by picking a product and entering the batch/lot number. Status defaults to `Reporte Pendiente` if no CoA is uploaded yet.
- **Upload a CoA PDF** to a batch. Once uploaded, the batch flips to `Publicado` and shows up on `/test-results` with all the analytical fields (purity, potency, sterility, etc.).
- **Edit** any field on a batch (dates, purity, potency, lab partner, replace the PDF).
- **Disable** a batch — it stays in the DB for audit but is hidden from `/test-results`.
- **Re-enable** or **delete** a batch.

On `/test-results`:
- Pending batches appear in the list with a `Reporte Pendiente` badge instead of a purity %, and the detail view shows an explanatory message instead of the PDF iframe.
- Published batches behave exactly like today.
- Disabled batches are not shown.

## Technical details

### 1. Database

New table `public.test_batches`:

| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| product_id | text | matches `src/data/products.ts` id |
| product_name | text | denormalized, e.g. "Tirzepatide 60mg" |
| batch_number | text | |
| lot_number | text | usually = batch_number |
| test_date | date | nullable while pending |
| exp_date | text | free text like "02/2031", nullable |
| purity | numeric | nullable |
| potency | text | nullable |
| contaminants | text | default "None detected" |
| sterility | text | default "Pass" |
| endotoxins | text | default "Pass" |
| coa_url | text | public URL from storage bucket, nullable |
| coa_label | text | e.g. "Purity/Potency (BTLabs)" |
| lab_partner_url | text | nullable |
| status | text | `pending` \| `published` \| `disabled` |
| created_at / updated_at | timestamptz | |

RLS:
- `anon` + `authenticated` can `SELECT` rows where `status <> 'disabled'`.
- All writes go through the admin edge function with service role (no direct write policies).
- `GRANT SELECT` to anon/authenticated, `GRANT ALL` to service_role.

A one-time seed inserts the 14 existing entries from `src/data/test-results.ts` as `published` rows so nothing disappears from the public page.

### 2. Storage

New public bucket `coa-pdfs` (created via `storage_create_bucket`). Files stored at `coa-pdfs/<batch_number>.pdf`. Public-read RLS policy on `storage.objects` for that bucket so the iframe on `/test-results` keeps working. Uploads happen from the admin UI via `supabase.storage.from("coa-pdfs").upload(...)` after the admin edge function returns OK (or via a signed approach — keeping it simple with direct client upload using a temporary login-gated screen is acceptable since admin auth is already enforced before they can see the page).

### 3. Edge function

Extend `supabase/functions/admin-manage-codes/index.ts` with actions:
- `list_batches`
- `create_batch` (product_id, product_name, batch_number, optional analytical fields)
- `update_batch` (id + patch)
- `set_batch_status` (id, status: pending/published/disabled)
- `delete_batch` (id)

Status auto-promotes from `pending` → `published` when `coa_url` becomes non-null on update (unless explicitly set to `disabled`).

### 4. Admin UI

New page `src/pages/AdminBatches.tsx` at route `/alchem-admin/batches`, linked from the top bar of `AlchemAdmin.tsx` next to "Leads / Catálogo / Cotizador". Features:
- Table of all batches with status badge (Pendiente / Publicado / Deshabilitado), product, batch #, purity, test date, actions.
- Filter by status.
- "Crear lote" dialog: product picker (from `products.ts`), batch_number, lot_number, optional CoA upload + analytical fields.
- Row actions: edit (opens dialog with all fields + file upload), toggle disable, delete.
- File upload uses the `coa-pdfs` bucket; on success the public URL is written to `coa_url` and status becomes `published`.

### 5. Public page rewrite

`src/pages/TestResults.tsx` switches from importing `testResults` to fetching from `test_batches` (filtered to `status <> 'disabled'`, ordered by `test_date desc nulls last, created_at desc`). Pending rows render:
- List: `Pendiente` badge instead of purity, "—" for date.
- Detail: no iframe; instead a "Reporte de laboratorio pendiente" card explaining the existing internal-pass message that's already in the QA Process section.

`src/data/test-results.ts` is kept only for the one-time seed migration and then can be deleted in a follow-up.

### 6. Files touched

- `supabase/migrations/<new>.sql` — table + grants + RLS + seed + bucket RLS policy
- `supabase--storage_create_bucket coa-pdfs public=true`
- `supabase/functions/admin-manage-codes/index.ts` — new actions
- `src/pages/AdminBatches.tsx` — new
- `src/App.tsx` — new route
- `src/pages/AlchemAdmin.tsx` — link in header
- `src/pages/TestResults.tsx` — fetch from DB, handle pending state
