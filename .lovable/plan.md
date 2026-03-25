

## Plan: Align ECC Payment Packages (Frontend ↔ Backend)

### Problem
The payment gateway is already fully implemented with Razorpay (order creation, HMAC verification, server-side crediting, UPI/GPay/cards support). However, the frontend package definitions (25/60/130 credits) don't match the backend's accepted packages (50/100/250/500 credits), causing every purchase to fail with "Invalid package."

### Fix
Sync both sides to use the same package set. Use the frontend's pricing as the source of truth since it reflects the intended user-facing tiers.

#### 1. `supabase/functions/purchase-credits/index.ts` — Update PACKAGES map
Replace the backend packages (lines 9-14) to match the frontend:
```
25 → ₹49 (4900 paise)
60 → ₹99 (9900 paise)
130 → ₹199 (19900 paise)
```

#### 2. Idempotency guard — Prevent double crediting
Add a check before inserting credit transaction: query `credit_transactions` for an existing row with the same Razorpay payment ID in the notes field. If found, return success without inserting again.

### Files Modified
- `supabase/functions/purchase-credits/index.ts` — Align package map + add idempotency check

### No database changes needed
Everything else (order creation, signature verification, Razorpay checkout UI with UPI/GPay, failure handling) is already working correctly.

