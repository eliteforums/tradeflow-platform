
Goal: make BlackBox call joining deterministic so student and therapist always land in the same live call (not just UI state), with minimal surface-area changes.

### What’s actually failing now
- Backend room creation + token generation is working (logs show room created by therapist and tokens issued to both users).
- The recurring failure is in call-join lifecycle on the client:
  1) student UI marks “in session” before real join confirmation,  
  2) student call runs in hidden mode with weak recovery visibility,  
  3) no persistent “both participants joined” handshake in session data.

### Implementation plan

1. **Add explicit call-join handshake fields (backend migration)**
- Extend `blackbox_sessions` with:
  - `student_joined_at timestamptz null`
  - `therapist_joined_at timestamptz null`
  - `last_join_error text null`
- Add index for therapist-side open-session safety:
  - one open session per therapist for statuses `accepted/active` (partial unique index).
- Keep current app structure; only add deterministic connection metadata.

2. **Make therapist accept flow deterministic**
- In `TherapistDashboardContent.tsx`:
  - Keep room creation on accept, but set status to `accepted` first (not immediately “active”).
  - Persist `room_id + therapist_id + started_at` on successful claim.
  - Update logic to use returned updated row from the claim query (avoid silent no-op accepts).
- When therapist actually joins meeting, write `therapist_joined_at`.
- Promote status to `active` only after both `therapist_joined_at` and `student_joined_at` exist.

3. **Fix student BlackBox join logic (core issue)**
- In `useBlackBoxSession.ts`:
  - separate UI state from real meeting state (`waiting`, `joining`, `joined`, `failed`).
  - clear stale token on terminal statuses (`completed/cancelled/escalated`) and on session-id change.
  - fetch fresh token per session-room transition.
- In `BlackBox.tsx` and `MobileBlackBox.tsx`:
  - replace “hidden-only autojoin” behavior with an explicit join path:
    - show “Therapist ready — Join call” CTA when room exists,
    - show retry UI on join failure,
    - only show connected state after actual join callback.
  - Keep existing orb UX; just make join confirmation real.

4. **Extend `MeetingView` with parent callbacks**
- In `MeetingView.tsx`, add callbacks:
  - `onJoined`, `onJoinError`, `onJoinStateChange`.
- Use these callbacks in student + therapist screens to:
  - write joined timestamps to session row,
  - persist last join error,
  - drive accurate UI (“connecting”, “joined”, “retry”).

5. **Stability guardrails**
- Force meeting remount when `session.id` or `room_id` changes (keyed provider).
- Ensure reconnect button retries join lifecycle (not token fetch only).
- Keep changes scoped to BlackBox files only; no unrelated peer/appointment logic touched.

### Files to update
- `supabase/migrations/*` (new migration for join metadata + unique therapist open-session guard)
- `src/components/therapist/TherapistDashboardContent.tsx`
- `src/hooks/useBlackBoxSession.ts`
- `src/pages/dashboard/BlackBox.tsx`
- `src/components/mobile/MobileBlackBox.tsx`
- `src/components/videosdk/MeetingView.tsx`

### Technical details (concise)
- Current issue is not room creation failure; it is missing “join-confirmed” state management.
- Session should be considered active only after real meeting join events, not just token+room presence.
- Student must have a visible/recoverable join path; hidden-only call lifecycle is the unstable point.

### Validation checklist
1. Student requests session → therapist accepts → both see same `room_id` in session row.
2. Student taps Join, therapist joins → both `*_joined_at` set, status becomes `active`.
3. If student join fails (permissions/network), UI shows retry and `last_join_error`.
4. Desktop + mobile both tested end-to-end with two real users.
