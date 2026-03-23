

## Fix: Intern's Sent Messages Not Appearing in Chat UI

### Root Cause
The `sendMessage` mutation in `usePeerConnect.ts` does not optimistically add the sent message to local state. It relies entirely on the Supabase realtime subscription to echo the message back. If realtime has any delay or fails to deliver (which can happen with complex RLS subqueries on the SELECT policy), the intern never sees their own message.

### Changes

#### `src/hooks/usePeerConnect.ts`
1. **Optimistic message insert**: After the `supabase.from("peer_messages").insert(...)` call succeeds, immediately add the message to the local `messages` state with a temporary ID and the current timestamp
2. **Deduplication in realtime handler**: Update the realtime `INSERT` handler to skip adding a message if one with the same `id` already exists in state (prevents duplicates when realtime also delivers the message)

### Technical Details
- Generate a temporary UUID for the optimistic message; when the realtime event arrives with the real ID, the dedup check by `id` will add it (since temp ID differs), but we can also dedup by matching `sender_id + content + close timestamp` to avoid visual duplicates
- Simpler approach: return the inserted row from the mutation using `.select().single()` and add it to state in `onSuccess`, then dedup realtime by `id`

### Files Modified
- `src/hooks/usePeerConnect.ts` — Add optimistic update + realtime dedup

