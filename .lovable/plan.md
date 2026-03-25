

## Plan: Fix Intern Escalation → SPOC & BlackBox Therapist → Expert Notification

### Bug 4.1: Intern Escalation — Emergency Contact Not Reaching SPOC

**Root Cause**: The `escalate-emergency` edge function works correctly — it fetches emergency contact, creates `escalation_requests` with `trigger_snippet` JSON containing `type: "emergency_contact"`, and notifies the SPOC. The SPOC dashboard has a realtime listener on `escalation_requests` INSERT events and parses `trigger_snippet` for the contact card.

However, the SPOC realtime listener filters by `newEsc.spoc_id === user?.id`. The edge function looks up the SPOC by querying profiles with `role = "spoc"` — but the `profiles.role` column stores the `app_role` enum which uses the `user_roles` table pattern. The SPOC lookup in `escalate-emergency` line 157 does `eq("role", "spoc")` on the `profiles` table, which should work since profiles have the role column.

**Actual bug**: The edge function falls back to `spocId = callerId` (line 153) if no SPOC is found. If the intern's institution has no SPOC profile, the escalation's `spoc_id` is set to the intern's own ID — so the SPOC never sees it.

Also, `escalation_requests` table doesn't have `realtime` enabled in the publication, which would prevent the realtime listener from firing.

**Fix**:
- Enable realtime on `escalation_requests` table via migration: `ALTER PUBLICATION supabase_realtime ADD TABLE public.escalation_requests;`
- In `escalate-emergency/index.ts`: also check `user_roles` table for SPOC role (since roles are in `user_roles`, not just `profiles.role`)
- Add a fallback: if no SPOC found, also notify admins

### Bug 4.2: BlackBox Therapist Escalation — Expert Not Notified

**Root Cause**: The therapist's `submitEscalation` (TherapistDashboardContent line 339-415) for L3:
1. Searches for an M.Phil expert via `profiles` table with `ilike("specialty", "%M.Phil%")`
2. If found: reassigns `therapist_id`, inserts notification with type `l3_handoff`
3. If NOT found: just sets `status: "escalated"` — no notification at all

The `ExpertL3AlertPanel` listens for `blackbox_sessions` with `flag_level >= 3` via realtime — BUT the therapist sets `status: "escalated"` which is NOT in the panel's filter `["active", "accepted", "queued"]` (line 53). So when no M.Phil expert is found, the session disappears from the expert view.

Even when an M.Phil expert IS found, the notification is inserted but there's no notification listener on the expert dashboard that would alert them to check. The `ExpertL3AlertPanel` only watches `blackbox_sessions` table changes — it will pick up the session IF `status` remains `"active"` AND `flag_level >= 3`, which the therapist does set correctly in the success case.

**Actual bugs**:
1. When M.Phil expert found: `therapist_id` is changed but `flag_level` is set in the same update — the realtime listener should catch this. However, the `l3_handoff` notification is not listened for anywhere on the expert dashboard.
2. When no M.Phil expert found: status becomes `"escalated"` which is filtered OUT of the L3 panel query. No expert sees it.
3. The `notifications` table may not have realtime enabled either.

**Fix**:
- Enable realtime on `notifications` table via migration
- In `ExpertL3AlertPanel`: also include `"escalated"` status in the query filter so experts can see sessions that need attention even if no specific expert was assigned
- Add a notification listener to `ExpertDashboardContent` that shows a prominent alert for `l3_handoff` type notifications
- In `TherapistDashboardContent`: when no M.Phil expert is found, notify ALL active experts (not just skip notification)

### Changes

#### 1. Database Migration — Enable realtime
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.escalation_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
```

#### 2. `supabase/functions/escalate-emergency/index.ts` — Fix SPOC lookup
- Query `user_roles` table for users with `spoc` role in the student's institution, instead of relying on `profiles.role`
- If no SPOC found, notify all admins as fallback

#### 3. `src/components/expert/ExpertL3AlertPanel.tsx` — Include "escalated" status
- Change query filter from `["active", "accepted", "queued"]` to `["active", "accepted", "queued", "escalated"]`
- Same change in the realtime callback condition

#### 4. `src/components/therapist/TherapistDashboardContent.tsx` — Notify all experts when no M.Phil found
- When no M.Phil expert is available for L3: keep status as `"active"` (not `"escalated"`) so it appears in expert panels
- Notify ALL active experts via `notifications` table insert

#### 5. `src/components/expert/ExpertDashboardContent.tsx` — Add notification listener for L3 handoffs
- Subscribe to `notifications` table realtime for the current user
- When a `l3_handoff` notification arrives, show a prominent toast with session details and auto-switch to the home tab where `ExpertL3AlertPanel` is rendered

### Files Modified
- Database migration — Enable realtime on `escalation_requests` and `notifications`
- `supabase/functions/escalate-emergency/index.ts` — Fix SPOC lookup via `user_roles`
- `src/components/expert/ExpertL3AlertPanel.tsx` — Include `"escalated"` in status filter
- `src/components/therapist/TherapistDashboardContent.tsx` — Notify all experts on L3 when no M.Phil available
- `src/components/expert/ExpertDashboardContent.tsx` — Add realtime notification listener for `l3_handoff`

