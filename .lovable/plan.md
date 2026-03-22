

## Plan: CR v1.8 Gap Analysis & Implementation

### Gap Analysis Summary

After comparing CR v1.8 against the full codebase, here is what's already done vs what's missing:

| CR Section | Requirement | Status |
|---|---|---|
| 2.1 Student ID System | Auto-generated Eternia IDs | ✅ Done (`generate_student_id` trigger) |
| 2.2 BlackBox audio-only | No video, no chat, voice only | ✅ Done (`audioOnly={true}`, no chat in BlackBox) |
| 2.3a Expert Dashboard | Video + Audio calls | ✅ Done (ExpertDashboard + Appointments) |
| 2.3b Intern Dashboard | Audio + Chat | ✅ Done (InternDashboard + PeerConnect) |
| 2.3c Therapist Dashboard | Audio-only BlackBox sessions | ✅ Done (TherapistDashboardContent) |
| 3.1 Bulk ID Creation | Bulk student creation + grouped by institution | ✅ Done (bulk-add-members + MemberManager groups) |
| 3.2 QR Onboarding | SPOC QR redirect | ✅ Done (generate-spoc-qr + validate-spoc-qr + QRScan) |
| 4.1 AI Transcription | Selective keyword detection + L1/L2/L3 flags | ⚠️ Partial — `ai-transcribe` edge function exists, `enableMonitoring` prop passed, but **escalation trigger snippet storage (10s before/after) is not implemented** |
| 5.1 Multi-Level Escalation | L1→L2→L3 + host swap on L3 | ✅ Done (TherapistDashboardContent escalation logic) |
| 5.2 Emergency Escalation | Notify emergency contact on L3 | ❌ **Missing** — L3 escalation transfers session but does NOT fetch/share emergency contact info |
| 5.3 L3 SPOC Dashboard | L3 reflection in SPOC dashboard | ✅ Done (escalation_requests table + SPOC flags tab) |
| 6.1 Host Position Switch | L3 host swap in BlackBox | ✅ Done (M.Phil expert reassignment) |
| 7.1 Expert Availability | Doctor management | ✅ Done (expert_availability table + ExpertDashboard) |
| 8.1 Color Palette | Notion-based palette | ✅ Done (teal/lavender dark theme) |
| 8.2 BlackBox UI | Smooth connection interface | ✅ Done (queue-based with spinner states) |
| 8.3 Landing Page | Connect button → 3 portals | ✅ Done (Dashboard has Expert/Peer/BlackBox cards) |
| 9.1 School/University Module | Add institutions | ✅ Done (InstitutionManager with `institution_type`) |
| 10.1 Recovery Setup | Hint dropdown + answer word | ✅ Done (RecoverySetup with `Select` dropdown for hints) |
| 10.2 Profile Red Text | Remove extreme red text | ✅ Done (changed to `text-primary`) |
| 11.1 Credit Allotment | Credits only to students | ✅ Done (grant-credits validates student role) |

### Missing Items to Implement

**1. Emergency Contact Sharing on L3 Escalation**
When an L3 escalation happens in TherapistDashboardContent, the system transfers the session to M.Phil expert but does NOT retrieve or display the student's emergency contact. CR §5.2 requires: "On Escalation click by M.Phil Expert, Emergency Contact shared."

**File:** `src/components/therapist/TherapistDashboardContent.tsx`
- After L3 escalation, fetch `user_private` for the student's emergency contact
- Display emergency contact info in a toast/dialog to the escalating therapist
- Also include it in the escalation_request metadata for SPOC visibility

**2. Escalation Trigger Snippet Storage (10s before/after)**
CR §4.1 specifies: "Escalation Trigger Store only: 10 seconds before trigger word, 10 seconds after trigger word. Do NOT store full conversation."

Currently, `ai-transcribe` detects keywords but the escalation_requests table stores full `justification_encrypted` text. The snippet-based storage (±10s audio context) requires:

**File:** `src/components/therapist/TherapistDashboardContent.tsx`  
**Table:** `escalation_requests` already has `trigger_snippet` and `trigger_timestamp` columns
- When submitting an escalation, populate `trigger_snippet` with only the contextual snippet (not full notes)
- When AI flags a keyword, store the timestamp in `trigger_timestamp`

### Technical Details

**Change 1: Emergency Contact on L3 Escalation**

In `TherapistDashboardContent.tsx`, inside the `submitEscalation` function, after the L3 block (around line 317):

```typescript
// After L3 escalation, fetch and display emergency contact
if (level >= 3) {
  const { data: emergencyData } = await supabase
    .from("user_private")
    .select("emergency_name_encrypted, emergency_phone_encrypted, emergency_relation")
    .eq("user_id", activeSession.student_id)
    .single();

  if (emergencyData?.emergency_phone_encrypted) {
    toast.warning("Emergency Contact", {
      description: `${emergencyData.emergency_name_encrypted} (${emergencyData.emergency_relation}): ${emergencyData.emergency_phone_encrypted}`,
      duration: 60000, // Keep visible for 60s
    });
  }
  
  // Also store in escalation_request metadata
  // (already inserting escalation_request above — add metadata)
}
```

This requires a new RLS policy on `user_private` allowing therapist/expert SELECT access during L3 escalation. We'll use the edge function approach instead — fetch via service role in a new edge function to avoid RLS issues.

**Alternative (simpler):** Add the emergency contact fetch in the existing escalation insert block, using the data already available from the service-role context of the escalation_request.

**Change 2: Trigger Snippet Storage**

In the escalation submission, populate the existing `trigger_snippet` and `trigger_timestamp` columns:

```typescript
await supabase.from("escalation_requests").insert({
  spoc_id: spocs[0].id,
  justification_encrypted: escalationReason,
  trigger_snippet: escalationReason.substring(0, 500), // Context snippet only
  trigger_timestamp: new Date().toISOString(),
  status: level >= 3 ? "critical" : "pending",
});
```

### Database Changes

**New RLS policy** on `user_private` for therapist emergency contact access during escalation:
- Create an edge function `get-emergency-contact` that accepts a `student_id` and `session_id`, validates the caller is the therapist on that session, and returns the emergency contact info using service role.

### Files to Edit

| # | File | Change |
|---|------|--------|
| 1 | `src/components/therapist/TherapistDashboardContent.tsx` | Add emergency contact fetch+display on L3 escalation, populate trigger_snippet/trigger_timestamp |
| 2 | `supabase/functions/get-emergency-contact/index.ts` | New edge function to securely fetch emergency contact for L3 escalation |

### Summary
2 gaps remain from CR v1.8. Both involve the L3 escalation flow: (1) emergency contact sharing and (2) trigger snippet storage. Everything else — Student IDs, BlackBox audio-only, role dashboards, QR onboarding, credit allocation, recovery setup, profile text, institution management — is already implemented.

