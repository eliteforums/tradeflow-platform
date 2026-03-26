

## Enhance Sessions Tab with Detailed Log-Style View

### Current State
The Sessions tab shows a minimal card per session: description, date, type badge, status badge, and reschedule info for appointments. It discards most of the raw data already fetched (room_id, flag_level, duration, credits_charged, escalation_history, session_notes, etc.).

### What We'll Build

**1. Richer unified session data model**
- Pass through all raw fields from appointments, peer_sessions, and blackbox_sessions instead of flattening to just description/date/status
- Include: room_id, flag_level, credits_charged, session_type (video/voice/chat), duration (started_at → ended_at), escalation_history, student_id, expert/therapist/intern names, created_at vs started_at

**2. Expandable log-style session cards (like the audit log viewer)**
- Each session row shows: type badge, participants, status, timestamp, duration, flag level indicator
- Expandable detail section (using Collapsible) showing:
  - Session ID (copyable)
  - Room ID
  - Timeline: created → started → ended (with durations)
  - Credits charged (appointments)
  - Flag level with color indicator (blackbox)
  - Escalation history entries (blackbox)
  - Session type (video/voice/chat)
  - Reschedule info (appointments)

**3. Search and filters**
- Text search across participant names, session IDs
- Existing type filter (All/Appointment/Peer/BlackBox) kept
- Add status filter dropdown: All, Active, Completed, Cancelled, Pending, Escalated
- Date range quick-filters: Last 24h, 7 days, 30 days, All

**4. Summary stats bar**
- Total sessions count, active now, flagged count, average duration — shown as compact stat chips above the list

### Technical Details

**File**: `src/pages/admin/AdminDashboard.tsx`
- Expand the `unifiedSessions` type and mapping to include all raw fields
- Replace the sessions rendering block (lines 390-453) with the new detailed component

**New file**: `src/components/admin/SessionsLogViewer.tsx`
- Receives raw appointments, peerSessions, blackboxSessions arrays
- Handles its own filtering/search state
- Renders collapsible log cards with metadata grids
- Uses existing UI: `Input`, `Select`, `Badge`, `Collapsible`, `Button`
- Computes duration from started_at/ended_at, formats as "Xm Ys"
- Copy-to-clipboard for session ID and room ID

### No database changes needed
All data is already fetched by `useAdmin` hook — just needs to be displayed.

