

## PRD Gap Fix — Remaining Missing Modules

After detailed code review, most items from the gap analysis are **already implemented**:
- Sound Therapy ECC earn ✓
- Peer Connect credit deduction (20 ECC) ✓  
- Expert Appointment credit deduction ✓
- Expert escalation button + AI Monitor badge ✓
- SPOC bulk credit allocation ✓
- Account deletion with 30-day grace period ✓

### Actually Missing (3 items)

#### 1. Wreck Buddy — ECC Earn on Activity
**File:** `src/pages/dashboard/WreckBuddy.tsx`
- Add `useEccEarn` hook
- Listen for `postMessage` from the iframe when the ragdoll session completes (or use a "Done" button outside the iframe)
- Award 1 ECC via `earnFromActivity({ amount: 1, activity: "Wreck the Buddy session" })`
- Show daily earn status (remaining ECC today)

#### 2. Tibetan Bowl — ECC Earn on Activity  
**File:** `src/pages/dashboard/TibetanBowl.tsx`
- Same pattern: add `useEccEarn` hook
- Add a "Complete Session" button below the iframe
- Award 1 ECC on completion
- Show daily earn status

#### 3. ECC Bundle Packs UI on Credits Page
**File:** `src/pages/dashboard/Credits.tsx` + `src/components/mobile/MobileCredits.tsx`
- Add bundle pack cards in the sidebar (50 ECC/₹99, 100 ECC/₹179, 250 ECC/₹399, 500 ECC/₹699) using existing `usePurchaseCredits` hook
- Show "Coming Soon" or connect to the existing `purchaseCredits` flow
- Replace the current "Ask your SPOC" prompt with bundle cards + purchase buttons

### Technical Details

- `useEccEarn` is already built with daily cap (5 ECC), `earnFromActivity()` mutation, and toast feedback
- `usePurchaseCredits` hook already exists with Razorpay integration and 4 package tiers
- No database migrations needed
- No new edge functions needed
- Changes span 4 files total

