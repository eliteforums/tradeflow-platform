

## Plan: Fix 3 Critical Call Issues

### Issue 2.1: Multiple Windows During Calls (Duplicate Participant Rendering)

**Root Cause:** Two separate problems:

1. **BlackBox (student side):** The BlackBox page renders its own mic/video controls (lines 163-175 in BlackBox.tsx) that are separate from the `MeetingControls` component inside the hidden `MeetingView`. The custom buttons in the bottom controls section don't call `toggleMic()` or any SDK function — they're purely decorative. Meanwhile, `MeetingView` also renders `MeetingControls` inside the hidden container. This creates visual duplication.

2. **Expert/Peer/Appointments:** The `VideoCallModal` opens as a full-screen overlay while the underlying page may still show session UI. For Expert Connect and Peer Connect, the `VideoCallModal` is used correctly — the issue is likely that the same `join()` race condition from before (already partially fixed) is still causing duplicate participant entries.

**Fix:**
- **MeetingView.tsx:** Add a `hideControls` prop so BlackBox can suppress the internal `MeetingControls` (the BlackBox page has its own controls)
- **MeetingView.tsx:** Add a guard in `retryJoin` to reset `joinSucceeded.current = false` before retrying, and add `joined` to the closure check properly using a ref instead of stale closure
- **BlackBox.tsx / MobileBlackBox.tsx:** Pass `hideControls={true}` to MeetingView, and wire the custom Mic/Video buttons to actual SDK toggle functions via a callback ref pattern

### Issue 2.2: Blackbox Mic Not Working

**Root Cause:** The BlackBox page (both desktop and mobile) renders custom mic/video buttons in the "Bottom controls" section (lines 163-185 in BlackBox.tsx), but these buttons have **no onClick handlers for mic toggle**. The Mic button is purely visual — it doesn't call `toggleMic()`. The actual `MeetingControls` component with working `toggleMic()` is hidden inside the visually-hidden `MeetingView` container.

**Fix:**
- Expose `toggleMic` and `toggleWebcam` from `MeetingView` via a ref/callback pattern (similar to `onLeaveReady`)
- Add `onToggleMicReady` and `onMicStatusChange` callbacks to `MeetingView`
- Wire the BlackBox page's custom Mic button to actually call `toggleMic()` and track `localMicOn` state
- Same fix for MobileBlackBox

### Issue 2.3: Blackbox Escalation — No Join Button on Expert Dashboard

**Root Cause:** Looking at `ExpertL3AlertPanel.tsx`, the "Accept & Join Call" button exists (line 157), but `VideoCallModal` is used for the call UI. When the expert clicks "Accept & Join Call":
1. It updates the session status to "accepted"
2. Opens `VideoCallModal` with `existingRoomId={activeSession?.room_id}`
3. But `activeSession?.room_id` might be `null` at escalation time if the session was escalated before a room was created

The real issue: for escalated sessions, the `room_id` may be null or the `VideoCallModal` requires the expert to click "Start Call" first, but with `existingRoomId` being null, the modal shows a "Start Audio/Video Call" button instead of auto-joining.

**Fix:**
- In `ExpertL3AlertPanel.handleAcceptAndJoin`: if `session.room_id` is null, create a new room via `createVideoSDKRoom()` and update the session with the new room_id before opening the modal
- Ensure the `VideoCallModal` auto-starts when `existingRoomId` is provided (add `autoStart` prop or call `startCall` on mount when existingRoomId is set)

### Files Modified

1. **`src/components/videosdk/MeetingView.tsx`**
   - Add `hideControls` prop
   - Add `onToggleMicReady` and `onMicStatusChange` callbacks
   - Fix retry join closure issue with refs

2. **`src/pages/dashboard/BlackBox.tsx`**
   - Wire custom Mic button to actual `toggleMic` via callback
   - Track `localMicOn` state from MeetingView
   - Pass `hideControls={true}`

3. **`src/components/mobile/MobileBlackBox.tsx`**
   - Same mic wiring fix as desktop

4. **`src/components/expert/ExpertL3AlertPanel.tsx`**
   - Create room if `room_id` is null on accept
   - Auto-fetch token and open modal with valid room

5. **`src/components/videosdk/VideoCallModal.tsx`**
   - Add `autoStart` prop — when true and `existingRoomId` is provided, automatically call `startCall()` on mount

