

## Plan: Emoji Picker + Multi-line Chat Input + Notification Sound + Escalation Usernames

### 1. Emoji Picker & Multi-line Input for Chat

**Files:** `PeerConnect.tsx`, `MobilePeerConnect.tsx`

- Replace the single-line `<Input>` in the chat input bar with a `<Textarea>` that auto-grows (1-4 rows)
- Change Enter behavior: Enter sends, Shift+Enter adds newline
- Add an emoji picker button (using a simple emoji grid popover with common emojis — no external dependency needed)
- Render message text with `whitespace-pre-wrap` so newlines display correctly in bubbles

### 2. Notification Sound on New Notifications

**File:** `useNotifications.ts`

- Add an `Audio` object with a short notification sound (use a small embedded base64 chime or a public domain sound file)
- In the realtime subscription's `INSERT` handler, play the sound before invalidating the query
- Respect a simple check: only play if the document is visible or the tab is active

### 3. Escalation Manager — Show Both Party Usernames

**File:** `EscalationManager.tsx`

- Update the Supabase query to also join the student username:
  - For escalations with `session_id`: join `peer_sessions` to get `student_id`, then join `profiles` for the student username
  - Since Supabase JS can't do deep nested joins across FK chains easily, use a two-step approach: fetch escalations, then batch-fetch the session's student profiles
- Alternatively, simpler approach: the `trigger_snippet` JSON already contains `student_username` and `student_eternia_id` for emergency-type escalations. For peer session escalations, update the `flagSession` mutation in `usePeerConnect.ts` to include student/intern usernames in the `trigger_snippet` JSON
- Display: Show "Filed by: {spoc/intern username}" and "Regarding: {student username}" in each escalation card

**Detailed approach for escalation usernames:**
- Update `EscalationManager.tsx` query: join session data via `session:peer_sessions!escalation_requests_session_id_fkey(student_id, intern_id, student:profiles!peer_sessions_student_id_fkey(username), intern:profiles!peer_sessions_intern_id_fkey(username))`
- In the card UI, show the filer (spoc username — already available) and the affected student (from session join or trigger_snippet)
- For escalations created by interns via `flagSession`, update `usePeerConnect.ts` to embed both usernames in `trigger_snippet` JSON

### Files Modified
- `src/pages/dashboard/PeerConnect.tsx` — Textarea + emoji picker + whitespace-pre-wrap
- `src/components/mobile/MobilePeerConnect.tsx` — Same textarea + emoji changes
- `src/hooks/useNotifications.ts` — Play sound on new notification
- `src/components/admin/EscalationManager.tsx` — Join + display both party usernames
- `src/hooks/usePeerConnect.ts` — Embed usernames in escalation trigger_snippet

