

## Plan: Implement New ID Creation & QR Onboarding Flow

### Current vs. New Flow

**Current**: Institution Code → SPOC QR (HMAC verification) → Register (user creates account from scratch)

**New**: Admin bulk-creates temp credential pool → SPOC generates QR per student (picks unused temp ID) → Student scans QR → Backend verifies temp creds → Account Setup (set permanent username + password) → Temp ID marked used

### Changes

#### 1. Database: New `temp_credentials` table

```sql
CREATE TABLE public.temp_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id),
  temp_username text NOT NULL UNIQUE,
  temp_password_hash text NOT NULL,
  temp_password_plain text NOT NULL, -- stored for QR generation, cleared on activation
  auth_user_id uuid, -- set after account activation
  status text NOT NULL DEFAULT 'unused', -- unused, assigned, activated
  assigned_at timestamptz,
  activated_at timestamptz,
  expires_at timestamptz,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.temp_credentials ENABLE ROW LEVEL SECURITY;
```

RLS: Admins full access, SPOCs can SELECT/UPDATE for their institution only.

#### 2. Edge Function: `create-bulk-temp-ids`

Admin-only function. Accepts `{ institution_id, count, prefix? }`.
- Generates `count` temp usernames (e.g., `demo_0001`) and random 8-char passwords
- Hashes passwords, stores both hash and plaintext in `temp_credentials`
- Returns count created

#### 3. Edge Function: Update `generate-spoc-qr`

Instead of HMAC-signing institution data, the function now:
- Picks one random `unused` temp credential from SPOC's institution
- Marks it as `assigned` with timestamp
- Returns QR payload: `{ temp_id, temp_password, institution_id }`

#### 4. Edge Function: `verify-temp-credentials`

New function replacing `validate-spoc-qr`. Accepts `{ temp_username, temp_password }`.
- Verifies credentials exist and status is `assigned`
- Checks expiry if set
- Returns `{ valid: true, institution_id, temp_credential_id }`

#### 5. Edge Function: `activate-account`

New function. Accepts `{ temp_credential_id, new_username, new_password, emergency_* }`.
- Creates real auth user via `admin.createUser`
- Updates profile with institution_id
- Inserts user_private data
- Marks temp credential as `activated` with `auth_user_id`
- Clears `temp_password_plain`
- Returns session token for auto-login

#### 6. Frontend: Update `QRScan.tsx`

- Parse QR payload as `{ temp_id, temp_password, institution_id }`
- Call `verify-temp-credentials` instead of `validate-spoc-qr`
- On success, store `temp_credential_id` in sessionStorage, navigate to `/register`

#### 7. Frontend: Update `Register.tsx`

- If `temp_credential_id` is in sessionStorage, show "Account Setup" mode
- Remove institution code / SPOC verification steps
- User sets permanent username + password + emergency info
- Calls `activate-account` edge function instead of `signUp`
- On success, auto-login and redirect to dashboard

#### 8. Frontend: Update Admin `MemberManager.tsx`

- Replace current bulk-add-members with `create-bulk-temp-ids`
- Show pool of unused/assigned/activated temp credentials per institution
- Download CSV of temp credentials

#### 9. Frontend: Update SPOC `SPOCDashboardContent.tsx`

- QR generation now calls updated `generate-spoc-qr` (picks unused temp ID)
- Show count of available/used temp IDs for their institution
- Remove old single-student creation (all onboarding via QR now)

#### 10. Cleanup: Remove `InstitutionCode.tsx` page

- Remove `/institution-code` route from `App.tsx`
- Update landing page signup links to go directly to `/qr-scan`

### Files Modified

| File | Change |
|------|--------|
| Database migration | Create `temp_credentials` table with RLS |
| `supabase/functions/create-bulk-temp-ids/index.ts` | New edge function for admin bulk ID creation |
| `supabase/functions/generate-spoc-qr/index.ts` | Rewrite to pick unused temp ID |
| `supabase/functions/verify-temp-credentials/index.ts` | New edge function replacing validate-spoc-qr |
| `supabase/functions/activate-account/index.ts` | New edge function for account activation |
| `src/pages/auth/QRScan.tsx` | Parse new QR format, call verify-temp-credentials |
| `src/pages/auth/Register.tsx` | Account setup mode using temp credentials |
| `src/components/admin/MemberManager.tsx` | Use create-bulk-temp-ids, show credential pool |
| `src/components/spoc/SPOCDashboardContent.tsx` | Updated QR gen, show available temp IDs |
| `src/App.tsx` | Remove /institution-code route |
| `supabase/config.toml` | Add new function configs |

### Security

- Temp passwords stored hashed (bcrypt) for verification; plaintext cleared after activation
- Each temp credential single-use, marked `activated` permanently
- Optional expiry on temp credentials
- Rate limiting on verify-temp-credentials to prevent brute force
- Only admins can create temp IDs, only SPOCs can assign them via QR

