

## Fix: Call Transcription Storage — Verification & Admin Dashboard Display

### Current State Analysis

After reviewing all relevant files, the transcription capture and storage flow is **already implemented end-to-end**:

1. **Trigger**: All three roles (Expert, Intern, Therapist) route escalations through the `escalate-emergency` edge function, passing `transcript_snippet`.
2. **Capture**: Expert and Therapist use `captureSnippetRef` (±10s audio buffer via `useAudioMonitor`). Intern falls back to last 10 peer chat messages when no audio is available.
3. **Backend Storage**: The edge function stores structured JSON in `escalation_requests.trigger_snippet` containing: Student Eternia ID, username, escalated_by_role, session_id, session_type, emergency contact, and transcript_snippet.
4. **Admin Dashboard**: `EscalationManager.tsx` parses the `trigger_snippet` JSON and displays Student ID, emergency contact, escalator role, transcript snippet, and reason.

### Remaining Issue

The Admin `EscalationManager` query (line 26) uses a foreign key join syntax:
```
.select("*, spoc:profiles!escalation_requests_spoc_id_fkey(username)")
```
But the `escalation_requests` table has **no foreign keys** defined. This join will fail, causing the query to error or return no data — meaning the admin sees nothing.

### Fix Plan

**File: `src/components/admin/EscalationManager.tsx`**

Replace the FK join with a two-step approach: fetch escalations first, then resolve SPOC usernames from profiles separately. Alternatively, use a simpler select without the FK join and look up the SPOC username from `trigger_snippet` JSON (which already contains `escalated_by_role` and student info).

Specifically:
1. Change the query from `select("*, spoc:profiles!escalation_requests_spoc_id_fkey(username)")` to `select("*")` — no FK join
2. Add a secondary query to fetch SPOC profile usernames for the `spoc_id` values in the results, or resolve inline from the parsed `trigger_snippet`
3. Update the "Filed by" display (line 181) to use the resolved username

This single fix ensures the Admin Dashboard correctly loads and displays all escalation entries with their full structured data (Student ID, session details, role, reason, emergency contact, transcript snippet).

### Files to Edit

| File | Change |
|------|--------|
| `src/components/admin/EscalationManager.tsx` | Remove FK join from query; resolve SPOC username via separate lookup |

