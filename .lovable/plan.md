

## Fix: Escalation Flow — 2 Remaining Issues

### 3.1 Expert Escalation Button Placement

**Current state**: Already implemented correctly:
- During call: In-session escalate button (line 588) + `onEscalate` passed to VideoCallModal (line 879)
- After call: Completed appointment cards have Escalate button (line 565)

**No code change needed** — the escalation button is available both during and after calls.

### 3.2 SPOC Dashboard — Structured Escalation View

**Root cause**: The SPOC escalation display parses `trigger_snippet` JSON and shows Student ID, Username, Session Type, Session ID, and emergency contact — but is missing:
1. **Escalator role** — the edge function stores `escalated_by_role` in the JSON but the SPOC display never renders it
2. **Escalation reason** — shown as raw text dump, not labeled clearly as "Reason for Escalation"

**File: `src/components/spoc/SPOCDashboardContent.tsx`** (lines 878-957)

Add to the structured session details grid (inside the `hasSessionInfo` block):
- Display `parsed.escalated_by_role` as "Escalated By" (e.g., "therapist", "expert", "intern")
- Display `parsed.transcript_snippet` in the session details section (currently only shown inside the emergency contact block, but it should be visible even without emergency contact data)

Move the escalation reason (`esc.justification_encrypted`) display to be clearly labeled as "Reason for Escalation" with a distinct heading.

### Files to Edit

| File | Change |
|------|--------|
| `src/components/spoc/SPOCDashboardContent.tsx` | Add escalator role display, improve reason labeling, show transcript outside emergency block |

