

## Plan: Add Forgot Password Flow Using Recovery Credentials

### Context
Eternia uses `@eternia.local` fake emails — standard Supabase email-based password reset won't work. Users already set up recovery credentials (3 hint-answer pairs + 4-emoji pattern) via the Recovery Setup page. The "Forgot Password" flow must verify identity using these credentials, then allow a password reset.

### Changes

#### 1. New Edge Function: `supabase/functions/recover-password/index.ts`
- Accepts `{ username, fragment_pairs, emoji_pattern, new_password }`
- Uses service role to:
  - Look up user by `username@eternia.local` email in `auth.users`
  - Fetch `recovery_credentials` for that user
  - Compare submitted pairs/emojis against stored values (JSON comparison)
  - If match: call `adminAuthClient.updateUserById(userId, { password: new_password })`
  - If no match: return 403 "Recovery credentials do not match"
  - If no recovery credentials set up: return 404 "No recovery credentials found for this account"
- Rate limited: 5 attempts per username per 10 minutes

#### 2. New Page: `src/pages/auth/ForgotPassword.tsx`
3-step flow:
- **Step 1**: Enter username
- **Step 2**: Answer the 3 hint questions (fetched hints only, not answers) + select 4 emojis in order
- **Step 3**: Set new password (with confirmation field)

On submit, calls `recover-password` edge function. On success, redirects to `/login` with success toast.

#### 3. New Edge Function: `supabase/functions/get-recovery-hints/index.ts`
- Accepts `{ username }`
- Looks up user, fetches `recovery_credentials`, returns only the hint questions (not answers or emoji pattern)
- Rate limited to prevent enumeration

#### 4. `src/pages/auth/Login.tsx` — Add "Forgot Password?" link
- Add link below the password field pointing to `/forgot-password`

#### 5. `src/App.tsx` — Add route
- Add `<Route path="/forgot-password" element={<ForgotPassword />} />`

#### 6. `supabase/config.toml` — Register new functions
- Add `[functions.recover-password]` and `[functions.get-recovery-hints]` with `verify_jwt = false`

### Files Modified
- `supabase/functions/get-recovery-hints/index.ts` — New: return hint questions for a username
- `supabase/functions/recover-password/index.ts` — New: verify recovery credentials + reset password
- `src/pages/auth/ForgotPassword.tsx` — New: 3-step forgot password page
- `src/pages/auth/Login.tsx` — Add "Forgot Password?" link
- `src/App.tsx` — Add `/forgot-password` route
- `supabase/config.toml` — Register edge functions

### Technical Details
- Recovery credentials are stored as JSON strings in `fragment_pairs_encrypted` and `emoji_pattern_encrypted` — comparison is done server-side after JSON parse
- The `get-recovery-hints` endpoint only returns hint question labels (e.g. "Favourite colour"), never answers
- Password update uses Supabase Admin API `updateUserById` which bypasses email verification
- If a user never set up recovery credentials, they must contact their SPOC for manual password reset

