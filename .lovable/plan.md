
## Plan: Fix Peer Connect “Session Ended / Can’t Restart Chat” Fully

### What I found
1. **New chat is wrongly blocked** in both desktop and mobile:
   - Start button is disabled with `|| !!activeSessionId`.
   - If you select any old/completed chat, `activeSessionId` stays set, so starting a new chat gets blocked.

2. **Intern session list pulls corrupted old rows**:
   - Intern query currently uses `student_id = me OR intern_id = me`.
   - This includes old test/corrupted sessions where an intern appears as a student, causing “dummy/old ended” items.

3. **Session reuse check can still pick stale sessions**:
   - `requestSession` checks `pending/active` without an age cutoff, so stale records can incorrectly block or reuse old sessions.

---

### Implementation steps

1. **Fix hook logic in `src/hooks/usePeerConnect.ts`**
   - Add a shared session timeout constant (2 hours) and helper to determine whether a session is still open.
   - For intern users, fetch sessions using only `intern_id = auth user` (remove `student_id` branch for intern mode).
   - In `requestSession`, only consider `pending/active` sessions newer than timeout when deciding reuse/block.
   - Expose a boolean like `hasOpenSession` from the hook for UI gating.

2. **Fix start-chat gating in UI**
   - Update both:
     - `src/pages/dashboard/PeerConnect.tsx`
     - `src/components/mobile/MobilePeerConnect.tsx`
   - Replace disable condition:
     - from: `status !== "online" || isRequesting || !!activeSessionId`
     - to: `status !== "online" || isRequesting || hasOpenSession`
   - This allows starting a new session even if an old/completed conversation is currently selected.

3. **Improve selection/reset UX**
   - When opening “New Chat”, clear stale selection (`setActiveSessionId(null)`).
   - Keep completed sessions viewable as history, but ensure they never block starting a new session.

4. **Data cleanup for old stuck rows (one-time)**
   - Run data update to mark any stale `pending/active` sessions older than timeout as `completed`.
   - This removes remaining legacy blockers from old test data.

5. **Hardening (recommended)**
   - Add DB guard for single open session per student (partial unique index for `student_id` where status in `pending/active`) to prevent race-condition duplicates.
   - Keep existing intern-side unique constraint.

---

### Technical details
- **Primary bug:** UI uses `activeSessionId` (selected conversation) as if it were “active ongoing session”.
- **Correct model:** block new session creation only when `hasOpenSession === true`, not when any thread is selected.
- **Intern data hygiene:** intern dashboard/chat should only show sessions where they are assigned intern; this removes old corrupted “intern-as-student” artifacts from current flow.
- **Safety:** stale timeout logic must be applied both for rendering and for request-time session checks.

---

### Validation checklist after implementation
1. Student can open an old completed thread and still start a fresh chat.
2. Student can start chat again after ending previous session.
3. Intern only sees sessions assigned to them (no dummy/corrupted legacy rows).
4. No “session ended” blocker when trying to start a new chat.
5. End-to-end test on both desktop and mobile Peer Connect flows.
