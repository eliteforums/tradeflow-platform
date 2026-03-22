

## Plan: PRD v2-26 + CR v1.6 — Gap Analysis & Implementation

### Gap Analysis

After comparing both documents against the existing codebase, the following gaps remain. Most infrastructure/architecture sections (7-16) are specification-level guidance not implementable in the frontend. The actionable gaps are in feature modules and dashboard definitions.

---

### Already Implemented (No Changes Needed)

- 3-layer onboarding: Institution Code → QR Scan → Device Binding → Credentials → Profile (Sections 3.1-3.4)
- Dual verification model: APAAR/ERP by institution type (Register.tsx)
- Emergency contact with escalation consent checkbox
- Student dashboard: Expert Connect, Peer Connect, BlackBox, Sound Therapy, Self-Help, Wallet, Profile
- Expert dashboard tabs: Home, Schedule, Sessions, Notes, Profile
- Intern dashboard tabs: Training, Peer Sessions, Notes, Profile
- Therapist dashboard: Queue, Active Session, Escalation History, Profile
- SPOC dashboard: Home, Onboarding, Flags, Reports, Profile
- Admin dashboard with full control center
- ECC system: immutable ledger, earn/spend/grant/purchase, daily 5 ECC cap, low balance prompt
- ECC Stability Pool with auto-contribution
- Recovery Setup with hint-word dropdown + emoji pattern
- BlackBox queue restricted to Interns (not Experts)
- Role-based profile sections (student-only APAAR)
- Device binding + mismatch detection
- L3 host-swap architecture
- Training status lifecycle
- Realtime escalation notifications

### Gaps Found — Prioritized by Impact

**1. Expert Dashboard: Missing Escalation Button (PRD §20 — "Added controls: Escalation button")**

The PRD defines the Expert dashboard should have an **escalation button** on sessions. Currently the Expert dashboard removed all risk-related features. Per PRD, experts should be able to manually trigger escalation during active appointments (not AI-based BlackBox risk, but a manual escalation button for their own sessions). This is distinct from the BlackBox queue which was correctly removed.

**Files**: `src/components/expert/ExpertDashboardContent.tsx`

**2. Expert Dashboard: AI Risk Indicator (PRD §20 — "AI risk indicator")**

PRD says Expert dashboard should show an "AI risk indicator" — this refers to a simple visual indicator showing the session's current AI-assessed risk level during active video/audio calls. Not the BlackBox entries query that was removed. This is about the expert's own appointment sessions getting a real-time risk indicator from the transcription layer.

Since the AI selective transcription system (§19.1) is marked as Phase 2, this can be a placeholder/stub showing "AI Monitor: Active" badge during calls.

**Files**: `src/components/expert/ExpertDashboardContent.tsx`

**3. Therapist Dashboard: Not accessible to therapist role (CR v1.6 §2.3c)**

Currently the `/dashboard/therapist` route has `allowedRoles: ["intern"]`. But the PRD defines a separate "Therapist" role (`app_role` enum includes `therapist`). The therapist role should ALSO access this route. Currently only interns can access the BlackBox queue.

**Files**: `src/App.tsx`

**4. BlackBox: Audio-only enforcement (CR v1.6 §2.2)**

CR explicitly states BlackBox should support "audio-only interaction: No video, No chat, Only voice communication." Currently the BlackBox page shows a "Talk Now" button that creates an audio session, but it also shows text entry for BlackBox entries. Per CR, the live session component should be audio-only (correct), but the text entries are a separate journaling feature (also correct per PRD §4.3 — "Content stored encrypted in Blackbox entries"). So this is already correct — text entries are journaling, live sessions are audio-only. No change needed.

**5. Peer Connect: Audio + Chat only (CR v1.6 §2.3b)**

CR says Peer Connect should support "Audio call + Chat". Currently the Peer Connect UI shows both video and audio call buttons. Per CR, **remove the video call option** from Peer Connect — it should be audio + chat only.

**Files**: `src/pages/dashboard/PeerConnect.tsx`, `src/components/mobile/MobilePeerConnect.tsx`

**6. Expert Connect: Video + Audio (CR v1.6 §2.3a)**

Expert Connect should support "Video call + Audio call". This is already implemented correctly with both options. No change needed.

**7. SPOC Dashboard: Missing Reports tab items (PRD §20)**

PRD says SPOC dashboard should include "AI flags, Escalation logs, M.Phil override records." The Reports tab exists but may need the M.Phil override records and AI flags views. Let me verify this is already present via the existing SPOCDashboardContent.

**8. School as Institution Type (CR v1.6 §9.1)**

CR says "Allow adding and managing institutions within the system — Creating Schools same as Institutions." The `institution_type` column already exists with "university" default. The Admin InstitutionManager should allow creating institutions with type "school" as well. Need to verify this is exposed in the UI.

---

### Implementation Plan

| # | Task | Files | Change |
|---|------|-------|--------|
| 1 | Add escalation button to Expert sessions | `ExpertDashboardContent.tsx` | Add manual escalation button on active/in-progress appointment cards with dialog to submit escalation reason |
| 2 | Add AI Monitor stub badge to Expert sessions | `ExpertDashboardContent.tsx` | Show "AI Monitor: Active" badge on in-progress sessions as placeholder |
| 3 | Allow therapist role on BlackBox Queue route | `App.tsx` | Change `allowedRoles` from `["intern"]` to `["intern", "therapist"]` |
| 4 | Remove video call from Peer Connect | `PeerConnect.tsx`, `MobilePeerConnect.tsx` | Remove Video button, keep Audio + Chat only |
| 5 | Verify school institution type in admin | `InstitutionManager.tsx` | Ensure institution type dropdown includes "school" option |

### Technical Details

- **Escalation button**: Reuse existing `escalation_requests` table. Expert inserts a row with `session_id` referencing the appointment, `justification_encrypted` from a text input, and the escalation gets routed to the SPOC via the existing realtime subscription.
- **Therapist route access**: Simple addition of `"therapist"` to the allowedRoles array. The RLS policies on `blackbox_sessions` already allow experts (which covers the therapist use case via the existing policies — though we may need to add intern-specific policies too).
- **Peer Connect video removal**: Remove the `<Video>` icon button and the video mode option from the call modal trigger. Keep audio-only call + text chat.

