
Goal: fix the admin sign-in failure so the entered admin ID/password works reliably.

What I confirmed:
- The active admin auth account is `admin@eternia.com`.
- Current login logic uses the typed value as-is if it contains `@`, and only appends `@eternia.local` when no domain is provided.
- So these fail today:
  - `admin@eternia.in` (wrong domain)
  - `admin` (becomes `admin@eternia.local`, but admin account is `.com`)

Implementation plan:
1. Update identifier handling in `src/contexts/AuthContext.tsx`
   - Add a small resolver that generates candidate emails from one input.
   - For username-only input: try `@eternia.local`, then `@eternia.com`, then `@eternia.in`.
   - For `@eternia.*` input: try typed email first, then sibling eternia domains.
   - Attempt sign-in sequentially until one succeeds; keep generic failure if all fail.

2. Improve login feedback in `src/pages/auth/Login.tsx`
   - Keep existing lockout flow unchanged.
   - Add subtle helper text (“Use username or email”).
   - On failed login with `@eternia.in`, show a contextual hint to check email domain.

3. Keep access logic intact
   - No route/role changes.
   - Admin/SPoC navigation behavior remains the same after successful authentication.

4. Validate end-to-end
   - Verify login works with:
     - `admin@eternia.com`
     - `admin@eternia.in`
     - `admin`
   - Verify normal student credentials still work.
   - Verify failed passwords still increment attempts and lockout still triggers at 5.

Technical details:
- Files to edit: `src/contexts/AuthContext.tsx`, `src/pages/auth/Login.tsx`
- No database migration required.
- No backend function changes required.
- Immediate workaround before patch: login using `admin@eternia.com` with the current password.
