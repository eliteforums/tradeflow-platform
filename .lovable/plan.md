

## Fix: AI Transcribe Escalation Not Reaching Experts

### Root Cause

The `ai-transcribe` edge function updates `blackbox_sessions.flag_level` to 3 when critical risk is detected, but it **never changes the session `status`**. It stays as `"active"`.

The expert RLS policy on `blackbox_sessions` only allows experts to see sessions where:
- `status = 'queued'` OR `therapist_id = auth.uid()`

So when a session has `status = 'active'` and `flag_level = 3`, the expert **cannot read it** due to RLS. The `ExpertL3AlertPanel` query returns empty. Realtime events are also filtered by RLS, so the subscription never fires either.

### Fix (3 changes)

**1. Update `ai-transcribe` edge function** — when `flag_level >= 3`, also set `status = 'escalated'`

In `supabase/functions/ai-transcribe/index.ts`, change the blackbox_sessions update (around line 238) to include `status: 'escalated'` when flag_level >= 3.

**2. Update RLS policies on `blackbox_sessions`** — allow experts/therapists/interns to SELECT and UPDATE sessions with `status = 'escalated'`

Migration SQL:
```sql
-- Drop and recreate expert SELECT policy
DROP POLICY "Experts can view blackbox sessions" ON public.blackbox_sessions;
CREATE POLICY "Experts can view blackbox sessions" ON public.blackbox_sessions
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'expert'::app_role) AND (
      status = 'queued' OR status = 'escalated' OR therapist_id = auth.uid()
    )
  );

-- Drop and recreate expert UPDATE policy
DROP POLICY "Experts can update blackbox sessions" ON public.blackbox_sessions;
CREATE POLICY "Experts can update blackbox sessions" ON public.blackbox_sessions
  FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'expert'::app_role) AND (
      status = 'queued' OR status = 'escalated' OR therapist_id = auth.uid()
    )
  );

-- Same for therapists
DROP POLICY "Therapists can view blackbox sessions" ON public.blackbox_sessions;
CREATE POLICY "Therapists can view blackbox sessions" ON public.blackbox_sessions
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'therapist'::app_role) AND (
      status = 'queued' OR status = 'escalated' OR therapist_id = auth.uid()
    )
  );

DROP POLICY "Therapists can update blackbox sessions" ON public.blackbox_sessions;
CREATE POLICY "Therapists can update blackbox sessions" ON public.blackbox_sessions
  FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'therapist'::app_role) AND (
      status = 'queued' OR status = 'escalated' OR therapist_id = auth.uid()
    )
  );

-- Same for interns
DROP POLICY "Interns can view blackbox sessions" ON public.blackbox_sessions;
CREATE POLICY "Interns can view blackbox sessions" ON public.blackbox_sessions
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'intern'::app_role) AND (
      status = 'queued' OR status = 'escalated' OR therapist_id = auth.uid()
    )
  );

DROP POLICY "Interns can update blackbox sessions" ON public.blackbox_sessions;
CREATE POLICY "Interns can update blackbox sessions" ON public.blackbox_sessions
  FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'intern'::app_role) AND (
      status = 'queued' OR status = 'escalated' OR therapist_id = auth.uid()
    )
  );
```

**3. Redeploy `ai-transcribe` edge function**

### Files Modified
- `supabase/functions/ai-transcribe/index.ts` — add `status: 'escalated'` when flag_level >= 3
- Database migration — update 6 RLS policies to include `status = 'escalated'`

### Why This Fixes It
1. AI detects L3 → sets `flag_level = 3` AND `status = 'escalated'`
2. RLS now allows experts to see `status = 'escalated'` sessions
3. Realtime subscription in `ExpertL3AlertPanel` fires because the row is now visible
4. Expert sees the alert banner with "Claim & Join Call" button

