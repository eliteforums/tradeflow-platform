

## Fix Peer Connect — Make It Actually Work

### Root Causes Identified

1. **No foreign keys on `peer_sessions`**: The session query uses Supabase FK joins (`profiles!peer_sessions_intern_id_fkey`, `profiles!peer_sessions_student_id_fkey`) but the table has NO foreign key constraints. This causes the entire session query to fail silently, returning no data.

2. **No `room_id` column**: The hook references `room_id` on `peer_sessions` for video/audio calls, but this column doesn't exist in the table schema. All call-related functionality is broken.

3. **No realtime enabled**: `peer_messages` needs realtime for live chat to work like WhatsApp.

### Plan

#### 1. Database Migration
Add missing FK constraints and the `room_id` column:
```sql
-- Add room_id column
ALTER TABLE public.peer_sessions ADD COLUMN IF NOT EXISTS room_id text;

-- Add foreign keys for join queries
ALTER TABLE public.peer_sessions 
  ADD CONSTRAINT peer_sessions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id),
  ADD CONSTRAINT peer_sessions_intern_id_fkey FOREIGN KEY (intern_id) REFERENCES public.profiles(id);

-- Add FK on peer_messages
ALTER TABLE public.peer_messages 
  ADD CONSTRAINT peer_messages_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.peer_sessions(id);

-- Enable realtime for live messaging
ALTER PUBLICATION supabase_realtime ADD TABLE public.peer_messages;
```

#### 2. Fix `usePeerConnect.ts` — Remove `as any` casts
Once FKs and `room_id` exist, clean up the session query to remove unsafe `as any` casts. The query will now work properly because Supabase can resolve the FK join paths.

#### 3. No UI changes needed
The WhatsApp-like UI from the previous rebuild is already correct. The issue is purely data-layer — queries fail because the schema is missing constraints and columns.

### Files Modified
- **Migration** — Add `room_id` column, FK constraints, enable realtime
- `src/hooks/usePeerConnect.ts` — Clean up `as any` casts now that schema supports the queries

### Technical Notes
- The `peer_sessions` table already has RLS policies allowing participants to read/write — no RLS changes needed.
- Once FKs exist, the Supabase `.select()` join syntax will resolve correctly and sessions will load with intern/student profile data.
- Realtime on `peer_messages` enables instant message delivery without polling.

