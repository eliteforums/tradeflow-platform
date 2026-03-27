

## Fix: ECC Burning Logic — Deduct on Join, Not on Request

### Current Problems

**BlackBox Sessions (`useBlackBoxSession.ts`)**
- ECC is deducted at **request time** (line 230-236, during `requestSession`) — before any therapist accepts or student joins
- Cancel while queued gives a refund — correct per new rules (session not started)
- Cancel after joining still refunds if status is "queued" — **wrong**, should NOT refund once joined
- Therapist-initiated refund (`refund-blackbox-session` edge function) refunds regardless of join state — needs to check if student actually joined

**Appointments (`useAppointments.ts`)**
- ECC deducted at **booking time** (line 100) — should be deducted when session actually starts (join event)
- Cancel refunds if status is pending/confirmed — **correct** per new rules (session not started)
- No logic to deduct on join exists

**Peer Connect (`usePeerConnect.ts`)**
- ECC deducted at **request time** (line 309) — should be deducted when session becomes active (intern accepts)
- Decline by intern refunds 18 ECC — **correct** (session never started)
- End session refunds if pending — **correct**
- No protection against refund after active session

### Changes

**1. `src/hooks/useBlackBoxSession.ts`**
- **Move ECC deduction from `requestSession` to `onCallJoined`**: Remove `spendCredits` call from `requestSession`. Instead, call `spendCredits` inside `onCallJoined` (when student actually joins the video call). Store cost in `sessionCostRef` for reference.
- **`cancelSession`**: Refund ONLY if `student_joined_at` is null (session was never joined). If student joined, no refund regardless of status.
- **`endSession`**: Never refund — student joined and session ran.

**2. `supabase/functions/refund-blackbox-session/index.ts`**
- Add check: only refund if `session.student_joined_at` is null. If student joined, deny refund with error "Student already joined — no refund eligible".

**3. `src/hooks/useAppointments.ts`**
- **Remove `spendCredits` from `bookAppointment`**: Booking should NOT deduct ECC. Store `creditCost` on the appointment row (already done via `credits_charged`).
- **Add deduction on session join**: This happens in the video call flow. Add a new `deductOnJoin` mutation that calls `spendCredits` when the student joins the appointment video call. This should be called from the appointment video call join handler.
- **`cancelAppointment`**: Refund ONLY if the appointment has NOT been joined (no `completed_at` and status is pending/confirmed). This is already correct since deduction won't happen until join.

**4. `src/hooks/usePeerConnect.ts`**
- **Move `spendCredits` from `requestSession` to `acceptSession`**: Deduct 18 ECC from student when intern accepts (session becomes active = session starts). This is the "join event" for text chat.
- **`declineSession`**: No refund needed anymore since ECC wasn't deducted yet at pending stage. Remove the refund insert.
- **`endSession`**: Remove refund for pending sessions — ECC wasn't deducted at pending stage, so no refund needed.
- **`expireSession`**: Same — remove refund since no ECC was deducted while pending.

### Summary of New Flow

| Session Type | Deduct When | Refund When | No Refund |
|---|---|---|---|
| BlackBox | Student joins video call (`onCallJoined`) | Session never joined (queued/accepted, student_joined_at=null) | Left mid-call, cancel after join |
| Appointment | Student joins video call | Cancelled before join (pending/confirmed, not yet joined) | Left mid-call, cancel after join |
| Peer Connect | Intern accepts (session goes active) | Intern declines or request expires (never went active) → but no deduction happened, so no refund needed | Left mid-chat, end after active |

### Files
- `src/hooks/useBlackBoxSession.ts`
- `src/hooks/useAppointments.ts`
- `src/hooks/usePeerConnect.ts`
- `supabase/functions/refund-blackbox-session/index.ts`

### No database changes needed

