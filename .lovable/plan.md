

## Plan: Fix Verification — Auto-verify Students + Admin Verify Button

### Problem
All new accounts have `is_verified: false` by default. The admin panel only shows a "Verify & Activate" button for interns with `training_status === "interview_pending"`. Students and other roles appear as "Pending Verification" with no way for admins to verify them.

### Changes

#### 1. Auto-verify students on account activation (`supabase/functions/activate-account/index.ts`)
When a student activates their account via temp credentials, set `is_verified: true` on their profile. This is the logical verification point — they proved they have a valid institution-issued temp ID.

Update the `profiles.update(...)` call to include `is_verified: true`.

#### 2. Auto-verify students on direct signup (`handle_new_user` trigger)
Update the database trigger so new signups default to `is_verified: true` for students (they authenticated via institution code).

Migration: `ALTER` the `handle_new_user` function to set `is_verified = true` in the profile insert.

#### 3. Add a general "Verify" button in admin panel (`src/components/admin/MemberManager.tsx`)
For any member where `is_verified === false`, show a small verify button (regardless of role). This gives admins a manual override for any account.

- Show a small "Verify" button next to any unverified member
- Show a "Pending" badge for unverified members (all roles, not just interns)

### Files Modified
- `supabase/functions/activate-account/index.ts` — Add `is_verified: true` to profile update
- Database migration — Update `handle_new_user` trigger to set `is_verified: true`
- `src/components/admin/MemberManager.tsx` — Add verify button for all unverified members, show pending badge

