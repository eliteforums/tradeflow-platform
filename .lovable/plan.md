

## Fix: Escalation Flow — 3 Remaining Issues

### 3.1 Expert In-Call Escalation Button Missing

**Root cause**: `ExpertDashboardContent.tsx` line 879 renders `VideoCallModal` without passing `onEscalate`. The escalation button in `MeetingControls` only renders when `onEscalate` is provided.

**Fix**: Pass `onEscalate` to the `VideoCallModal` on line 879 that opens the escalation dialog for the current appointment.

**File**: `src/components/expert/ExpertDashboardContent.tsx`

---

### 3.2 Therapist L3 Escalation Sends Raw Text to SPOC

**Root cause**: When a therapist escalates L3 in `TherapistDashboardContent.tsx` (line 305), the `trigger_snippet` is set to plain text (`escalationReason`) — not structured JSON. The SPOC dashboard tries to `JSON.parse()` this, fails, and falls back to raw text display. Meanwhile, the `escalate-emergency` edge function builds proper structured JSON with student ID, session type, emergency contact, etc. — but the therapist code doesn't call this function.

**Fix**: Replace the therapist's direct `escalation_requests` insert (lines 299-313) with a call to `supabase.functions.invoke("escalate-emergency", { body: { session_id, justification, transcript_snippet } })`. This ensures the SPOC receives structured data with student ID, emergency contact, session details, and escalator role — identical to what expert/intern escalations produce.

**File**: `src/components/therapist/TherapistDashboardContent.tsx`

---

### 3.3 "Claimed by Another Expert" False Positive

**Root cause (two issues)**:

1. The `claim-l3-session` edge function query (line 62-69) fetches the session with `.gte("flag_level", 3).single()` but does NOT filter by status. If the session status has already changed (e.g., therapist sets it to `"escalated"` then claim changes it to `"active"`), subsequent realtime updates may deliver stale `escalation_history` arrays from intermediate states.

2. More critically: the `ExpertL3AlertPanel` realtime channel listens for ALL `blackbox_sessions` changes (line 66). When the `claim-l3-session` function writes `expert_joined` + `expert_claimed` entries, the realtime payload delivers the updated session. For the claiming expert, `claim.byMe` should be `true`. But `isActiveByMe` on line 194 checks `activeSession?.id === session.id || claim.byMe` — if `activeSession` was cleared (e.g., modal closed), `claim.byMe` is the only check, which depends on `claimEntry.expert_id === user?.id`. This should work IF the expert ID matches.

   The actual bug: if `escalation_history` arrives as a JSON string (not parsed array) from the realtime payload, `Array.isArray()` returns `false`, history becomes `[]`, and the function returns `{claimed: false}`. But then the session's `status` was changed to `"active"` by the claim, so the L3 panel query may not re-fetch it (it filters `in("status", ["active", "accepted", "queued", "escalated"])` — `"active"` IS included, so it should appear).

   The most likely scenario: **the realtime payload's `escalation_history` is a string, not a parsed JSON array**. Supabase realtime delivers JSONB columns as strings in some cases. `Array.isArray(stringValue)` = `false`, so `history` = `[]`, `claimEntry` = `undefined`, `claimed` = `false`. The session still shows "Join Call" even after claiming — which is the opposite of the reported bug.

   Re-examining: if the DB default is `'[]'::jsonb` and the therapist writes `[{level:3, reason, timestamp}]`, and then claim writes `[..., {type:"expert_joined"}, {type:"expert_claimed"}]`, the realtime payload should have a 3-element array. If it's properly parsed, `find(type === "expert_claimed")` returns the claim entry. For another expert viewing, `claimEntry.expert_id !== user?.id` = `true`, showing "Claimed by another expert". For the first (only) expert, `byMe` = `true`.

   **The real bug**: When NO expert has claimed yet, `escalation_history` is `[{level:3, reason, timestamp}]`. The `find` for `type === "expert_claimed"` returns `undefined`. So `claimed = false`, and "Join Call" shows. This is correct behavior.

   Unless: the realtime payload contains the full session object but with `escalation_history` as a stringified JSON (`"[{...}]"` instead of `[{...}]`). Then `Array.isArray("[{...}]")` = false, `history = []`, and since there's no claim entry, it returns `{claimed: false}`. Still shows "Join Call". So the L3 panel should work.

   **Wait — re-reading the user's report**: "Shows: Claimed by another expert, No Join Call button". This means `claim.byOther` is `true`. For this to happen, there MUST be an `expert_claimed` entry with a different `expert_id`. This can only happen if:
   - A previous claim attempt left a stale entry
   - OR the therapist's history entry `{level, reason, timestamp}` somehow passes the `entry.type === "expert_claimed"` check — which it can't since it has no `type` field

   **Most likely cause**: A previous test/attempt left `expert_claimed` entries in the `escalation_history` of test sessions. When those sessions are still active/escalated, they show as claimed.

   **Defensive fix**: Harden `getClaimStatus` to validate entry shape more strictly, and ensure string parsing of realtime `escalation_history`.

**Fixes**:
1. In `getClaimStatus`, add string-to-JSON parsing for `escalation_history` (in case realtime delivers it as a string)
2. Add status filter to `claim-l3-session` edge function query
3. In `ExpertL3AlertPanel`, ensure `isActiveByMe` logic doesn't break when `activeSession` is null

**Files**: `src/components/expert/ExpertL3AlertPanel.tsx`, `supabase/functions/claim-l3-session/index.ts`

---

### Summary of Changes

| File | Change |
|------|--------|
| `src/components/expert/ExpertDashboardContent.tsx` | Pass `onEscalate` to VideoCallModal for in-call escalation |
| `src/components/therapist/TherapistDashboardContent.tsx` | Replace direct `escalation_requests` insert with `escalate-emergency` edge function call for L3 |
| `src/components/expert/ExpertL3AlertPanel.tsx` | Harden `getClaimStatus` to parse string escalation_history; defensive null checks |
| `supabase/functions/claim-l3-session/index.ts` | Add status filter to session query |

### Technical Detail

The therapist L3 escalation currently does two DB writes (lines 270-278 and 330-338) plus a direct `escalation_requests` insert. The fix replaces the direct insert with the `escalate-emergency` edge function, which automatically:
- Fetches student profile + emergency contact
- Builds structured `trigger_snippet` JSON
- Tags the escalator's role
- Notifies SPOC with full context

The duplicate expert notification (lines 340-362) can stay since `escalate-emergency` also notifies experts for L3 — we'll de-duplicate by removing the therapist-side expert notification (the edge function handles it).

