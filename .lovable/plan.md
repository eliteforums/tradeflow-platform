

## Plan: Update README with Latest Changes

### Changes

#### 1. Core Features Table (line 98)
Update Peer Connect description from "Realtime encrypted audio + chat with trained psychology interns (audio-only, no video)" to "WhatsApp-style encrypted text chat with trained psychology interns (real-time messaging)".

#### 2. Video & Audio Sessions section (lines 122-130)
- Remove line 128 ("Peer Connect — Audio-only + encrypted text chat") since Peer Connect no longer has audio/call functionality.

#### 3. Recent Updates section (lines 642-676)
Add new entries for March 2026:

- **Peer Connect WhatsApp-like Rebuild**: Dual-panel desktop layout (conversation list + chat area), mobile full-screen chat flow, message preview with timestamps, online/busy status indicators, date dividers, WhatsApp-style message bubbles.
- **Peer Connect Call Removal**: Removed all video/audio call functionality from Peer Connect per PRD alignment — now text-chat only.
- **Database Schema Fixes**: Added foreign key constraints on `peer_sessions` (student_id, intern_id → profiles) and `peer_messages` (session_id → peer_sessions), added `room_id` column, enabled Supabase Realtime on `peer_messages`.
- **Intern Visibility Fix**: Relaxed intern filter to show all active interns regardless of training_status during early platform stage.

#### 4. PRD Implementation Memory
Update `.lovable/memory/features/prd-implementation.md` item 24 from "Peer Connect audio-only" to "Peer Connect text-chat only (WhatsApp-like UI, calls removed)".

### Files Modified
- `README.md` — 4 sections updated
- `.lovable/memory/features/prd-implementation.md` — Item 24 updated

