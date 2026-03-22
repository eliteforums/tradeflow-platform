

## Plan: Fix VideoSDK join timeout across BlackBox, Expert Connect, and Peer Connect

### Root Cause Analysis

The `join()` call from VideoSDK never triggers `onMeetingJoined` — the SDK silently fails, and after 15 seconds the UI shows "Connection timed out." No mic/camera permission prompt appears, meaning the SDK isn't establishing a WebRTC connection at all.

Two issues found:

1. **Missing `onError` callback** — `MeetingView` listens for `onMeetingJoined` and `onMeetingLeft` but does NOT handle `onError`. When the SDK fails to connect (WebSocket failure, invalid room, network issue), the error is swallowed and the component just spins until the 15s timeout.

2. **`Cross-Origin-Opener-Policy: same-origin`** in `vercel.json` — this header isolates the browsing context and can break WebRTC peer connections that VideoSDK relies on. It prevents cross-origin communication needed for WebRTC signaling.

### Changes

**1. `src/components/videosdk/MeetingView.tsx`** — Add proper error handling
- Add `onError` callback to `useMeeting` to capture SDK errors (e.g., `JOIN_ROOM_FAILED`, `WEBSOCKET_DISCONNECTED`)
- Add `onMeetingStateChanged` to track connection state
- Show the actual error message instead of generic "Connection timed out"
- Add console logging for debugging
- Increase the join timeout to 20s and show a more informative message on failure

**2. `src/components/videosdk/VideoCallModal.tsx`** — Better error surfacing
- Add error state display when token/room creation succeeds but SDK join fails
- Pass error details from MeetingView up to modal

**3. `vercel.json`** — Remove `Cross-Origin-Opener-Policy`
- Remove `Cross-Origin-Opener-Policy: same-origin` header entirely — it blocks WebRTC cross-origin signaling that VideoSDK needs

**4. `src/hooks/useBlackBoxSession.ts`** — Add error logging
- Log token and room_id values when session is accepted to aid debugging

### Technical Details

VideoSDK's `useMeeting` hook provides an `onError` callback with `{ code, message }`:
- Code `1001` = WebSocket disconnected
- Code `1103` = JOIN_ROOM_FAILED
- Code `3001-3xxx` = various media/network errors

Currently none of these are caught. The fix captures them and displays the actual failure reason, and removes the header that likely causes the WebSocket/WebRTC failure in the first place.

### Files Modified
- `src/components/videosdk/MeetingView.tsx`
- `src/components/videosdk/VideoCallModal.tsx`
- `src/hooks/useBlackBoxSession.ts`
- `vercel.json`

