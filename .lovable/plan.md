
## Fix Plan — Critical Call Bugs (Expert Connect, Peer Connect, BlackBox)

### What I found (root causes)
1. **Duplicate call windows / duplicate participant tiles**
   - `PeerConnect` starts a call via `startCallAsync`, then opens `VideoCallModal` which can create another room again if `activeSession.room_id` is stale at that moment.
   - `MeetingView` auto-join retry loop can trigger repeated `join()` attempts before state settles.
   - Current call open state is boolean-only (`callMode` / `callModal`), with no per-session join lock.

2. **BlackBox mic button not working reliably**
   - Student BlackBox mounts `MeetingView` with `enableMonitoring={true}` (Web Speech monitor), which can conflict with mic UX and permissions.
   - Mic toggle binding is exposed early; no explicit “mic ready” handshake after join.
   - No preflight audio permission check before auto-join.

3. **L3 Critical shown but no join button**
   - Expert receives L3 notification, but `ExpertL3AlertPanel` depends on querying `blackbox_sessions` directly.
   - Access/claim flow for active L3 sessions is inconsistent, so expert may get alert but not a claimable join path.

---

## Implementation steps

### 1) Prevent duplicate call instances (all modules)
- Add a **call-instance guard** keyed by `sessionId + roomId` so each side renders one call UI per session.
- In `MeetingView`, replace recursive join retry loop with a single in-flight join lock (`joinInFlightRef`), and only retry from explicit “Retry” action.
- Add defensive cleanup on unmount to cancel pending timers/retry callbacks.

**Files**
- `src/components/videosdk/MeetingView.tsx`
- `src/pages/dashboard/PeerConnect.tsx`
- `src/components/mobile/MobilePeerConnect.tsx`
- `src/components/videosdk/VideoCallModal.tsx`

---

### 2) Make room creation idempotent (Expert Connect + Peer Connect)
- Ensure room assignment is atomic/idempotent:
  - If room already exists, always reuse it.
  - If creating new room, persist it with conditional update (`room_id IS NULL`), then re-read canonical `room_id`.
- Pass the resolved room id directly into modal state so modal does not create another room.

**Files**
- `src/hooks/usePeerConnect.ts`
- `src/components/videosdk/VideoCallModal.tsx`
- `src/pages/dashboard/PeerConnect.tsx`
- `src/components/mobile/MobilePeerConnect.tsx`
- `src/pages/dashboard/Appointments.tsx` / `src/components/mobile/MobileAppointments.tsx` (same idempotent room rule)

---

### 3) Fix BlackBox mic toggle reliability
- Disable audio monitoring on **student-side BlackBox** (`enableMonitoring={false}`) to avoid mic capture conflicts.
- Add audio permission preflight before join; show clear toast if blocked.
- Expose mic toggle callback only after joined state + local participant ready; add fallback state sync on `localMicOn` change.

**Files**
- `src/pages/dashboard/BlackBox.tsx`
- `src/components/mobile/MobileBlackBox.tsx`
- `src/components/videosdk/MeetingView.tsx`
- `src/hooks/useBlackBoxSession.ts`

---

### 4) Restore expert “Join Session” path for L3 escalations
- Add a deterministic claim path for experts:
  - If L3 session appears, show CTA regardless of notification-only state.
  - On click, claim session and open call with existing room.
- Ensure escalation flow keeps session discoverable/claimable by experts in real time (without requiring manual refresh).

**Files**
- `src/components/expert/ExpertL3AlertPanel.tsx`
- `src/components/expert/ExpertDashboardContent.tsx`
- `src/components/mobile/MobileExpertDashboard.tsx`
- `src/components/therapist/TherapistDashboardContent.tsx` (handoff metadata consistency)

**Backend adjustment**
- Add a small backend claim helper (migration + RPC or backend function) for safe L3 claim to avoid race conditions and guarantee one expert ownership.

---

### 5) Realtime + trigger hardening
- Ensure each screen subscribes once per active session and unsubscribes cleanly.
- Add guarded logging around:
  - room creation path,
  - join attempts,
  - mic toggle events,
  - L3 claim path.
- This will validate socket events and call-init triggers without duplicate subscriptions.

---

## Validation checklist (must pass)
1. **Peer Connect**: both users click call quickly -> only one shared room, one call UI each, no duplicate self tile.
2. **Expert Connect**: both sides join same appointment -> same room id reused, no second modal/room.
3. **BlackBox**: mic button toggles mute/unmute state immediately and remote side hears mute/unmute correctly.
4. **L3 Escalation**: expert gets alert + visible Join CTA; clicking Join opens live session and claims ownership once.
5. Route switch / remount / mobile view change does not spawn duplicate join attempts.

