

## Plan: Fix Peer Connect Calling — 3 Bugs

### Issues Found

1. **Race condition**: When clicking the phone button with no existing `room_id`, `startCall()` (async mutation) and `setCallMode("audio")` fire simultaneously. The modal opens immediately with `existingRoomId={undefined}` and creates its own room — while `startCall` also creates a separate room. Two rooms, neither properly linked.

2. **Null `activeSessionId`**: On desktop, `startCall(activeSessionId)` passes a potentially `null` value (type is `string | null`). TypeScript may not catch this at runtime but `startCall` mutation will fail with "Session is not active" since no session matches `null`.

3. **Modal opens before room exists**: The `VideoCallModal` gets `existingRoomId={activeSession?.room_id || undefined}` — but since `room_id` hasn't been saved yet (mutation is still in flight), it's always `undefined` on first call, causing the modal to create a duplicate room.

### Fix

#### 1. `src/pages/dashboard/PeerConnect.tsx` — Wait for room before opening modal
- When no `room_id` exists: call `startCall` with an `onSuccess` callback that sets `callMode` only after the room is created and the session query is invalidated
- When `room_id` exists: set `callMode` directly (existing behavior, works fine)
- Guard against null `activeSessionId` with early return

#### 2. `src/components/mobile/MobilePeerConnect.tsx` — Same fix
- Same race condition fix: only open modal after `startCall` mutation succeeds

#### 3. `src/hooks/usePeerConnect.ts` — Return mutateAsync for awaitable calls
- Expose `startCallAsync: startCall.mutateAsync` so the UI can `await` it before opening the modal
- Alternative: accept an `onSuccess` callback parameter

### Files Modified
- `src/hooks/usePeerConnect.ts` — Expose `startCallAsync`
- `src/pages/dashboard/PeerConnect.tsx` — Await room creation before opening modal
- `src/components/mobile/MobilePeerConnect.tsx` — Same fix

