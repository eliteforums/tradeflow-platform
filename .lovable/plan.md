

## Plan: Enforce System Behavior Rules — No Full Recording, ±10s Snippets, Logged/Timestamped/Role-Based Escalations

### Current State Assessment

**Already working correctly:**
- `useAudioMonitor` rolling buffer purges every 30s, `captureEscalationSnippet` captures ±10s and purges buffer — no full recording stored
- `escalate-emergency` edge function: logs to `audit_logs`, timestamps via `trigger_timestamp`, verifies caller role
- `ai-transcribe` edge function: only stores snippet around detected keywords, not full transcript
- All escalation paths (`TherapistDashboardContent`, `ExpertL3AlertPanel`, `InternDashboardContent`, `ExpertDashboardContent`) use role-verified edge functions

**Gaps found:**
1. **`ai-transcribe` overwrites `escalation_history` instead of appending** — line 123 sets it to a single-element array, losing previous entries
2. **`ai-transcribe` does not log to `audit_logs`** — AI-triggered escalations (L2+) are unaudited
3. **`TherapistSessionControls` "End & Refund" is not audit-logged** — therapist ends session + refunds without any audit trail
4. **Peer session flag via `usePeerConnect.flagSession`** — no audit log when intern flags a session directly (outside `escalate-emergency`)

### Changes

#### 1. `supabase/functions/ai-transcribe/index.ts` — Append to history + add audit log
- Change `escalation_history` from overwrite to append: fetch existing history first, then push new entry
- Add `audit_logs` insert for AI-triggered L2+ escalations with `action_type: "ai_auto_escalation"`, `target_table`, `target_id`, `metadata` including keywords and flag level
- Actor ID: use a system UUID constant (since AI has no user identity) or the student's ID with a flag

#### 2. `supabase/functions/refund-blackbox-session/index.ts` — Add audit log
- After successful refund, insert audit log with `action_type: "session_refund"`, actor as therapist, target as session ID

#### 3. `src/hooks/usePeerConnect.ts` — Add audit log to `flagSession`
- After updating `peer_sessions.is_flagged`, insert audit log with `action_type: "peer_session_flagged"`, actor as current user

### Files Modified
- `supabase/functions/ai-transcribe/index.ts` — Append escalation history + audit log
- `supabase/functions/refund-blackbox-session/index.ts` — Add audit log on refund
- `src/hooks/usePeerConnect.ts` — Add audit log on peer session flag

