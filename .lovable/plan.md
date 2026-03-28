

## Fix: Peer Connect — Call Indication on Both Sides

### Problem

When a call is initiated in Peer Connect, the receiving side has no visible indication. The `startCall` mutation sends a notification (`type: "peer_call"`) to the other party, but:

1. The **realtime subscription** only listens for `UPDATE` and `INSERT` on `peer_sessions`, not on `notifications`
2. Even when `room_id` is set on the session (detected via the 10s polling refetch), neither desktop nor mobile shows an **incoming call banner** — the "Join Call" button only appears in the chat header, which is easy to miss
3. No **system chat message** is injected into the conversation to indicate a call was started

### Fix

Two complementary indicators:

**A. In-chat system message** — When a call is started, automatically send a peer message like `📞 Voice call started` into the chat. This is visible to both sides immediately via the existing realtime message subscription.

**B. Incoming call banner** — When `activeSession.room_id` becomes set and `callMode` is null (meaning the other party started the call), show a prominent incoming call banner with "Join" / "Dismiss" buttons. Detect this by comparing `room_id` presence when the session data refreshes.

### Implementation

#### File: `src/hooks/usePeerConnect.ts`
- In the `startCall` mutation's `mutationFn`, after successfully setting `room_id`, insert a system message into `peer_messages`:
  ```
  { session_id: sessionId, sender_id: user.id, content_encrypted: "📞 Voice call started" }
  ```
- This message arrives via the existing realtime channel on both sides

#### File: `src/pages/dashboard/PeerConnect.tsx` (Desktop)
- Add an incoming call banner: when `activeSession.status === "active"` and `activeSession.room_id` exists and `callMode` is null, show a dismissible banner above the messages area with pulsing phone icon + "Incoming Call — Join" button
- Track a `dismissedCallRoomId` state to allow dismissing the banner for a specific room

#### File: `src/components/mobile/MobilePeerConnect.tsx` (Mobile)
- Same incoming call banner logic, adapted for mobile layout

### Files to Edit

| File | Change |
|------|--------|
| `src/hooks/usePeerConnect.ts` | Insert system chat message on call start |
| `src/pages/dashboard/PeerConnect.tsx` | Add incoming call banner for receiving side |
| `src/components/mobile/MobilePeerConnect.tsx` | Add incoming call banner for receiving side (mobile) |

