

## Fix: BlackBox Student Side Stuck at "Connecting"

### Root Cause

The student must manually click "Therapist Ready — Join Call" to trigger `fetchToken()`, then wait for the MeetingProvider to mount and auto-join. There are two issues:

1. **No auto-connect**: When the session transitions to "accepted" with a room_id, the student sees a "Join" button but nothing happens automatically. If the student doesn't notice or the UI re-renders, they can miss it.

2. **Polling stops too early**: The polling fallback (every 3s) only runs while `status === "queued"`. If the realtime subscription fails to deliver the "accepted" update, there's no fallback — the student stays stuck at "waiting" forever.

3. **callState can get stuck**: If the token is fetched but the MeetingView's `onMeetingJoined` callback never fires (e.g., VideoSDK SDK glitch), callState remains "joining" indefinitely with no recovery path.

### Fix Plan

#### 1. `src/hooks/useBlackBoxSession.ts` — Auto-fetch token on "ready"

Add a new effect: when callState transitions to "ready" (therapist accepted, room_id available), automatically call `fetchToken()` instead of waiting for the student to click. This removes the manual step and makes the flow seamless like the therapist side.

```ts
// Auto-connect when therapist is ready
useEffect(() => {
  if (callState === "ready" && activeSession?.room_id && !tokenRef.current) {
    fetchToken();
  }
}, [callState, activeSession?.room_id, fetchToken]);
```

#### 2. `src/hooks/useBlackBoxSession.ts` — Extend polling to accepted/active

Change the polling fallback to also run while `status === "accepted"` or `status === "active"` (not just "queued"). This ensures the student picks up session updates even if realtime fails.

```ts
// Poll while queued OR accepted (realtime fallback)
useEffect(() => {
  if (!activeSession?.id || !["queued", "accepted", "active"].includes(activeSession.status)) return;
  const interval = setInterval(async () => { ... }, 3000);
  return () => clearInterval(interval);
}, [activeSession?.id, activeSession?.status]);
```

#### 3. `src/pages/dashboard/BlackBox.tsx` & `MobileBlackBox.tsx` — Remove manual "Join" button

Since token fetch is now automatic, remove the `isReady` state UI that shows "Therapist Ready — Join Call". Replace it with a "Connecting…" indicator since the system will auto-connect. Keep the "Retry" button for failed state.

#### 4. `src/hooks/useBlackBoxSession.ts` — Add joining timeout recovery

Add a 30-second timeout: if callState has been "joining" for 30s without transitioning to "joined" or "failed", automatically set it to "failed" so the retry button appears.

### Files Modified
- `src/hooks/useBlackBoxSession.ts` — auto-fetch, extended polling, joining timeout
- `src/pages/dashboard/BlackBox.tsx` — remove manual join button, update UI states
- `src/components/mobile/MobileBlackBox.tsx` — same UI updates

### Technical Notes
- No database or edge function changes needed
- The therapist side already works because it uses a simpler flow (token obtained during accept)
- Auto-connect makes the student experience match: request → wait → auto-connected

