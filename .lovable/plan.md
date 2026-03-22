

## Plan: Fix Referral Code Redemption Not Updating Training Status

### Problem
When an intern redeems a referral code, the profile update to the database likely fails silently because:
1. No error checking on the `profiles.update()` call — if it fails, the success toast still shows
2. The `refreshProfile` function from AuthContext is not called, so the in-memory profile state doesn't update
3. Even though `window.location.reload()` is called, if the DB update failed, the old state persists

### Solution
Fix the referral code redemption in both desktop and mobile components:

1. **Add error handling** on the `profiles.update()` call — if it fails, show an error and don't mark the code as used (reverse the order: update profile first, then mark code as used)
2. **Call `refreshProfile`** from AuthContext after successful update
3. **Reorder operations**: Update the profile FIRST, then mark the referral code as used — this way if the profile update fails, the code remains unused

### Changes

**1. `src/components/intern/InternDashboardContent.tsx`**
- Pass `refreshProfile` from AuthContext to the `ReferralCodeInput` component
- Reorder: update profile first, then mark code used
- Add error check on the profile update call
- Call `refreshProfile()` before reload

**2. `src/components/mobile/MobileInternDashboard.tsx`**
- Same fixes for the `MobileReferralCodeInput` component

### Files to modify
- `src/components/intern/InternDashboardContent.tsx`
- `src/components/mobile/MobileInternDashboard.tsx`

