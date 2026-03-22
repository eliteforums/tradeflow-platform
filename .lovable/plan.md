

## Plan: Fix BlackBox User-Side Not Joining Call

### Root Cause

The polling fallback (lines 111-116) only calls `fetchTokenIfNeeded` when it detects a **change** in status or room_id. But if the Realtime event already updated `activeSession` (so status/room match the DB), yet the token fetch **failed**, the poll sees "no change" and never retries. The user gets stuck in the "Connecting..." state permanently.

Additionally, `fetchTokenIfNeeded` has no retry logic — a single failure means the token is never obtained.

### Fix (single file: `src/hooks/useBlackBoxSession.ts`)

1. **Polling: always attempt token fetch when needed**, not just on data changes. Replace the change-detection-only logic with: if session is active + has room_id + no token → call `fetchTokenIfNeeded`, regardless of whether data changed from last poll.

2. **Add retry with backoff to `fetchTokenIfNeeded`**: If `getVideoSDKToken()` throws, retry up to 3 times with 2s delays before giving up. This handles transient network/auth failures.

3. **Reduce poll interval from 5s to 3s** while waiting for token (more responsive UX).

### Files to modify
- `src/hooks/useBlackBoxSession.ts`

