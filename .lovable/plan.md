

## ECC System Core Update — Implementation Plan

### Overview
Update the entire ECC economy to match the new credit flow specification. Changes span database functions, hooks, edge functions, and UI text across ~20 files.

### Changes Summary

| Area | Current | New |
|---|---|---|
| Welcome Bonus | 100 ECC | 80 ECC |
| Earning Cap | 5 ECC/day | 5 ECC/week (20/month) |
| Quest Card | Variable (xp_reward) | Fixed +2 ECC |
| Wreck Buddy | +1 ECC | +2 ECC |
| Tibetan Bowl | +1 ECC | +1 ECC (no change) |
| Sound Therapy | +1 ECC | +1 ECC (no change) |
| Mood Tracker | +3 ECC | Removed |
| Gratitude | +5 ECC | Removed |
| Journaling | +5 ECC | Removed |
| Expert Connect | 50 ECC | 45 ECC |
| Peer Connect | 20 ECC | 18 ECC |
| BlackBox | Flat 30 ECC | Tiered: Free → 3 → 6 ECC |
| BlackBox Daily Limit | None | 3 sessions/day |
| Top-up Packages | 50/100/250/500 | 25/60/130 ECC |

### Database Migration

Create three new RPC functions + update the welcome bonus trigger:

1. **`get_weekly_earn_total`** — sums earn transactions from Monday of the current week
2. **`get_blackbox_usage_count`** — counts total completed/active BlackBox sessions for a user (all-time, for tiered pricing)
3. **`get_blackbox_daily_count`** — counts today's BlackBox sessions
4. **Update `handle_new_user`** — change welcome bonus from 100 to 80 ECC

### Hook Changes

1. **`src/hooks/useEccEarn.ts`**
   - Change `DAILY_CAP = 5` → `WEEKLY_CAP = 5`
   - Replace `get_daily_earn_total` RPC with `get_weekly_earn_total`
   - Rename `dailyEarned` → `weeklyEarned`, `remainingToday` → `remainingThisWeek`
   - Update error message to "Weekly earn cap reached (5 ECC/week)"

2. **`src/hooks/useMoodTracker.ts`** — Remove `useEccEarn` import and `earnFromActivity` call

3. **`src/hooks/useGratitude.ts`** — Remove `useEccEarn` import and `earnFromActivity` call

4. **`src/hooks/useJournaling.ts`** — Remove `useEccEarn` import and `earnFromActivity` call

5. **`src/hooks/useQuests.ts`** — Hardcode `actualReward = Math.min(2, remainingThisWeek)` instead of using `quest.xp_reward`

6. **`src/pages/dashboard/WreckBuddy.tsx`** — Change `amount: 1` → `amount: 2`

7. **`src/hooks/useBlackBoxSession.ts`**
   - Before `requestSession`: call `get_blackbox_daily_count` and `get_blackbox_usage_count`
   - If daily >= 3: reject with "Daily BlackBox limit reached (3/day)"
   - Calculate cost: `totalCount === 0 ? 0 : totalCount < 4 ? 3 : 6`
   - If cost > 0: call `spendCredits(cost, ...)`, else skip
   - Update cancel refund to refund actual cost (not hardcoded 30)
   - Store cost in session notes or derive from count

8. **`src/hooks/usePeerConnect.ts`** — Change all `20` → `18` in spend/refund amounts and messages

9. **`src/hooks/usePurchaseCredits.ts`** — Replace PACKAGES with:
   - 25 ECC / ₹49 (Starter)
   - 60 ECC / ₹99 (Growth, popular)
   - 130 ECC / ₹199 (Priority)

### Edge Function Changes

10. **`supabase/functions/refund-blackbox-session/index.ts`** — Look up the original spend transaction by `reference_id` to get the actual amount charged, refund that amount instead of hardcoded 30

### UI Text Updates

11. **`src/pages/dashboard/Appointments.tsx`** — Change `50` → `45` everywhere (display, creditCost, balance checks)

12. **`src/components/mobile/MobileAppointments.tsx`** — Same: `50` → `45`

13. **`src/pages/dashboard/PeerConnect.tsx`** — Change `20 ECC` → `18 ECC` in display text

14. **`src/components/mobile/MobilePeerConnect.tsx`** — Change `20 ECC` → `18 ECC`

15. **`src/components/mobile/MobileCredits.tsx`** — Update costs text, earning info (weekly cap), package display

16. **`src/pages/dashboard/Credits.tsx`** — Same updates as MobileCredits

17. **`src/components/landing/FAQSection.tsx`** — Update ECC description (80 base, 45/18/tiered pricing)

18. **`src/components/landing/CTASection.tsx`** — Change "100 ECC" → "80 ECC"

19. **`src/components/landing/CodePreviewSection.tsx`** — Change "100 ECC" → "80 ECC"

20. **`src/pages/legal/Terms.tsx`** — Update welcome bonus, earning rules, spending costs

### BlackBox UI Updates

21. **`src/pages/dashboard/BlackBox.tsx`** and **`src/components/mobile/MobileBlackBox.tsx`** — Show tiered pricing info and daily limit (3/day)

### Files Modified (Total: ~22)
- 1 database migration (4 functions)
- 9 hooks/pages with logic changes
- 1 edge function
- ~11 UI files with text updates

