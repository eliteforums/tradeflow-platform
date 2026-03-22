

## Plan: Restore Institution Code Step in Onboarding Flow

### Problem
The `/institution-code` route was removed from `App.tsx` during the temp-ID refactor, but:
1. The PRD v2-34 (Section 3.1) explicitly requires a 3-layer onboarding: **Eternia Code → SPOC QR → Account Setup**
2. The `InstitutionCode.tsx` page file still exists but is not routed — clicking "Get Started" from landing page leads to a 404
3. Multiple components still link to `/institution-code`: Navbar, HeroSection, CTASection, AnnouncementBanner, Login page

### Fix

#### 1. Restore `/institution-code` route in `App.tsx`
- Re-add the lazy import for `InstitutionCode`
- Re-add the `<Route path="/institution-code">` before `/qr-scan`
- Remove the comment saying it was removed

#### 2. No other file changes needed
- `InstitutionCode.tsx` already exists and works correctly — validates the code against the `institutions` table, stores `eternia_institution_code` and `eternia_institution_id` in sessionStorage, then navigates to `/qr-scan`
- All landing page links already point to `/institution-code`
- `QRScan.tsx` and `Register.tsx` already read from sessionStorage

### Files Modified

| File | Change |
|------|--------|
| `src/App.tsx` | Add lazy import for InstitutionCode, restore route |

### Result
Flow restored to: Landing → `/institution-code` → `/qr-scan` → `/register` — matching PRD Section 3.1.

