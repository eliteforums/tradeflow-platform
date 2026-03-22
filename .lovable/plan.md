

## Plan: Fix VideoSDK Session Joining

### Root Cause

The `MeetingView` auto-join `useEffect` includes `join` in its dependency array. The `join` function from `useMeeting` gets a new reference on every render, which can cause the effect to either not fire at the right time or fire repeatedly. Additionally, the SDK may not be fully initialized when `join()` is called immediately on mount.

### Fix

Use `joinWithoutUserInteraction` — a built-in MeetingProvider config flag that tells the SDK to automatically join the meeting as soon as the provider mounts, eliminating the need for manual `join()` calls entirely.

### Changes

| File | Change |
|------|--------|
| `src/components/videosdk/MeetingView.tsx` | Remove the `autoJoin` useEffect and the manual join logic. Instead, initialize `joined` as `"JOINING"` when `autoJoin` is true. Keep timeout + retry logic. Keep manual join button for `autoJoin=false` case. |
| `src/pages/dashboard/BlackBox.tsx` | Add `joinWithoutUserInteraction: true` to MeetingProvider config |
| `src/components/mobile/MobileBlackBox.tsx` | Add `joinWithoutUserInteraction: true` to MeetingProvider config |
| `src/components/therapist/TherapistDashboardContent.tsx` | Add `joinWithoutUserInteraction: true` to MeetingProvider config |
| `src/components/videosdk/VideoCallModal.tsx` | Add `joinWithoutUserInteraction: true` to MeetingProvider config |

### How It Works

Instead of:
```
MeetingProvider config → mount MeetingView → useEffect calls join()
```

We do:
```
MeetingProvider config with joinWithoutUserInteraction: true → SDK auto-joins → onMeetingJoined fires
```

The `MeetingView` component will:
- Start in `"JOINING"` state when `autoJoin` is true (show spinner immediately)
- Transition to `"JOINED"` when `onMeetingJoined` fires (already implemented)
- Keep the 15s timeout + retry (retry will call `join()` manually as fallback)
- For `autoJoin=false`, keep the manual "Join Session" button

This is the VideoSDK-recommended approach and eliminates timing issues with `join()` being called before the SDK is ready.

