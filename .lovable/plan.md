

## Plan: Admin-Approved Password Reset (Additive — Keep Existing Flow)

### Overview
Keep the existing self-service recovery (hint questions + emoji pattern) on the Forgot Password page. Add a second option: "Request Admin Reset" for users who don't have recovery credentials set up or can't remember them. Admin gets a dedicated tab to manage these requests.

### Database Changes

**1. New `password_reset_requests` table** (migration)
```sql
CREATE TABLE public.password_reset_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  username text NOT NULL,
  reason text DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  admin_id uuid,
  admin_note text,
  temp_password text,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE public.password_reset_requests ENABLE ROW LEVEL SECURITY;

-- Anon can submit (user is locked out) and check status
CREATE POLICY "Anon can submit reset requests"
  ON public.password_reset_requests FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can check request status"
  ON public.password_reset_requests FOR SELECT TO anon
  USING (true);

-- Authenticated users can also submit and view own
CREATE POLICY "Users can submit reset requests"
  ON public.password_reset_requests FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own requests"
  ON public.password_reset_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Admins full access
CREATE POLICY "Admins can manage reset requests"
  ON public.password_reset_requests FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
```

### Edge Function

**2. `supabase/functions/approve-password-reset/index.ts`**
- Validates caller is admin (via service role + admin check)
- Accepts `{ request_id, action: 'approve' | 'reject', admin_note? }`
- On approve: generates random 12-char temp password, calls `supabase.auth.admin.updateUserById()`, updates request row with `status='approved'`, `temp_password`, `resolved_at`
- On reject: updates status to `rejected` with admin_note
- Returns temp password to admin on approval

### Frontend Changes

**3. Update `src/pages/auth/ForgotPassword.tsx`**
- Keep the entire existing 3-step self-service flow intact
- Add a toggle/tab at the top: **"Self Recovery"** | **"Request Admin Reset"**
- **Self Recovery tab**: current flow unchanged
- **Request Admin Reset tab**:
  - Username input + Reason textarea
  - Submit button → inserts into `password_reset_requests` via anon Supabase client
  - After submission: shows confirmation with request ID
  - "Check Status" section: enter request ID → queries the table → if approved, shows temp password; if pending, shows "waiting"; if rejected, shows admin note

**4. New `src/components/admin/PasswordResetManager.tsx`**
- Lists all `password_reset_requests` ordered by `created_at DESC`
- Filter chips: All / Pending / Approved / Rejected
- Each card shows: username, reason, time ago, status badge
- Pending requests have **Approve** and **Reject** buttons
- Approve → calls `approve-password-reset` edge function → shows temp password in a copy-able dialog
- Reject → prompts for optional admin note → updates via edge function
- Badge count for pending requests shown on sidebar item

**5. Update `src/pages/admin/AdminDashboard.tsx`**
- Add `"password-resets"` to `TabId` union type
- Add sidebar item under "Safety" group: `{ id: "password-resets", label: "Password Resets", icon: Key }`
- Render `<PasswordResetManager />` when active

**6. Update `src/components/mobile/MobileAdminDashboard.tsx`**
- Same: add `"password-resets"` to `TabId`, add tab button, render `<PasswordResetManager />`

### Files Modified
- Migration: create `password_reset_requests` table with RLS
- `supabase/functions/approve-password-reset/index.ts` — new
- `src/pages/auth/ForgotPassword.tsx` — add admin-reset tab alongside existing flow
- `src/components/admin/PasswordResetManager.tsx` — new
- `src/pages/admin/AdminDashboard.tsx` — add tab
- `src/components/mobile/MobileAdminDashboard.tsx` — add tab

