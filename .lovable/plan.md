

## Plan: Fix Peer Connect for Interns + Add Delete ID from Admin Dashboard

### Issues Identified

**Issue 1: Intern cannot see student's chat or receive calls in Peer Connect**

The Peer Connect page (`/dashboard/peer-connect`) uses `usePeerConnect` hook which works for both students and interns. The intern CAN access the page (routing allows it). However, the problem is architectural:

- When a student starts a session and sends messages, the intern needs to be on the `/dashboard/peer-connect` page to see/respond. But the intern's primary view is the **Intern Dashboard**, which only shows a session list with "Join" buttons that just call `toast.info("Join session")` (line 518) — it does NOT navigate to Peer Connect or open a chat.
- The intern dashboard's "Join" button is a dead-end — no actual chat or call functionality.
- There is no realtime notification to alert the intern that a new session has started.

**Issue 2: No option to delete user IDs from super admin dashboard**

The MemberManager component shows members grouped by institution but has no delete button. The `delete-account` edge function only supports self-deletion.

---

### Solution

**Fix 1: Wire up Intern "Join" button to navigate to Peer Connect page**

In both `InternDashboardContent.tsx` and `MobileInternDashboard.tsx`, change the "Join" button on active sessions to navigate to `/dashboard/peer-connect`. The Peer Connect page already handles intern sessions (via `usePeerConnect` with `isIntern` checks and `or()` query). This ensures the intern can see the chat, send messages, and make calls.

Also add a realtime subscription on `peer_sessions` in the intern dashboard to auto-refresh when a new session is assigned to them.

**Fix 2: Add delete button to admin MemberManager**

Add a delete button next to each member in the admin member list. Create a new edge function `admin-delete-member` that:
1. Accepts a `target_user_id` from an admin
2. Verifies the caller is an admin (via `has_role`)
3. Deletes PII, profile data, and auth account (same flow as `delete-account` but admin-initiated)

---

### Changes

**1. `src/components/intern/InternDashboardContent.tsx`**
- Import `useNavigate` from react-router-dom
- Replace the "Join" button `toast.info(...)` with `navigate("/dashboard/peer-connect")`
- Add realtime subscription on `peer_sessions` filtered by `intern_id` to invalidate the query on new/updated sessions

**2. `src/components/mobile/MobileInternDashboard.tsx`**
- Same "Join" button fix — navigate to `/dashboard/peer-connect`
- Add realtime subscription for session notifications

**3. `supabase/functions/admin-delete-member/index.ts`** (new)
- Edge function that accepts `{ target_user_id }` 
- Verifies caller is admin via `has_role`
- Runs same cleanup as `delete-account`: deletes user_private, blackbox_entries, recovery_credentials, credit_transactions, deactivates profile, deletes auth user

**4. `src/components/admin/MemberManager.tsx`**
- Add a delete (Trash2) button per member row
- Confirm dialog before deletion
- Call `admin-delete-member` edge function
- Invalidate member queries on success

### Files to modify
- `src/components/intern/InternDashboardContent.tsx`
- `src/components/mobile/MobileInternDashboard.tsx`
- `supabase/functions/admin-delete-member/index.ts` (new)
- `src/components/admin/MemberManager.tsx`

