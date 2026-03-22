

## Plan: Make Referral Code Input More Visible on Intern Dashboard

### Problem
The referral code option exists in both desktop and mobile intern dashboards, but it renders as a tiny "Have a referral code?" text link that is very easy to miss. It needs to be more prominent.

### Solution
Replace the small text link with a visible card/banner that stands out in the training section. Show it as a styled card with an icon, description, and a clear call-to-action button.

### Changes

**1. `src/components/intern/InternDashboardContent.tsx` (line 694-703)**
- Replace the collapsed state from a plain text link to a visible card with Gift icon, description text ("Skip training with a referral code from your admin"), and a prominent "Enter Code" button

**2. `src/components/mobile/MobileInternDashboard.tsx` (line 489-494)**
- Same change for mobile: replace the text link with a visible card matching mobile design patterns (rounded-2xl)

### Files to modify
- `src/components/intern/InternDashboardContent.tsx` — update `ReferralCodeInput` collapsed state
- `src/components/mobile/MobileInternDashboard.tsx` — update `MobileReferralCodeInput` collapsed state

