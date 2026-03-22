

## Plan: PRD v2-28 + CR v1.7 — Remaining Gaps Implementation

### Gap Analysis Summary

After comparing both documents against the current codebase, the following gaps remain:

| # | Gap | Impact | Files |
|---|-----|--------|-------|
| 1 | Therapist role not redirected from `/dashboard` | Therapists see student dashboard instead of their queue | `Dashboard.tsx`, `MobileDashboard.tsx` |
| 2 | Interns and therapists can't access `blackbox_sessions` (RLS blocks them) | TherapistDashboardContent queries fail silently — empty queue | DB migration |
| 3 | BlackBox ECC cost (30 ECC) not documented in student dashboard or CR | CR §21 defines BlackBox as a paid module but cost not shown | Already handled in `useBlackBoxSession` — no change needed |
| 4 | README outdated — references old AI model, missing therapist role docs | Misleading documentation | `README.md` |
| 5 | Therapist role not handled in `bulk-add-members` edge function | Can't bulk-create therapist accounts | `supabase/functions/bulk-add-members/index.ts` |
| 6 | Memory file outdated | Missing therapist role, Groq model info | `.lovable/memory/features/prd-implementation.md` |

### Already Correct (No Changes Needed)
- School institution type in admin UI (confirmed: university/school dropdown exists)
- Expert escalation button + AI Monitor badge (added in prior iteration)
- Peer Connect audio-only (video removed in prior iteration)  
- Therapist route access `allowedRoles: ["intern", "therapist"]` (done)
- Therapist in MemberManager, RoleManager, add-member edge function (done)
- Therapist nav items in DashboardLayout (done)
- ECC system fully implemented per §21 (ledger, caps, stability pool, bundles)
- L3 host-swap in TherapistDashboardContent
- Training lifecycle + tab locking for interns
- Connect portals on home page (Expert Connect, Peer Connect, BlackBox as separate buttons)

### Implementation Plan

**1. Therapist redirect from `/dashboard`**

Add `if (profile?.role === "therapist") return <Navigate to="/dashboard/therapist" replace />;` to both `Dashboard.tsx` (line 35) and `MobileDashboard.tsx` (line 70).

**2. RLS policies for intern + therapist on `blackbox_sessions`**

Add two new RLS policies via migration:
```sql
-- Allow interns to view and update queued/assigned blackbox sessions
CREATE POLICY "Interns can view blackbox sessions"
ON public.blackbox_sessions FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'intern'::app_role) AND (status = 'queued' OR therapist_id = auth.uid()));

CREATE POLICY "Interns can update blackbox sessions"  
ON public.blackbox_sessions FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'intern'::app_role) AND (status = 'queued' OR therapist_id = auth.uid()));

CREATE POLICY "Therapists can view blackbox sessions"
ON public.blackbox_sessions FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'therapist'::app_role) AND (status = 'queued' OR therapist_id = auth.uid()));

CREATE POLICY "Therapists can update blackbox sessions"
ON public.blackbox_sessions FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'therapist'::app_role) AND (status = 'queued' OR therapist_id = auth.uid()));
```

**3. Allow therapist in `bulk-add-members` edge function**

Add `"therapist"` to the `validRoles` array in `supabase/functions/bulk-add-members/index.ts`.

**4. Update README**

- Change AI reference from "Lovable AI Gateway (Gemini 2.5 Flash Lite)" to "Groq API (GPT OSS 20B 128k)"
- Add Therapist role to Role-Based Dashboards section
- Update Peer Connect description: "Audio + Chat" (no video)
- Add therapist to Database Schema user_roles description
- Update CR version references

**5. Update memory files**

Update `prd-implementation.md` to reflect all completed items from v2-28 and CR v1.7.

### Files to Edit
- `src/pages/dashboard/Dashboard.tsx` — 1 line add
- `src/components/mobile/MobileDashboard.tsx` — 1 line add
- `supabase/functions/bulk-add-members/index.ts` — add "therapist" to validRoles
- `README.md` — update AI stack, add therapist docs, fix Peer Connect description
- `.lovable/memory/features/prd-implementation.md` — update status
- DB migration — 4 new RLS policies for intern/therapist on blackbox_sessions

