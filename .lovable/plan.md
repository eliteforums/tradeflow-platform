

## Plan: Fix Emergency Contact Display on SPOC Dashboard

### Problem
When an expert escalates a BlackBox session, the emergency contact info should appear on the SPOC dashboard alongside the reason. Two issues prevent this:

1. **Missing foreign key on `escalation_requests.spoc_id`** — The SPOC dashboard query uses `profiles!escalation_requests_spoc_id_fkey(username)` but no FK constraint exists. This causes the query to fail silently, potentially preventing escalations from loading.

2. **Edge function may still fail** — The `get-emergency-contact` function was fixed (`getClaims → getUser`) but if it returns an error response wrapped in `data` (not thrown as `error`), the client-side code in `ExpertL3AlertPanel` might miss it. Also, `supabase.functions.invoke` returns errors in `data.error` sometimes.

3. **SPOC query doesn't select `trigger_snippet` fields explicitly** — Uses `*` which should include it, but the FK join failure could mask the entire response.

### Changes

#### 1. Database Migration — Add FK on `escalation_requests.spoc_id`
```sql
ALTER TABLE public.escalation_requests
  ADD CONSTRAINT escalation_requests_spoc_id_fkey
  FOREIGN KEY (spoc_id) REFERENCES public.profiles(id);
```
This fixes the Supabase PostgREST join syntax used in both `SPOCDashboardContent.tsx` and `EscalationManager.tsx`.

#### 2. `src/components/spoc/SPOCDashboardContent.tsx` — Defensive query
Update the escalation query to not rely on FK join as primary. Use a simpler `select("*")` query, then separately fetch the SPOC username if needed. Or keep the join but add error handling.

#### 3. `src/components/expert/ExpertL3AlertPanel.tsx` — Better contact data extraction
The `supabase.functions.invoke` response might have the contact nested differently. Add logging and ensure the contact data is properly extracted even if it comes back as `{ data: { contact: {...} } }` vs `{ contact: {...} }`.

### Files Modified
- Database migration — Add FK constraint on `escalation_requests.spoc_id`
- `src/components/spoc/SPOCDashboardContent.tsx` — Defensive escalation query
- `src/components/expert/ExpertL3AlertPanel.tsx` — Robust contact extraction + better error logging

