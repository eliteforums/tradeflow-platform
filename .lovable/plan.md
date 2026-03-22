
## Plan: Stabilize Peer Connect + BlackBox Calls and Show Only Students in Intern Chat Logs

### What I found (current root causes)
1. **Peer Connect call mismatch**: audio call modal creates a room per user click, and `peer_sessions` has no shared `room_id`. So student and intern can enter different rooms.
2. **Interns appearing as “users”**: backend insert rules allow any authenticated user to create a peer session as `student_id` (only checks `auth.uid = student_id`). This lets interns create “student” sessions, so intern dashboards show intern names in student slots.
3. **Mobile mismatch still present**: mobile intern “Join” still navigates to `/dashboard/peer-connect` **without** `sessionId`, so wrong session can open.
4. **BlackBox reliability gap**: student auto-joins via hidden meeting view; if join times out/errors, there is no visible retry path in BlackBox screen. Also repeated taps can create multiple open requests.

### Implementation plan

#### 1) Harden backend session integrity (database migration)
- Add `peer_sessions.room_id text null` to store one shared call room per session.
- Tighten `peer_sessions` insert policy so:
  - creator must be a **student** role,
  - `intern_id` must be an **intern** role (active/training-complete).
- Add partial unique indexes to prevent duplicate active peer sessions:
  - one active session per student,
  - one active session per intern.
- Add one-time cleanup for currently invalid active peer sessions where `student_id` belongs to non-student role (close them safely).
- Add partial unique index for BlackBox open sessions per student (`queued/accepted/active`) to prevent duplicate “request” races.

#### 2) Fix Peer Connect call flow to always use one shared room
Files:
- `src/hooks/usePeerConnect.ts`
- `src/pages/dashboard/PeerConnect.tsx`
- `src/components/mobile/MobilePeerConnect.tsx`

Changes:
- Add role guard in `requestSession` (students only).
- Add helper `ensureSessionRoom(sessionId)`:
  - if session already has `room_id`, reuse it,
  - else create room once and persist `room_id` on the session, then reuse.
- Call button opens `VideoCallModal` with `existingRoomId` from shared session room.
- Include `student` relation in session query so intern-side participant identity is correct.
- Use `initialSessionId` deterministically and avoid fallback to unrelated active session.

#### 3) Make intern-facing chat/session UI student-only
Files:
- `src/components/intern/InternDashboardContent.tsx`
- `src/components/mobile/MobileInternDashboard.tsx`
- `src/pages/dashboard/PeerConnect.tsx`
- `src/components/mobile/MobilePeerConnect.tsx`

Changes:
- Filter intern dashboard session lists/history to only sessions where counterpart is student role.
- Intern “Join” uses `?sessionId=<id>` on **both desktop and mobile**.
- In Peer Connect intern view:
  - show assigned students (not intern directory),
  - header/chat partner name resolves from `student` relation, not intern list.

#### 4) Improve BlackBox connection reliability without changing core flow
Files:
- `src/hooks/useBlackBoxSession.ts`
- `src/pages/dashboard/BlackBox.tsx`
- `src/components/mobile/MobileBlackBox.tsx`
- `src/components/videosdk/MeetingView.tsx` (small extension)

Changes:
- In `requestSession`, reuse existing open student session instead of creating a new one.
- Surface join timeout/error from meeting layer back to BlackBox screen.
- Add visible “Reconnect / Join Call” action when auto-join fails (instead of silent hidden failure).
- Keep current UI structure, but add explicit retry path so student can recover if initial join fails.

### Technical details
- `peer_sessions` currently lacks call room persistence; adding `room_id` removes split-room behavior.
- Existing insert policy only checks identity equality, not role semantics; this is why intern-to-intern sessions are being created as “student” sessions.
- Hidden auto-join is fragile when join fails; a visible retry trigger is required for deterministic recovery.
- No broad refactor: this is a targeted stabilization pass on existing hooks/pages/components and policy/index hardening in database.
