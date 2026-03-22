

## Plan: Fix Training Status Not Reflecting After Referral Code Redemption

### Root Cause
The `AuthContext` profile fetch query only selects 12 specific columns and does NOT include `training_status` or `training_progress`. The intern dashboard reads these via `(profile as any)?.training_status`, which is always `undefined` — defaulting to `"not_started"` regardless of what's in the database.

### Solution
Add `training_status` and `training_progress` to the AuthContext profile fetch and interface.

### Changes

**`src/contexts/AuthContext.tsx`**
1. Add `training_status` and `training_progress` to the `Profile` interface
2. Add both columns to the `fetchProfile` select query (line 47)

### Files to modify
- `src/contexts/AuthContext.tsx` — add missing fields to Profile interface and select query

