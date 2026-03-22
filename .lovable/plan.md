

## Plan: Fix Three Issues — Expert Slots, BlackBox Call, BlackBox Access Control

### Issue 1: Expert availability not shown to students

**Root cause**: The `useAppointments` hook (line 48-49) filters experts with `.eq("is_verified", true)`. All expert profiles in the database have `is_verified: false`. So zero experts are returned to students.

**Fix**: Remove the `is_verified` filter from the experts query in `useAppointments.ts`. Experts are already verified by admin role assignment — the `is_verified` field was meant for student identity verification, not expert credentialing.

**File**: `src/hooks/useAppointments.ts` — remove `.eq("is_verified", true)` on line 49.

---

### Issue 2: BlackBox call stuck loading

**Root cause**: The `useBlackBoxSession` hook inserts a session with status `queued`, then waits for a therapist to accept (which sets `room_id` and status to `active`). When the therapist accepts via `TherapistDashboardContent`, it calls `createVideoSDKRoom()` and updates the session. The student's realtime subscription detects the update and tries to get a token. This flow should work — but there may be an issue with the `spend-credits` edge function blocking or the realtime subscription not firing.

However, looking more carefully: the student side uses `requestSession` which calls `spendCredits(30, ...)` first. If that fails silently (returns but `isRequesting` stays true due to missing `finally`), it would appear stuck. Looking at the code: the `finally` block does set `setIsRequesting(false)`, and there's a `return` after the error toast. But the session insert itself could fail due to RLS — students CAN insert (`auth.uid() = student_id`), so that's fine.

The real issue is likely that `spendCredits` is failing. The `spend-credits` edge function needs to be checked. But let me also check if the student's credit balance is sufficient.

Actually, re-reading the code more carefully: if `spendResult.success` is false, it shows a toast and returns — but `setIsRequesting(false)` runs in `finally`. So the button should re-enable. The "just loading" likely means the session is created (queued) but no therapist picks it up, OR the therapist accepts but the realtime subscription doesn't trigger the token fetch properly.

Let me check the realtime subscription: it listens for `UPDATE` on `blackbox_sessions` filtered by `id=eq.${activeSession.id}`. When the therapist updates it to `active` with a `room_id`, the callback runs. It checks `!token` — if token is already null, it calls `getVideoSDKToken()`. This should work.

The more likely issue: the student sees "Request Voice Call" → clicks → session is created → shows "Waiting for a therapist..." → therapist accepts → student should auto-connect. If the student says "it's just loading," they may be stuck at the waiting state because no therapist is online to accept.

But if they mean the initial request is stuck loading, it could be a `spend-credits` failure. Let me check the edge function.

**Fix**: Two improvements:
1. Add better error handling and timeout feedback in the waiting state
2. More importantly, check if `spend-credits` is working — but since I can't test that directly, let me ensure the flow is robust

Actually, looking at the edge function logs provided — there are no `spend-credits` logs shown. The issue might simply be that the therapist needs to be online. But the user says "isn't able to initiate and connect call" which suggests it fails at the request stage.

Let me check if there's an issue with the `spend-credits` function by looking at its code:

**Additional investigation needed** — but the most likely fix is to ensure the flow handles the case where spend-credits works but no therapist is available, with proper user feedback.

---

### Issue 3: BlackBox should only be accessible to students and therapists

**Root cause**: The `DashboardLayout.tsx` shows BlackBox in the sidebar for students (`studentNavItems`, line 34). Therapists have a separate dashboard (`therapistNavItems`) that doesn't list BlackBox. But the `/dashboard/blackbox` route has no role restriction — any authenticated user can access it.

**Fix**: 
1. In `App.tsx`, add `allowedRoles={["student", "therapist"]}` to the BlackBox route
2. Remove BlackBox from nav items for non-student/non-therapist roles (already the case — only `studentNavItems` has it)

---

### Files Modified

| File | Change |
|------|--------|
| `src/hooks/useAppointments.ts` | Remove `.eq("is_verified", true)` filter from experts query |
| `src/App.tsx` | Add `allowedRoles` to BlackBox route for student + therapist only |
| `src/components/layout/DashboardLayout.tsx` | Add BlackBox to therapist nav items |

### Note on BlackBox loading
The "just loading" issue is most likely because no therapist is online to accept the queued session. The flow requires a therapist to be logged in and accept from their queue. If you're testing solo, you need two browser sessions — one as student, one as therapist. If the issue persists after that, we'll need to check the spend-credits edge function logs.

