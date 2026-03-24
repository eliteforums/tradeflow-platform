

## Plan: Redesign Peer Connect to Match PRD v2-39 Section 4.2

### PRD Requirements vs Current State

The PRD specifies Peer Connect as an **intern-moderated anonymous chat** with a **request → accept** flow. Current implementation skips the acceptance step entirely — sessions go straight to "active" when a student selects an intern.

| PRD Requirement | Current State | Action |
|---|---|---|
| Intern must **accept** request within time window | Session created as "active" immediately | Add pending → accept/decline flow |
| Request **expires** if not accepted in time | No expiry on pending requests | Add 2-minute auto-expiry |
| Intern receives **push notification** on request | No notification sent | Insert notification on session creation |
| **Training badge** shown on intern card | Not shown | Add badge from `training_status` |
| Focus areas + availability status | Already implemented | No change |
| Interns can flag/escalate | Already implemented | No change |
| 20 ECC per completed session | Already implemented | No change |

### Changes

#### 1. Database: Add accept/decline support
- No schema change needed — `peer_sessions` already has `status: pending/active/completed/flagged`
- Currently we insert with `status: "active"` — change to `status: "pending"`

#### 2. `src/hooks/usePeerConnect.ts` — Core Flow Changes

**Request session (student side):**
- Change insert from `status: "active"` to `status: "pending"`
- Remove `started_at` from initial insert (set on accept)
- Create a notification for the intern: insert into `notifications` table with type "peer_request"

**Accept session (intern side) — NEW:**
- Add `acceptSession` mutation: updates session to `status: "active"`, sets `started_at`
- Add `declineSession` mutation: updates session to `status: "completed"`, refunds 20 ECC to student

**Auto-expiry:**
- Add client-side timer: if a pending session is older than 2 minutes, mark it expired
- Student sees "Request expired — try another intern"

**Realtime subscription for session status changes:**
- Subscribe to `postgres_changes` on `peer_sessions` for the user's sessions so accept/decline is reflected instantly

#### 3. `src/pages/dashboard/PeerConnect.tsx` — Desktop UI

**Student experience:**
- After clicking an intern, show a "Waiting for intern to accept..." state with a countdown timer (2 min)
- If accepted → chat opens automatically
- If expired/declined → show message, allow selecting another intern

**Intern experience:**
- Show incoming request banner/card at top of chat list with Accept/Decline buttons
- Pending sessions appear with a pulsing indicator and "New request" label
- Accept opens the chat; Decline returns session to student

**Training badge on intern cards:**
- Show a small verified badge icon next to intern name if `training_status === "active"`

#### 4. `src/components/mobile/MobilePeerConnect.tsx` — Mobile UI

Same flow changes as desktop:
- Student: waiting state with timer after selecting intern
- Intern: incoming request card at top of list view with Accept/Decline
- Training badge on intern cards

#### 5. Notification on request

When student creates a pending session, insert a notification row for the intern:
```
{ user_id: internId, title: "New Peer Connect Request", message: "A student wants to chat with you", type: "peer_request" }
```
This triggers the existing realtime notification bell + sound.

### Files Modified
- `src/hooks/usePeerConnect.ts` — Pending flow, accept/decline mutations, realtime session subscription, notification insert
- `src/pages/dashboard/PeerConnect.tsx` — Waiting state, intern accept/decline UI, training badge
- `src/components/mobile/MobilePeerConnect.tsx` — Same UI changes for mobile

### Technical Details
- 2-minute expiry is enforced client-side with `setTimeout` + server-side via the existing stale session cleanup trigger (2 hours, but we can tighten for pending to 5 min)
- Realtime channel on `peer_sessions` filtered by user ID catches accept/decline/expire events
- ECC refund on decline/expiry calls the existing `grant-credits` edge function or inserts a credit_transaction directly
- No new database tables or migrations needed — uses existing `peer_sessions.status` values

