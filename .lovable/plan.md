

## Plan: ECC System Core Update — Gaps Analysis & Fixes

### What Already Works

| Feature | Status |
|---|---|
| **2.1 Purchasing** | Razorpay integration exists (`purchase-credits` edge function + `usePurchaseCredits` hook). Supports 4 packages. |
| **2.2 Usage** | BlackBox charges 30 ECC via `spend-credits` edge function. Expert Connect charges via `spendCredits()`. Peer Connect charges 20 ECC. |
| **2.3 Earning** | `useEccEarn` hook with 5 ECC/day cap. Activities: quests, wreck buddy, tibetan bowl, sound therapy. |
| **2.4 Refund (BlackBox)** | `refund-blackbox-session` edge function refunds 30 ECC, marks `refunded: true`, audit logged. Silence auto-end triggers refund. |
| **2.4 Refund (Peer decline)** | Intern decline refunds 20 ECC to student. |

### Gaps Found

1. **No GPay/UPI support** — Razorpay already supports GPay and UPI natively via checkout.js. No code change needed; these are configured in the Razorpay dashboard. However, `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` secrets are **missing** from the project.

2. **BlackBox cancel has no refund** — `cancelSession()` in `useBlackBoxSession.ts` sets status to "cancelled" but does NOT refund the 30 ECC. Student loses credits if they cancel while queued.

3. **Appointment cancel has no refund** — `cancelAppointment()` in `useAppointments.ts` sets status to "cancelled" but does NOT refund `credits_charged`. Student loses credits.

4. **Peer Connect expiry has no refund** — UI text says "20 ECC will be refunded if request expires" but there is no actual refund logic when a pending session expires.

5. **No duplicate refund prevention for Peer/Appointments** — BlackBox has `refunded` boolean column; Peer and Appointments do not.

6. **Expert/therapist cancellation has no refund path** — If an expert cancels a confirmed appointment, no refund occurs.

### Changes

#### 1. `src/hooks/useBlackBoxSession.ts` — Refund on student cancel (queued only)
- In `cancelSession`: if status is "queued" (therapist hasn't started), insert a +30 ECC `grant` transaction with note "BlackBox session cancelled — refund" and `reference_id: session.id`
- If status is "accepted" or "active" (session started), no refund (service was consumed)
- Invalidate credit queries + `refreshCredits()`

#### 2. `src/hooks/useAppointments.ts` — Refund on appointment cancel
- In `cancelAppointment`: fetch the appointment to get `credits_charged` and `status`
- If `credits_charged > 0` and status is "pending" or "confirmed" (not yet completed), insert a refund transaction (+credits_charged, type "grant", note "Expert Connect cancelled — refund")
- Invalidate credit queries + `refreshCredits()`

#### 3. `src/hooks/usePeerConnect.ts` — Refund on pending session expiry
- Add an `expireSession` mutation that checks if a pending session is past 2 minutes
- If expired: update status to "completed", refund 20 ECC to student with `reference_id`
- Wire this to the existing expiry detection in the UI (the countdown timer component)
- Also add refund to `endSession` if the session never became "active" (intern never joined)

#### 4. Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` secrets
- Use `add_secret` tool to prompt user for Razorpay credentials
- GPay/UPI will work automatically once Razorpay is configured (it's a Razorpay dashboard setting, not a code change)

#### 5. Duplicate refund prevention
- For BlackBox: already has `refunded` column — check it before refunding in `cancelSession`
- For Peer/Appointments: before inserting refund transaction, check if a `grant` transaction with the same `reference_id` already exists. If yes, skip refund.

### Files Modified
- `src/hooks/useBlackBoxSession.ts` — Add refund logic to `cancelSession`
- `src/hooks/useAppointments.ts` — Add refund logic to `cancelAppointment`
- `src/hooks/usePeerConnect.ts` — Add `expireSession` with refund + refund on early end

### No Database Changes Required
All refunds use existing `credit_transactions` table with type "grant". Duplicate prevention via `reference_id` lookup.

