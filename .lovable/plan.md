

## Plan: Fix Account Deletion Flow

### Problem
The "No coordinator found" error occurs because `AccountDeletion.tsx` queries `profiles` for SPOCs matching the user's `institution_id`, but students may not see SPOC profiles (RLS restricts visibility). Even the admin query via `user_roles` may return empty if the querying user lacks SELECT on that table for admin roles. The flow also lacks: Eternia ID / institution logging, an admin review queue, and ID recycling back to `temp_credentials`.

### Solution

#### 1. `src/components/admin/AccountDeletion.tsx` — Fix request flow
- Remove SPOC lookup entirely (remove lines 17-22)
- Send notification **only to admins** — query admins using `profiles` table where `role = 'admin'` (students CAN see admin profiles via the "Students can view staff profiles" policy... actually no, that only covers expert/therapist/intern). 
- Better approach: skip client-side recipient discovery. Instead, insert a single notification with a well-known admin user_id OR use an edge function that uses service role to find admins.
- **Simplest fix**: Create a small edge function `request-account-deletion` that:
  - Validates the calling user
  - Finds all admin user_ids via service role
  - Inserts notifications to all admins with metadata: `{ requesting_user_id, username, student_id, institution_id, institution_name, requested_at }`
  - Updates `profiles.deletion_requested_at` to current timestamp
- Update `AccountDeletion.tsx` to call this edge function instead of doing client-side queries
- Update copy: "sent to admin" instead of "institution coordinator"

#### 2. `src/components/admin/DeletionRequestsManager.tsx` — New admin review panel
- Query `notifications` where `type = 'deletion_request'` and `is_read = false`
- Display a table: Username, Eternia ID (student_id), Institution, Requested At, Actions
- "Approve" button calls `admin-delete-member` edge function with `target_user_id`
- "Reject" button marks notification as read and optionally sends a rejection notification to the user
- After approval, recycle the user's temp credential: update `temp_credentials` row matching `auth_user_id = target_user_id` to set `status = 'unused'`, `auth_user_id = null`, `activated_at = null`

#### 3. `supabase/functions/admin-delete-member/index.ts` — Add ID recycling
- After deleting auth user, find and recycle temp credential:
  ```sql
  UPDATE temp_credentials SET status = 'unused', auth_user_id = NULL, activated_at = NULL 
  WHERE auth_user_id = target_user_id
  ```

#### 4. `supabase/functions/request-account-deletion/index.ts` — New edge function
- Auth: validate calling user via JWT
- Fetch user's profile (username, student_id, institution_id)
- Fetch institution name
- Find all admin user_ids via `user_roles` table (service role bypasses RLS)
- Insert notifications to each admin with full metadata
- Set `profiles.deletion_requested_at = now()` for the user
- Return success

#### 5. Admin Dashboard integration
- Add "Deletion Requests" to the admin sidebar or embed `DeletionRequestsManager` in the existing "Tools" or "Audit" tab
- Show a badge count of pending deletion requests

### Files Modified
1. `supabase/functions/request-account-deletion/index.ts` — New edge function
2. `supabase/functions/admin-delete-member/index.ts` — Add temp credential recycling
3. `src/components/admin/AccountDeletion.tsx` — Call edge function, update copy
4. `src/components/admin/DeletionRequestsManager.tsx` — New admin review panel
5. `src/pages/admin/AdminDashboard.tsx` — Add deletion requests panel to Tools tab
6. `src/components/mobile/MobileAdminDashboard.tsx` — Same for mobile

### No database changes needed
- `profiles.deletion_requested_at` column already exists
- `temp_credentials.auth_user_id` and `status` columns already exist
- Notifications table already supports the `deletion_request` type

