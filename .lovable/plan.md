

## Fix: BlackBox Call Not Connecting on Student Side

### Root Cause

There's a state machine deadlock in the student's BlackBox flow:

1. Student clicks "Join" → `fetchToken()` sets `callState = "joining"` → token arrives → `setToken(t)`
2. The MeetingProvider **only renders** when `isJoined` is true (`callState === "joined" && token && room_id`)
3. But `callState` can only become `"joined"` when MeetingView fires `onCallJoined` — which requires the MeetingProvider to be mounted
4. **Deadlock**: MeetingProvider waits for "joined" state, "joined" state waits for MeetingProvider

The therapist side works because `TherapistDashboardContent.tsx` renders MeetingProvider with a simpler guard: `token && activeSession.room_id` (line 594) — no callState check.

### Fix Plan

#### 1. `src/hooks/useBlackBoxSession.ts` — Fix callState derivation

The `useEffect` (line 54-70) that derives callState from session status has a gap: when token is set and status is "accepted"/"active", it falls through without setting any state. Add a branch: if token is present and room exists, keep callState as-is (managed by MeetingView callbacks).

#### 2. `src/pages/dashboard/BlackBox.tsx` — Fix MeetingProvider guard

Change the MeetingProvider render condition from:
```
isJoined && activeSession?.room_id && token
```
to:
```
!!token && !!activeSession?.room_id && callState !== "idle"
```

This allows the MeetingProvider to mount as soon as the token is fetched, so MeetingView can auto-join and fire `onCallJoined` to set `callState = "joined"`.

Keep the "In session" pill and controls gated on `isJoined` for UI purposes.

#### 3. `src/components/mobile/MobileBlackBox.tsx` — Same guard fix

Apply the identical MeetingProvider guard change for mobile.

#### 4. `src/components/videosdk/MeetingView.tsx` — Fix retry loop clearing

The auto-join retry timer (line 117-119) keeps firing even after `onMeetingJoined` runs if the timer was already scheduled. Add a ref flag `joinSucceeded` to prevent retries after successful join.

### Summary

- 4 files changed, ~10 lines each
- No database changes
- Core fix: decouple MeetingProvider mount from "joined" state — mount it when token + room_id are available

