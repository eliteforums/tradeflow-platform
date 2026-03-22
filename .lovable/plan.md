

## Plan: Fix Peer Connect Duplicate Session Error

### Root cause
The migration added unique indexes preventing duplicate active sessions per student and per intern. When a student clicks an intern who already has an active session (or the student already has one), the insert fails with a constraint violation. Additionally, credits are spent **before** the insert, so they're lost even when the session creation fails.

### Changes

#### 1. `src/hooks/usePeerConnect.ts` — Handle duplicates gracefully
- **Reorder**: Move `spendCredits()` call to AFTER the successful insert (or wrap in a try/catch that refunds on failure)
- **Check for existing sessions first**: Before inserting, query for an existing active/pending session for this student. If one exists, return it instead of creating a new one.
- **Check intern availability**: Before inserting, check if the intern already has an active session. If so, show "This intern is currently busy" instead of the raw constraint error.
- **Improve error message**: Catch the unique constraint error specifically and show a user-friendly toast.

#### File: `src/hooks/usePeerConnect.ts` (requestSession mutation only)

Logic change:
```
1. Check: does student already have an active/pending peer session?
   → Yes: return that session (no new insert, no credit spend)
2. Check: does the target intern have an active/pending session?
   → Yes: throw "This intern is currently in a session"
3. Insert the new session
4. Only then spend credits (or spend first but refund on insert failure)
```

Given that `spendCredits` calls an edge function and isn't easily reversible, the safest approach is to check constraints client-side first, then spend, then insert.

### No other files need changes
The UI components already handle the `onError` toast from the mutation. This is purely a hook-level fix.

