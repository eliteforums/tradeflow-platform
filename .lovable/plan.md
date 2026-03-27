

## Fix: Authority Password Reset — Admin Direct Reset for Staff Roles

### Current State
- **PasswordResetManager** already handles request-based flow (users submit → admin approves/rejects → temp password generated)
- **approve-password-reset** edge function already resets passwords via `supabase.auth.admin.updateUserById`
- Missing: Admin-initiated direct reset (admin picks a user by username/ID and resets without a prior request)
- No role filtering — PRD specifies this applies to Expert, Intern, Therapist

### Changes

**1. `src/components/admin/PasswordResetManager.tsx`**
- Add a "Direct Reset" section at the top with:
  - Username input field
  - "Reset Password" button
  - Calls a new edge function action `direct_reset`
- Filter the requests list to show the user's role badge (Expert/Intern/Therapist) alongside username
- Shows the temp password dialog on success (reuse existing dialog)

**2. `supabase/functions/approve-password-reset/index.ts`**
- Add a new action: `direct_reset` alongside existing `approve`/`reject`
- When `action === "direct_reset"`:
  - Accept `username` (instead of `request_id`)
  - Verify admin caller (existing logic)
  - Look up user by `username@eternia.local`
  - Check user has role `expert`, `intern`, or `therapist` via `user_roles` table
  - If not staff role, return error "Can only reset passwords for Expert, Intern, or Therapist accounts"
  - Generate temp password (existing logic)
  - Reset via `auth.admin.updateUserById`
  - Return `{ success: true, temp_password }`
  - Optionally auto-create a `password_reset_requests` row for audit trail

### Flow
```text
Admin Dashboard → Password Resets tab
  → "Direct Reset" section
  → Admin enters username (e.g. "dr_sharma")
  → Clicks "Reset Password"
  → Edge function verifies admin + user is Expert/Intern/Therapist
  → Generates temp password, resets auth
  → Shows temp password dialog to admin
  → Admin shares credentials securely with the user
```

### No database changes needed
Existing `password_reset_requests` table can store audit records for direct resets.

