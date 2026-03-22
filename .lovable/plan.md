

## Plan: Fix VideoSDK Session Joining & BlackBox Call Flow

### Problems Identified

1. **`display: none` kills media** — Both `BlackBox.tsx` and `MobileBlackBox.tsx` wrap the `MeetingProvider` in `<div className="hidden">` (which is `display: none`). Browsers block `getUserMedia` and WebRTC connections inside hidden elements. This is why audio never connects for the student.

2. **Auto-join is unreliable** — The 300ms delay in `MeetingView` before calling `join()` is arbitrary. The VideoSDK `useMeeting` hook may not have a ready `join` function yet. There's no retry if the initial join silently fails (the 15s timeout exists but only shows UI — the retry just calls `join()` once more without checking SDK state).

3. **Realtime subscription re-created unnecessarily** — In `useBlackBoxSession.ts`, the channel subscription depends on `[activeSession?.id, token]`. When the token is set (after room_id arrives), the channel is torn down and re-created, potentially missing the very update that triggered it.

4. **Therapist MeetingProvider also fragile** — The therapist side uses `autoJoin={true}` but faces the same 300ms timing issue.

### Changes

| File | Change |
|------|--------|
| `src/pages/dashboard/BlackBox.tsx` | Replace `<div className="hidden">` with visually-hidden but layout-present wrapper (`position: fixed; opacity: 0; pointer-events: none; width: 1px; height: 1px`) so WebRTC stays alive |
| `src/components/mobile/MobileBlackBox.tsx` | Same fix — replace `className="hidden"` with offscreen positioning |
| `src/components/videosdk/MeetingView.tsx` | Improve auto-join: use `useMeeting`'s `meetingId` availability as readiness signal; add retry loop (3 attempts, 1s apart) instead of single 300ms shot; track join state via `onMeetingJoined` callback (already done) |
| `src/hooks/useBlackBoxSession.ts` | Remove `token` from realtime subscription deps — the subscription should persist regardless of token state. Only depend on `activeSession?.id`. |

### Technical Details

**MeetingView auto-join fix:**
```text
Current:  setTimeout(300ms) → join()  → hope it works
Proposed: useEffect watches SDK readiness → attempt join → if not JOINED after 3s, retry up to 3 times → then show timeout UI
```

The `useMeeting` hook returns a `meetingId` that's only populated once the SDK is initialized. We'll use this as the readiness gate instead of an arbitrary timer.

**Hidden div fix:**
```css
/* Instead of display: none */
position: fixed;
top: -9999px;
opacity: 0;
pointer-events: none;
```
This keeps the DOM present and WebRTC active while being invisible to the user.

**Realtime subscription fix:**
Remove `token` from the dependency array of the realtime `useEffect` in `useBlackBoxSession.ts`. The subscription only needs `activeSession?.id` — the token fetch happens inside the callback, not as part of the subscription lifecycle.

