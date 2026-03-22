

## Plan: Fix VideoSDK Session Joining — IMPLEMENTED

### Fix Applied

Used a `useRef` to capture the `join` function from `useMeeting`, avoiding dependency array instability. Auto-join fires after a 300ms delay to let the SDK initialize fully. Retry calls `join()` directly.

### Files Modified

| File | Change |
|------|--------|
| `src/components/videosdk/MeetingView.tsx` | `joinRef` pattern + 300ms delayed auto-join + retry fix |
| `src/pages/dashboard/BlackBox.tsx` | Reverted config (SDK doesn't support `joinWithoutUserInteraction`) |
| `src/components/mobile/MobileBlackBox.tsx` | Same |
| `src/components/therapist/TherapistDashboardContent.tsx` | Same |
| `src/components/videosdk/VideoCallModal.tsx` | Same |
