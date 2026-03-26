
Goal: Fix only the Escalation + AI Transcription pipeline (no unrelated module changes), aligned to PRD §18 and §19.1.

What is still broken (from code + PRD gap analysis):
1) L3 handoff is not reliable:
- `ai-transcribe` can mark sessions escalated, but expert claim logic in `ExpertL3AlertPanel` blocks takeover when `therapist_id` is already set.
- This breaks “live replacement” required by PRD (same room, moderator handoff).

2) Session continuity risk:
- Student call flow treats `status = escalated` as terminal in `useBlackBoxSession`, which can drop the student connection during escalation (PRD requires continuity).

3) Transcribe/escalation persistence is inconsistent:
- `ai-transcribe` updates session flags/history but does not create a robust, deduplicated escalation record/notification flow for AI-triggered L3.
- Repeated classifications can create noisy/duplicate events.

4) `useAudioMonitor` reliability issues:
- On invoke error path, `isProcessing` can remain stuck true.
- Callback dependencies are incomplete (stale `sessionType` risk).
- Snippet capture logic is not aligned to PRD’s trigger-window behavior.

Implementation plan (scoped only to escalation/transcribe):
1) Harden `ai-transcribe` as the single source of truth for AI-triggered escalation
- File: `supabase/functions/ai-transcribe/index.ts`
- Changes:
  - Keep `status` as continuity-safe for active calls (do not force a value that drops student call state).
  - Persist PRD-required trigger metadata for L3: trigger timestamp + bounded trigger snippet.
  - Add dedupe guard (cooldown / “already escalated” check) so 15s polling doesn’t spam escalation writes.
  - Create/update escalation record for L3 in `escalation_requests` (critical status) with trigger fields.
  - Emit one-time notifications for expert alerting per escalation event.
  - Keep audit log insertions, but avoid duplicate inserts for same escalation window.

2) Make expert takeover (host replacement) actually claimable for L3 sessions
- File: `src/components/expert/ExpertL3AlertPanel.tsx`
- Changes:
  - Update claim update-filter logic so expert can claim L3 sessions even if another moderator is currently assigned.
  - Enforce single-claim behavior (first successful claim wins), with clear “already claimed” UX.
  - Keep room_id unchanged during claim to preserve student connection (PRD §18).

3) Adjust RLS so experts can see/update active L3 sessions without broadening unrelated access
- New migration: `supabase/migrations/<new>.sql`
- Changes:
  - Update blackbox session expert/therapist/intern policies to include controlled L3 access on active sessions (via `flag_level >= 3` + status scope), not just queued/escalated/owned rows.
  - Preserve existing least-privilege behavior outside L3 paths.

4) Fix transcription monitor runtime reliability
- File: `src/hooks/useAudioMonitor.ts`
- Changes:
  - Ensure `isProcessing` always resets on function error return paths.
  - Fix stale callback dependencies (`sessionType`, etc.).
  - Add in-flight guard to prevent overlapping classify calls.
  - Tighten snippet capture helper behavior to match escalation trigger capture intent.

5) Ensure continuity behavior during escalation
- File: `src/hooks/useBlackBoxSession.ts` (only if needed based on final status strategy)
- Changes:
  - Keep session connected through L3 handoff state so student is not dropped mid-transfer.
  - Do not reset call state/token during legitimate escalation transfer state.

PRD alignment after fix:
- “Only L3 triggers live escalation”: enforced in AI handoff path.
- “Room ID unchanged”: preserved during expert claim.
- “Escalation trigger metadata stored”: timestamp + trigger snippet persisted for L3.
- “Selective transcription”: only escalation-worthy segments are persisted with dedupe, reducing noise.

Validation plan (end-to-end, mandatory):
1) BlackBox live session → speak high-risk phrases → confirm `ai-transcribe` sets L3 once (no spam duplicates).
2) Expert dashboard receives L3 alert and can claim session even when therapist was assigned.
3) Student remains connected in same room during handoff.
4) Previous moderator loses active ownership after claim.
5) `escalation_requests` gets a critical L3 record with trigger timestamp/snippet.
6) Repeat high-risk speech within cooldown does not create duplicate escalation notifications/records.

Files in scope:
- `supabase/functions/ai-transcribe/index.ts`
- `src/components/expert/ExpertL3AlertPanel.tsx`
- `src/hooks/useAudioMonitor.ts`
- `src/hooks/useBlackBoxSession.ts` (continuity safeguard, if needed)
- `supabase/migrations/<new_l3_rls_fix>.sql`

Out of scope (as requested):
- Payments, onboarding, admin member flows, non-escalation UI modules, unrelated dashboard features.
