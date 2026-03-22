

## Plan: TechSpec v2-32 Compliance — Remaining Gaps

### Gap Analysis

After thorough review of TechSpec v2-32 against every relevant file in the codebase, here is the precise status. Most of v2-32 is implemented. The remaining gaps fall into three categories: **SELECT * queries that violate §13.1**, **missing `select()` column specificity in several components**, and **training status ENUM alignment**.

| # | Gap | TechSpec Section | Current State |
|---|-----|------------------|---------------|
| 1 | TherapistDashboardContent uses `select("*")` on 4 queries | §13.1 | Fetches all columns from `blackbox_sessions` — wasteful at scale |
| 2 | InternDashboardContent uses `select("*")` on training_modules | §13.1 | Fetches all columns; should specify needed fields |
| 3 | ExpertDashboardContent uses `select("*")` on expert_availability | §13.1 | Same issue |
| 4 | SPOCDashboardContent uses `select("*")` on institutions + blackbox_entries | §13.1 | Same issue |
| 5 | useAdmin uses `select("*")` on profiles, institutions, blackbox_entries | §13.1 | Same issue |
| 6 | useSoundTherapy uses `select("*")` on sound_content | §13.1 | Same issue |
| 7 | useQuests uses `select("*")` on quest_cards + quest_completions | §13.1 | Same issue |
| 8 | useBlackBoxSession uses `select("*")` on blackbox_sessions | §13.1 | Same issue |
| 9 | Profile pages use `select("*")` on user_private | §13.1 | Acceptable — user needs all their own private data |
| 10 | Training status values not aligned with TechSpec §19 ENUM | §19 | TechSpec defines: NOT_STARTED, IN_PROGRESS, ASSESSMENT_PENDING, FAILED, INTERVIEW_PENDING, ACTIVE. Code uses lowercase versions which is fine, but the intern dashboard doesn't handle all states properly |
| 11 | Intern escalation doesn't populate `trigger_snippet` and `trigger_timestamp` | §18/CR v1.8 | InternDashboardContent's `submitEscalation` doesn't set these fields |
| 12 | No `audit_logs` entry on escalation events | §14.2 | Escalation protocol requires immutable audit log entries |
| 13 | Therapist queue fetch doesn't limit results | §13.1 | `fetchQueue` has no `.limit()` — unbounded query |

### Changes

**1. Fix all `select("*")` queries across components** (§13.1 compliance)
Replace `select("*")` with column-specific selects in:
- `TherapistDashboardContent.tsx` — 4 queries on `blackbox_sessions`
- `InternDashboardContent.tsx` — training_modules query
- `ExpertDashboardContent.tsx` — expert_availability query
- `SPOCDashboardContent.tsx` — institutions + blackbox_entries queries
- `useAdmin.ts` — profiles, institutions, blackbox_entries queries
- `useSoundTherapy.ts` — sound_content query
- `useQuests.ts` — quest_cards + quest_completions queries
- `useBlackBoxSession.ts` — blackbox_sessions query

**2. Fix intern escalation to include trigger_snippet/trigger_timestamp**
In `InternDashboardContent.tsx`, the `submitEscalation` mutation inserts into `escalation_requests` but doesn't set `trigger_snippet`, `trigger_timestamp`, or `escalation_level`.

**3. Add audit_logs entries on escalation events**
Both therapist and intern escalation flows should insert an audit log entry per §14.2.

**4. Add limit to therapist queue fetch**
`fetchQueue` in TherapistDashboardContent should have `.limit(50)` to prevent unbounded queries.

### Technical Details

**SELECT * Replacement Pattern:**
Each query gets explicit column names matching what the component actually uses. Example for TherapistDashboardContent queue:
```typescript
// Before
.select("*")
// After
.select("id, student_id, status, flag_level, created_at, room_id, therapist_id, escalation_history, escalation_reason, started_at, ended_at, session_notes_encrypted")
```

**Intern Escalation Fix:**
```typescript
await supabase.from("escalation_requests").insert({
  spoc_id: spocId,
  justification_encrypted: escalationReason,
  session_id: escalationDialog.sessionId || null,
  entry_id: null,
  trigger_snippet: escalationReason.substring(0, 500),
  trigger_timestamp: new Date().toISOString(),
  escalation_level: 1,
});
```

**Audit Log Entry on Escalation:**
```typescript
await supabase.from("audit_logs").insert({
  actor_id: user.id,
  action_type: "escalation_submitted",
  target_table: "escalation_requests",
  target_id: escalationDialog.sessionId || null,
  metadata: { level: 1, reason_length: escalationReason.length },
});
```

### Files to Edit

| # | File | Change |
|---|------|--------|
| 1 | `src/components/therapist/TherapistDashboardContent.tsx` | Replace 4× `select("*")` with column-specific; add `.limit(50)` to queue; add audit_log on escalation |
| 2 | `src/components/intern/InternDashboardContent.tsx` | Replace `select("*")` on training_modules; fix escalation insert to include trigger fields + audit log |
| 3 | `src/components/expert/ExpertDashboardContent.tsx` | Replace `select("*")` on expert_availability |
| 4 | `src/components/spoc/SPOCDashboardContent.tsx` | Replace `select("*")` on institutions + blackbox_entries |
| 5 | `src/hooks/useAdmin.ts` | Replace `select("*")` on profiles, institutions, blackbox_entries |
| 6 | `src/hooks/useSoundTherapy.ts` | Replace `select("*")` with specific columns |
| 7 | `src/hooks/useQuests.ts` | Replace `select("*")` with specific columns |
| 8 | `src/hooks/useBlackBoxSession.ts` | Replace `select("*")` with specific columns |

### Summary
The codebase is feature-complete against TechSpec v2-32. The remaining issues are: (1) 17 `select("*")` queries that violate §13.1 column specificity requirements — these waste bandwidth at scale; (2) incomplete escalation metadata in the intern flow; (3) missing audit log entries on escalation events per §14.2; (4) unbounded queue fetch in therapist dashboard. No new features or database changes needed — purely query optimization, compliance metadata, and audit trail completeness.

