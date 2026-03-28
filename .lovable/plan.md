

## Escalation Flow Improvements — Plan

### 3.1 Expert Escalation Button After Session Completion

**Problem**: Escalation button only shows for active/pending appointments (line 367: `apt.status !== "completed"`). No post-session escalation option.

**Fix in `src/components/expert/ExpertDashboardContent.tsx`**:
- Add an "Escalate" button for completed appointments (within the completed appointment cards on the Home tab and Sessions tab)
- The button opens the same escalation dialog already wired up

### 3.2 SPOC Dashboard — Structured Escalation View

**Problem**: Escalation cards on SPOC dashboard show justification text but lack structured session details (student ID, session info, escalated-by info). The `trigger_snippet` JSON already contains `student_eternia_id`, `student_username`, `session_id`, `session_type` — but only the emergency contact fields are rendered.

**Fix in `src/components/spoc/SPOCDashboardContent.tsx`**:
- Parse `trigger_snippet` JSON for ALL escalations (not just emergency_contact type)
- Display structured fields: Student ID, Student Username, Session Type, Session ID, Escalated-by timestamp
- Show session info prominently above the justification text
- For non-emergency escalations (intern/expert), still show available session metadata

### 3.3 BlackBox L3 — Fix "Claimed by another expert" Bug

**Problem**: In `ExpertL3AlertPanel.tsx` line 178, `isClaimedByOther` checks `session.therapist_id !== user?.id`. But `therapist_id` is the **original therapist** who started the session — NOT an expert who claimed it. So every L3 session with a therapist shows "Claimed by another expert" and hides the Join button.

**Fix in `src/components/expert/ExpertL3AlertPanel.tsx`**:
- Change `isClaimedByOther` logic: instead of checking `therapist_id`, check `escalation_history` array for an `expert_joined` entry by a DIFFERENT expert
- If no expert has joined yet → show "Join Call" button
- If current expert joined → show "Rejoin Call" + "Escalate" buttons
- If a different expert joined → show "Claimed by another expert"
- Fetch `escalation_history` in the query (already available via the session object)

### Files to Edit
1. **`src/components/expert/ExpertDashboardContent.tsx`** — Add post-session escalation button for completed appointments
2. **`src/components/expert/ExpertL3AlertPanel.tsx`** — Fix claimed-by logic using `escalation_history` instead of `therapist_id`
3. **`src/components/spoc/SPOCDashboardContent.tsx`** — Enhance escalation cards with structured session details

### No database or edge function changes needed

