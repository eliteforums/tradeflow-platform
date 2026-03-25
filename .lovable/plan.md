

## System Rules Compliance Audit — Current State

### 1. ECC Transactions: Secure & Traceable

**Already compliant:**
- All spend operations go through `spend-credits` edge function with JWT auth, rate limiting, and audit trail via `credit_transactions` table
- Every transaction has `user_id`, `type`, `notes`, `reference_id`, and `created_at` timestamp — fully traceable
- Refunds have duplicate prevention via `reference_id` check in BlackBox cancel, appointment cancel, and the `refund-blackbox-session` edge function (`refunded` boolean)
- Purchase flow uses Razorpay server-side verification in `purchase-credits` edge function

**Gap found — Race condition in `spend-credits`:**
- Lines 52-66: the balance check (`get_credit_balance` RPC) and the insert of the negative transaction are two separate queries — not atomic. Under concurrent requests, a user could double-spend.
- **Fix**: Create a Postgres function `spend_credits_atomic` that checks balance and inserts the transaction in a single `BEGIN...COMMIT` block using `SELECT ... FOR UPDATE` or a CTE approach. Call this function via `supabase.rpc()` instead of the current two-step approach.

### 2. Escalation: Real-time & Reliable

**Already compliant:**
- `escalation_requests` and `notifications` tables have realtime enabled (recent migration)
- `escalate-emergency` edge function: verifies caller role, fetches emergency contact, notifies SPOC + experts, inserts audit log with timestamp
- `ExpertL3AlertPanel` includes `"escalated"` status in its query filter
- `ExpertDashboardContent` has realtime listener for `l3_handoff` notifications
- SPOC dashboard has realtime listener for `escalation_requests` INSERT events

**No gaps found.**

### 3. AI: Enhance Safety, Not Override Human Decisions

**Already compliant:**
- `ai-transcribe` edge function: returns `suggestion` object but does NOT create `escalation_requests` (lines 199-200 explicitly note this)
- `AISuggestionPopup` component: shows AI analysis with Dismiss/Escalate buttons — human decides
- Audit log records `suggestion_only: true` for AI detections
- Auto-dismiss after 30 seconds with countdown

**No gaps found.**

### Summary

Only one fix needed: the `spend-credits` race condition.

### Changes

#### 1. Database Migration — Create atomic spend function
```sql
CREATE OR REPLACE FUNCTION public.spend_credits_atomic(
  _user_id uuid,
  _amount integer,
  _notes text DEFAULT 'Service usage',
  _reference_id uuid DEFAULT NULL
)
RETURNS TABLE(success boolean, remaining integer, source text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _balance integer;
  _pool_balance integer;
  _inst_id uuid;
BEGIN
  -- Lock user's transactions to prevent concurrent spend
  PERFORM 1 FROM credit_transactions WHERE user_id = _user_id FOR UPDATE;
  
  SELECT COALESCE(SUM(delta), 0)::integer INTO _balance
  FROM credit_transactions WHERE user_id = _user_id;
  
  IF _balance >= _amount THEN
    INSERT INTO credit_transactions (user_id, delta, type, notes, reference_id)
    VALUES (_user_id, -_amount, 'spend', _notes, _reference_id);
    RETURN QUERY SELECT true, (_balance - _amount)::integer, 'balance'::text;
    RETURN;
  END IF;
  
  -- Check stability pool
  SELECT institution_id INTO _inst_id FROM profiles WHERE id = _user_id;
  IF _inst_id IS NOT NULL THEN
    SELECT COALESCE(balance, 0) INTO _pool_balance
    FROM ecc_stability_pool WHERE institution_id = _inst_id FOR UPDATE;
    
    IF _pool_balance >= _amount THEN
      UPDATE ecc_stability_pool
      SET balance = balance - _amount, total_disbursed = total_disbursed + _amount
      WHERE institution_id = _inst_id;
      
      INSERT INTO credit_transactions (user_id, delta, type, notes, reference_id, institution_id)
      VALUES (_user_id, -_amount, 'spend', _notes || ' (from stability pool)', _reference_id, _inst_id);
      
      RETURN QUERY SELECT true, 0, 'pool'::text;
      RETURN;
    END IF;
  END IF;
  
  RETURN QUERY SELECT false, _balance, 'insufficient'::text;
END;
$$;
```

#### 2. `supabase/functions/spend-credits/index.ts` — Use atomic RPC
- Replace the two-step balance check + insert with a single `supabase.rpc("spend_credits_atomic", { ... })` call
- Simplify the function significantly — remove the manual pool logic (now in Postgres)
- Also fixes the `total_disbursed` bug (line 87 currently sets it to `poolBalance` instead of incrementing)

### Files Modified
- Database migration — `spend_credits_atomic` function
- `supabase/functions/spend-credits/index.ts` — Use atomic RPC

