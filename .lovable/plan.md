

## Plan: Fix Admin Username Showing "deleted_"

### Problem
The admin account's `username` in the `profiles` table has been overwritten to `deleted_5d12890a`, likely because the `admin-delete-member` edge function was accidentally triggered on the admin's own account (or the profile was soft-deleted during testing). The code correctly displays whatever username is in the database — the data itself is wrong.

### Fix

#### 1. Database Migration — Restore admin username
Run an update to fix the admin profile's username back to a proper value. We'll identify the admin by checking `user_roles` for the `admin` role and update the corresponding profile:

```sql
UPDATE public.profiles
SET username = 'Admin',
    is_active = true
WHERE id IN (
  SELECT user_id FROM public.user_roles WHERE role = 'admin'
)
AND username LIKE 'deleted_%';
```

This restores the username to "Admin" and re-activates the account for any admin whose profile was accidentally soft-deleted.

#### 2. Prevent future self-deletion (already guarded)
The `admin-delete-member` edge function already has a check `if (target_user_id === user.id) throw new Error("Cannot delete your own account")` — so this shouldn't recur. No code change needed here.

### Files Modified
- 1 database migration (UPDATE profiles for admin accounts with deleted_ usernames)

