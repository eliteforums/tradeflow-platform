

## Fix: APAAR ID Verification — Updated Logic (Verified vs Pending)

### Current State vs Required

**Current**: `activate-account` sets `is_verified: true` unconditionally (line 95), regardless of whether the APAAR/ERP ID was found. The `apaar_verified`/`erp_verified` flags in `user_private` track ID match status but don't influence the profile's `is_verified` flag.

**Required**: `is_verified` should reflect actual APAAR/ERP verification result:
- ID found → `is_verified = true` (Verified)
- ID not found → `is_verified = false` (Pending Verification)

### Changes

**1. `supabase/functions/activate-account/index.ts`**
- Line 95: Change `is_verified: true` → `is_verified: idVerified`
- Problem: `idVerified` is computed after the profile update (line 103-136). Move the profile `is_verified` update to AFTER the student ID verification block.
- Specifically: Remove `is_verified: true` from the initial profile update (line 90-97). Add a second profile update after line 136 that sets `is_verified: idVerified`.
- If no student ID was provided AND institution has no uploaded IDs (no records to check against), set `is_verified: true` (can't verify, so default pass — matches current `no_records` behavior in verify-student-id).

**2. `supabase/functions/verify-student-id/index.ts`**
- No changes needed — already returns correct `verified: true/false` responses.

**3. UI — Profile pages already handle both states**
- `src/pages/dashboard/Profile.tsx` and `src/components/mobile/MobileProfile.tsx` already show "Verified" vs "Verification Pending" based on `profile.is_verified`. No UI changes needed.

**4. Data handling compliance**
- Raw APAAR ID is already NOT stored (lines 145-148 set all ID fields to `null`)
- Only verification tokens (`apaar_verified`, `erp_verified`) and `is_verified` flag are persisted — already compliant

### No database changes needed
Existing `is_verified` boolean on `profiles` and `apaar_verified`/`erp_verified` on `user_private` already support this.

### Files
- `supabase/functions/activate-account/index.ts`

