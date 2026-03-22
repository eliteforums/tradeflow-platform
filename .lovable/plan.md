
Goal: Fix the missing “Eternia Code” display in Institution Detail and related admin screens.

What’s actually broken:
- The code exists in backend data (e.g., Elite Forums has a valid code), but the UI sometimes receives institution objects without `eternia_code_hash`.
- Main cause: shared React Query key collision.
  - `useAdmin` uses `queryKey: ["admin-institutions"]` but selects a limited field list (currently missing `eternia_code_hash`).
  - `InstitutionManager` also uses `queryKey: ["admin-institutions"]`.
  - Because the cache is shared, components can receive the “no code field” version, causing blank code UI.

Implementation plan:

1) Align institution query payload for shared cache
- Update `src/hooks/useAdmin.ts` institutions query to include `eternia_code_hash` in `.select(...)`.
- Add a typed institution interface in `useAdmin` so missing fields are caught earlier in TypeScript.

2) Make InstitutionManager query shape explicit (no wildcard drift)
- Update `src/components/admin/InstitutionManager.tsx` from `.select("*")` to explicit select fields including:
  `id, name, eternia_code_hash, plan_type, credits_pool, is_active, institution_type, created_at`
- Keep consistent shape with `useAdmin` so shared cache is stable.

3) Add defensive UI fallback (so it never looks blank again)
- In `src/components/admin/InstitutionDetailView.tsx`:
  - Render a clear fallback text like “Code unavailable” when code is missing.
  - Disable or guard copy action when code is absent, with user-friendly toast.
- In `src/components/mobile/MobileAdminDashboard.tsx` and Institution cards, show same fallback instead of empty space.

4) Keep cache refresh behavior correct
- Ensure all institution create/toggle actions still invalidate the same institutions query key so fresh code appears immediately after updates.

Validation (end-to-end):
- Desktop: `/admin` → SPOC/Institutions → open “Elite Forums” detail → verify code is visible and copy works.
- Mobile admin view: institution card and detail should also show code (or explicit fallback, never blank).
- Create a new institution, then open detail immediately and confirm code appears without manual refresh.

Technical details:
- No database migration required.
- No RLS change required.
- This is a frontend data-shape/cache consistency fix + UI fallback hardening.
