

## Fix Peer Connect — Clean Up Data + Add Guards

### Problems Found

1. **2 stale "active" sessions** stuck from hours ago, blocking new session creation for those users
2. **Corrupted data** — interns (intern3, intern4) appear as `student_id` in sessions (they were testing as students)
3. **No session timeout** — abandoned sessions stay "active" forever
4. **No DB-level guard** preventing interns from creating sessions as students
5. **Input allowed on completed sessions** — messages can be sent to ended sessions via the insert policy

### Plan

#### 1. Database Migration — Add Guards + Auto-Timeout
```sql
-- Auto-complete stale active sessions (older than 2 hours)
UPDATE peer_sessions 
SET status = 'completed', ended_at = now() 
WHERE status = 'active' AND started_at < now() - interval '2 hours';

-- Add a trigger to auto-expire sessions older than 2 hours
-- (runs on every session query to keep data clean)
CREATE OR REPLACE FUNCTION auto_expire_stale_peer_sessions()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE peer_sessions 
  SET status = 'completed', ended_at = now()
  WHERE status IN ('active', 'pending') 
    AND created_at < now() - interval '2 hours';
  RETURN NEW;
END;
$$;

-- Add RLS policy to prevent interns from creating sessions
-- (tighten INSERT check to require student role)
```

#### 2. Clean Up Corrupted Data
- Complete the 2 stale active sessions via insert tool (UPDATE)
- No need to delete corrupted sessions — they show as "completed" and don't block anything

#### 3. Fix `usePeerConnect.ts`
- Add session auto-expiry check on the client side — filter out sessions older than 2 hours from the "active" check
- Prevent sending messages to completed sessions (disable input when status !== "active" — already done in UI, but add to the mutation guard)
- Exclude self from intern list (so logged-in intern doesn't see themselves as available)
- Add `refetchInterval` on sessions query so status updates are picked up in near-realtime

#### 4. Fix UI Components
- Both desktop and mobile: ensure the "active session" detection properly handles expired sessions
- Add a "session expired" state for sessions that have been auto-completed

### Files Modified
- **SQL Migration** — Auto-expire stale sessions, add validation trigger
- **Data cleanup** — Complete stale active sessions via UPDATE
- `src/hooks/usePeerConnect.ts` — Client-side guards, self-exclusion, refetch interval
- `src/pages/dashboard/PeerConnect.tsx` — Minor guard improvements
- `src/components/mobile/MobilePeerConnect.tsx` — Same guards

### Technical Details
- Stale sessions: `5a0bad86` (nhibataunga+intern4) and `06abdd4b` (User01+intern3) — both stuck as "active"
- The trigger fires on INSERT to peer_sessions, cleaning up stale ones automatically
- Client-side: intern list filters out `user.id` so interns don't chat with themselves
- Session query gets `refetchInterval: 15000` to catch status changes from the other party

