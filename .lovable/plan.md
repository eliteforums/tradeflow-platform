

## Plan: Add Referral Code to Skip Intern Training

### Summary
Admin generates a referral code for an intern. The intern enters this code on their dashboard to skip all training modules and immediately unlock Peer Connect.

### Database Changes

**New table: `intern_referral_codes`**
- `id` uuid PK
- `code` text unique (e.g. "REF-ABC123")
- `created_by` uuid (admin who created it)
- `assigned_to` uuid nullable (intern who used it)
- `used_at` timestamptz nullable
- `expires_at` timestamptz nullable
- `is_used` boolean default false
- `created_at` timestamptz default now()
- RLS: admins can CRUD, authenticated can SELECT (to validate codes)

### Code Changes

**1. Admin side — `src/components/admin/MemberManager.tsx`**
- Add a new card section "Referral Codes" below the existing sections
- Admin enters an intern's username or selects from a dropdown, clicks "Generate Code"
- System creates a random code (e.g. `REF-` + 8 alphanumeric chars) in the `intern_referral_codes` table
- Show list of generated codes with status (unused/used, assigned intern)
- Copy-to-clipboard button for each code

**2. Intern side — `src/components/intern/InternDashboardContent.tsx` + `MobileInternDashboard.tsx`**
- When training is not complete, show a small "Have a referral code?" link/button above the module list
- Clicking it opens an input field where the intern enters the code
- On submit: validate the code exists, is unused, and not expired
- If valid: update the intern's profile to `training_status: "active"`, `is_verified: true`, `training_progress: [1,2,3,4,5,6,7]` and mark the code as used
- Dashboard immediately unlocks all tabs

### Files to modify
- Database: create `intern_referral_codes` table with RLS
- `src/components/admin/MemberManager.tsx` — add referral code generation section
- `src/components/intern/InternDashboardContent.tsx` — add referral code input
- `src/components/mobile/MobileInternDashboard.tsx` — same for mobile

