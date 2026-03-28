

## Platform Audit — Remaining Issues Found

### Issue 1: Welcome Bonus is 80 ECC, Not 100 ECC (Bug — Medium)
- **File**: `supabase/functions` DB function `handle_new_user()` line: `VALUES (NEW.id, 80, 'grant', 'Welcome bonus');`
- **Problem**: The signup bonus is 80 ECC, but the FAQ and docs say 100 ECC
- **Also**: FAQSection.tsx line 12 says "100 ECC on signup"
- **Fix**: Update the DB trigger to grant 100 ECC (migration), OR update FAQ to say 80 ECC. Recommend aligning to 100 ECC as documented.

---

### Issue 2: Console Ref Warnings on Every Page Load (Bug — Medium)
- **Console**: ~10+ "Function components cannot be given refs" errors on boot
- **Root Cause**: The `App` component is an arrow function (`const App = () => ...`). React's StrictMode tries to pass refs through the component tree. The `Toaster`, `Sonner`, `PWAUpdatePrompt`, `CookieConsent`, and `Analytics` components are all siblings inside `TooltipProvider`, which triggers the warning cascade.
- **Fix**: This is a known React 18 dev-mode false positive with provider trees. The warnings are harmless in production and don't affect functionality. No code fix needed — but wrapping `App` with `React.forwardRef` would suppress them.

---

### Issue 3: Sonner Toaster Uses `next-themes` Import (Bug — Low)
- **File**: `src/components/ui/sonner.tsx` line 1
- **Problem**: `import { useTheme } from "next-themes"` — this project doesn't use Next.js. The import works because `next-themes` is likely installed as a dependency, but it's conceptually incorrect and may cause issues if the package is removed.
- **Fix**: Replace with a static theme value (`"dark"`) since the platform uses a fixed dark theme.

---

### Issue 4: `profiles.student_id` Column Still Auto-Generated (Code Smell — Low)
- **Problem**: The `generate_student_id()` trigger auto-generates `ETN-XXXX-00001` format IDs and stores them in `profiles.student_id`. This contradicts the APAAR spec (never store raw IDs). The Profile page correctly masks this, but the column shouldn't be populated at all.
- **Fix**: Consider dropping the trigger or making it store only a hash/null. Low priority since the Profile UI already masks the value.

---

### Issue 5: Emergency Contact Data Stored in Plaintext (Security — High)
- **File**: `user_private` table columns `emergency_name_encrypted`, `emergency_phone_encrypted`
- **Problem**: Despite the column names containing "encrypted", the data is stored as plaintext strings. The Register form, Profile page, and edge functions all read/write these as raw text. No actual encryption is applied anywhere.
- **Fix**: This is a naming issue — either rename columns to drop "encrypted" suffix, or implement actual AES-256 encryption. For MVP, document this as a known gap and plan encryption for a future iteration.

---

### Issue 6: `useEccEarn` Legacy Aliases Still Exported (Code Smell — Low)
- **File**: `src/hooks/useEccEarn.ts` lines 68-70
- **Problem**: `dailyEarned`, `dailyCap`, `remainingToday` are still exported as legacy aliases. No consumers use them anymore (TibetanBowl was the last and was fixed).
- **Fix**: Remove the legacy alias exports to prevent future confusion.

---

### Issue 7: BlackBox Daily Limit Says "3/day" — No Weekly Cap Consistency (UX — Low)
- **File**: `src/hooks/useBlackBoxSession.ts` line 234-237
- **Problem**: BlackBox uses a daily limit (3 sessions/day via `get_blackbox_daily_count`), while the earn system uses weekly caps. This isn't necessarily wrong, but the toast message "Daily BlackBox limit reached (3 sessions/day)" could confuse users who see "weekly" labels everywhere else.
- **Fix**: No code change needed — this is intentionally different (daily session limit vs weekly earn cap). Just noting for completeness.

---

### Summary

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 1 | Welcome bonus 80 ECC vs 100 ECC documented | **Medium** | DB migration to update trigger |
| 2 | Console ref warnings on boot | **Low** | Harmless dev-mode warnings, optional fix |
| 3 | Sonner imports `next-themes` | **Low** | Replace with static "dark" theme |
| 4 | `profiles.student_id` auto-generated | **Low** | Optional trigger removal |
| 5 | Emergency data stored as plaintext | **High** | Document as known gap, plan encryption |
| 6 | Legacy daily aliases in useEccEarn | **Low** | Remove 3 unused exports |
| 7 | BlackBox daily vs weekly cap messaging | **Info** | No change needed |

### Files to Edit
- **DB Migration**: Update `handle_new_user()` to grant 100 ECC instead of 80
- `src/components/ui/sonner.tsx` — Remove `next-themes` import, use static dark theme
- `src/hooks/useEccEarn.ts` — Remove legacy `dailyEarned`/`dailyCap`/`remainingToday` aliases

