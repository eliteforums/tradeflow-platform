

## Plan: Add Call Functionality to Peer Connect

### Approach
Reuse the existing `VideoCallModal` component (already used by BlackBox) to add audio call capability within active Peer Connect sessions. The `peer_sessions` table already has a `room_id` column for this purpose.

### Changes

#### 1. `src/pages/dashboard/PeerConnect.tsx` — Desktop
- Import `VideoCallModal` and `Phone`/`Video` icons
- Add state `callMode` (`null | "audio" | "video"`)
- In the chat header (line ~439, next to flag/close buttons), add a Phone button (audio call) visible when session is `active`
- Render `VideoCallModal` when `callMode` is set, passing `activeSession.room_id` as `existingRoomId` and `activeSession.id` as session context
- On call start, if no `room_id` exists yet, the modal handles room creation automatically

#### 2. `src/components/mobile/MobilePeerConnect.tsx` — Mobile
- Same additions: Phone button in chat header, VideoCallModal rendering

#### 3. `src/hooks/usePeerConnect.ts` — Save room_id
- Add a `startCall` mutation that creates a VideoSDK room (via `createVideoSDKRoom`), saves the `room_id` to the `peer_sessions` row, and notifies the other party
- Return `startCall` and room creation state from the hook
- When the other party receives the notification + room_id update via realtime, they can join the same room

#### 4. Call notification
- When one party starts a call, insert a notification for the other party: "Incoming call on Peer Connect"
- The realtime subscription on `peer_sessions` already picks up `room_id` changes, so the other user's UI updates automatically

### Technical Details
- `VideoCallModal` already handles: token generation, room creation (if no `existingRoomId`), joining, leaving
- `peer_sessions.room_id` column already exists in the schema
- Audio-only mode is default (safer for anonymous sessions); video can be an optional toggle
- Both parties see a "Join Call" button once `room_id` is set on the session

### Files Modified
- `src/hooks/usePeerConnect.ts` — Add `startCall` mutation, expose call state
- `src/pages/dashboard/PeerConnect.tsx` — Call button in header, VideoCallModal
- `src/components/mobile/MobilePeerConnect.tsx` — Same call UI for mobile

