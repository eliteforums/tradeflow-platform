

## Fix: Escalation Transcript Not Showing on Admin Dashboard

### Root Cause

There are two separate escalation paths that create records in `escalation_requests`, but they store `trigger_snippet` in incompatible formats:

1. **`ai-transcribe` edge function** (auto L3): Stores `trigger_snippet` as a **plain text string** (raw transcript excerpt). No structured metadata (student name, emergency contact, session type) is included.

2. **`escalate-emergency` edge function** (manual): Stores `trigger_snippet` as **structured JSON** with `type: "emergency_contact"`, student details, emergency contact, and `transcript_snippet`.

The Admin Dashboard's `EscalationManager.tsx` tries `JSON.parse(esc.trigger_snippet)` — for ai-transcribe records, this fails silently, so `parsed` is `null`. The fallback renderer (line 292) does show the raw text, but it lacks any structured data (student name, session details, transcript label). This makes it appear as if the transcript data is "missing" when viewed from the admin panel.

Additionally, the ai-transcribe L3 escalation doesn't include student details, emergency contacts, or the escalating role — so even if the snippet renders, the admin has no context about who the student is.

### Fix Plan

#### 1. Update `ai-transcribe` edge function — Store structured JSON in `trigger_snippet`
**File**: `supabase/functions/ai-transcribe/index.ts` (lines ~280-312)

When creating the L3 escalation record, build a structured JSON trigger_snippet that includes:
- `type: "ai_l3_detection"` (new type for AI-detected escalations)
- `transcript_snippet`: the raw transcript excerpt
- `student_id`, `student_username`, `student_eternia_id`: from the student's profile
- `session_type`: "blackbox" or "peer"
- `keywords`, `risk_indicators`, `emotional_signals`: from the AI analysis
- `reasoning`: AI's reasoning text

This requires fetching the student profile (username, student_id) before inserting. The student_id is already available from `existingSession.student_id`.

#### 2. Update `EscalationManager.tsx` — Render AI-detected escalation type
**File**: `src/components/admin/EscalationManager.tsx`

Add a new render block for `parsed?.type === "ai_l3_detection"` that displays:
- Student username and Eternia ID
- AI-detected keywords and risk indicators as badges
- Emotional signals
- AI reasoning text
- The transcript snippet in a monospace block

#### 3. Update `SPOCDashboardContent.tsx` — Same rendering for SPOC view
**File**: `src/components/spoc/SPOCDashboardContent.tsx`

Add the same `ai_l3_detection` render block so SPOCs also see the structured AI escalation data.

### Files to Edit
- `supabase/functions/ai-transcribe/index.ts` — Build structured JSON for trigger_snippet on L3 escalation
- `src/components/admin/EscalationManager.tsx` — Add `ai_l3_detection` type renderer
- `src/components/spoc/SPOCDashboardContent.tsx` — Add matching renderer for SPOC view

