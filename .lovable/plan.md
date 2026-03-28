

## Fix: Delete Institution — Two FK Constraint Failures

### Root Cause (from edge function logs)

Two foreign key violations are blocking deletion:

1. **`audit_logs.actor_id` → `profiles`**: Deleting the auth user cascades to delete the profile, but `audit_logs` references `actor_id` — fails with FK constraint error.
2. **`profiles.institution_id` → `institutions`**: The soft-delete updates the profile but does NOT null out `institution_id`, so when the institution row is deleted, the FK constraint on remaining profiles blocks it.

### Fix 1: Database Migration

Add `ON DELETE SET NULL` to `audit_logs.actor_id` FK so deleting a profile doesn't fail due to audit log references. This preserves audit history (actor_id becomes null for deleted users).

Also add `ON DELETE SET NULL` to `profiles.institution_id` FK for the same reason — or handle it in code.

```sql
-- Drop and recreate audit_logs.actor_id FK with SET NULL
ALTER TABLE public.audit_logs
  DROP CONSTRAINT IF EXISTS audit_logs_actor_id_fkey;

ALTER TABLE public.audit_logs
  ADD CONSTRAINT audit_logs_actor_id_fkey
  FOREIGN KEY (actor_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Make actor_id nullable
ALTER TABLE public.audit_logs ALTER COLUMN actor_id DROP NOT NULL;
```

### Fix 2: Edge Function Update (`admin-delete-institution/index.ts`)

Two changes in the per-user loop:

1. **Null out `institution_id`** on the profile during soft-delete (add `institution_id: null` to the update)
2. **Don't throw on auth user deletion failure** — the FK issue with audit_logs causes `deleteUser` to fail. After the migration, this should work, but keep it as a soft error for resilience.

### Files
- **Database migration**: Drop/recreate `audit_logs_actor_id_fkey` with `ON DELETE SET NULL`, make `actor_id` nullable
- **`supabase/functions/admin-delete-institution/index.ts`**: Add `institution_id: null` to the profile soft-delete update

