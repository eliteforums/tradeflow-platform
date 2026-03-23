

## Plan: Fix SPOC Emergency Module + Rebuild Peer Connect as WhatsApp-like Chat

### Issue 1: SPOC Emergency/Escalation Module Not Working

**Root cause:** The escalation query in `SPOCDashboardContent.tsx` uses a Supabase join with `profiles!escalation_requests_spoc_id_fkey(username)`, but no foreign key constraint exists on `escalation_requests.spoc_id` referencing `profiles.id`. This causes the query to fail silently, returning no data.

**Fix:**
1. **Database migration**: Add a foreign key constraint on `escalation_requests.spoc_id` referencing `profiles.id`.
2. Also add FK for `admin_id` and `session_id` columns while we're at it, for consistency.

### Issue 2: Peer Connect — Rebuild as WhatsApp-like Chat Interface

**Current problems:**
- Shows "No interns available" because the query filters by `training_status IN ('active', 'completed')` — if no interns have completed training, the list is empty.
- UI is a basic sidebar + chat panel, not a WhatsApp-like conversation interface.
- No conversation history list with last message preview and timestamps.
- No unread indicators.

**Per PRD (Section 4.2):**
- Student sees list of available interns with status, focus areas, training badge.
- Student selects intern, initiates session request.
- Real-time chat with messages.
- Session costs 20 ECC.

**Rebuild plan — WhatsApp-like UI:**

#### A. `usePeerConnect.ts` changes:
- Relax training filter: also include interns with `training_status = 'not_started'` during early platform stage (no interns have completed training yet), OR remove the filter and show all active interns.
- Add a `lastMessages` map: for each session, fetch the most recent message to show as preview in conversation list.
- Add `unreadCounts` tracking per session.

#### B. Desktop `PeerConnect.tsx` — WhatsApp layout:
- **Left panel**: Two sections — "Conversations" (active/recent sessions with last message preview, timestamp, unread badge) and below "Available Interns" (tappable to start new session).
- **Right panel**: Full chat area with message bubbles, input bar, call button.
- Conversation list items show: intern/student avatar, name, last message preview (truncated), timestamp, unread count badge, online status dot.
- Search filters both conversations and interns.

#### C. Mobile `MobilePeerConnect.tsx` — Same WhatsApp treatment:
- Full-screen conversation list view with same preview cards.
- Tap to open full-screen chat.
- Back arrow to return to list.

#### D. Visual polish:
- WhatsApp-style message bubbles (teal for sent, dark card for received).
- Typing indicator placeholder.
- "Today"/"Yesterday" date dividers between message groups.
- Double-check mark for delivered messages (visual only).

### Files Modified

1. **Migration** — Add FK on `escalation_requests.spoc_id` → `profiles.id`
2. `src/hooks/usePeerConnect.ts` — Relax intern filter, add last message + unread tracking
3. `src/pages/dashboard/PeerConnect.tsx` — Full WhatsApp-like rebuild (desktop)
4. `src/components/mobile/MobilePeerConnect.tsx` — Full WhatsApp-like rebuild (mobile)
5. `src/components/spoc/SPOCDashboardContent.tsx` — Minor: update escalation query if FK name changes

### Technical Notes
- No edge function changes needed.
- The FK migration is safe — existing data should already have valid `spoc_id` values referencing profiles.
- Peer Connect session flow (create, send message, end, flag) remains unchanged — only the UI presentation and intern visibility filter change.

