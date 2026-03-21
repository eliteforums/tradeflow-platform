

## Plan: Implement Change Document v1

This plan addresses the changes outlined in the Eternia Change Request Document, using Groq AI for all AI-related work.

---

### Phase 1: Groq AI Integration — Selective Transcription & Flagging

**Current state**: AI moderation uses Lovable AI gateway (`ai-moderate` edge function). The doc requires Groq-based transcription with keyword detection and L1/L2/L3 flagging.

**Changes**:

1. **Add Groq API secret** — Request user's Groq API key via `add_secret` tool
2. **Create `ai-transcribe` edge function** — New function using Groq API (`https://api.groq.com/openai/v1/chat/completions`) to:
   - Detect sensitive keywords (depression, self-harm, suicide, etc.)
   - Classify into L1 (mild), L2 (moderate), L3 (critical)
   - Store only 10s before + 10s after trigger word (not full conversation)
   - Return flag level and trigger snippet
3. **Update `ai-moderate` edge function** — Switch from Lovable AI to Groq API for BlackBox entry classification
4. **Add escalation trigger storage** — Store trigger snippets (±10s context) in `escalation_requests` table
5. **Wire AI monitoring into BlackBox sessions** — Call `ai-transcribe` during active BlackBox voice sessions for real-time keyword detection
6. **Expert/Peer Connect** — Add manual escalation button (no automatic AI escalation), store escalation with time slot

### Phase 2: BlackBox — Enforce Audio-Only, No Chat

**Current state**: BlackBox already uses `webcamEnabled: false` but MeetingView still shows video UI elements.

**Changes**:
1. **BlackBox page** — Pass `audioOnly={true}` to `LazyMeetingView` (already partially done)
2. **Remove chat references** from BlackBox — ensure no text chat during voice sessions
3. **Therapist Dashboard** — Ensure therapist side also enforces audio-only in `MeetingProvider`

### Phase 3: Escalation System — Multi-Level L1→L2→L3

**Changes**:
1. **Database migration** — Add `escalation_level` (1/2/3), `trigger_snippet`, `trigger_timestamp` columns to `escalation_requests`
2. **L3 Host Switching** — When L3 is triggered in BlackBox, allow switching host from intern/therapist to M.Phil expert
3. **Emergency Contact sharing on escalation** — On L3, fetch and share emergency contact from `user_private`
4. **SPOC Dashboard** — Show L3 escalations prominently with emergency contact info

### Phase 4: Student ID System

**Changes**:
1. **Database migration** — Add `student_id` column to `profiles` table with auto-generation trigger (format: `ETN-{institution_code}-{sequence}`)
2. **Profile page** — Display system-generated Student ID (read-only)
3. **Admin Members view** — Show Student IDs, group by institution/university

### Phase 5: Recovery Setup — Hint Word as Dropdown

**Current state**: Free-text hint input fields.

**Changes**:
1. **RecoverySetup.tsx** — Replace free-text hint `Input` with `Select` dropdown containing predefined hint questions (e.g., "Favorite color", "First pet's name", "Childhood nickname", etc.)
2. **MobileRecoverySetup.tsx** — Same dropdown change

### Phase 6: Profile & Credits Fixes

**Changes**:
1. **Profile page** — Remove any red/extreme warning text
2. **Credits system** — Add role check so only students can earn/spend credits; hide credit-related UI for interns, experts, and therapists

### Phase 7: Admin Members — University Grouping

**Changes**:
1. **MemberManager.tsx** — Group members by institution/university in the members list
2. **Show Student IDs** in the member list

---

### Technical Details

**Groq API integration**:
- Endpoint: `https://api.groq.com/openai/v1/chat/completions`
- Model: `llama-3.3-70b-versatile` (fast, good for classification)
- Auth: `Bearer ${GROQ_API_KEY}` header
- Used in edge functions only (server-side)

**Database migrations needed**:
- Add `student_id TEXT UNIQUE` to `profiles`
- Add `escalation_level INT DEFAULT 1`, `trigger_snippet TEXT`, `trigger_timestamp TIMESTAMPTZ` to `escalation_requests`
- Create trigger for auto-generating student IDs on profile creation

**Files to create/modify** (~15 files):
- `supabase/functions/ai-transcribe/index.ts` (new)
- `supabase/functions/ai-moderate/index.ts` (update to Groq)
- `src/pages/dashboard/BlackBox.tsx` (enforce audioOnly)
- `src/components/mobile/MobileBlackBox.tsx` (enforce audioOnly)
- `src/components/therapist/TherapistDashboardContent.tsx` (audioOnly + escalation levels)
- `src/pages/dashboard/RecoverySetup.tsx` (hint dropdown)
- `src/components/mobile/MobileRecoverySetup.tsx` (hint dropdown)
- `src/pages/dashboard/Profile.tsx` (remove red text, show student ID)
- `src/components/mobile/MobileProfile.tsx` (same)
- `src/pages/dashboard/Credits.tsx` (role gate)
- `src/components/mobile/MobileCredits.tsx` (role gate)
- `src/components/admin/MemberManager.tsx` (university grouping)
- `src/components/spoc/SPOCDashboardContent.tsx` (L3 escalation display)
- `src/components/expert/ExpertDashboardContent.tsx` (manual escalation button)
- DB migrations (2-3 migration calls)

**Prerequisite**: User must provide Groq API key before AI changes can proceed.

