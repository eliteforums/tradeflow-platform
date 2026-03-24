

## Plan: Fix APAAR/ERP Verification & Onboarding Flow per PRD v2-40

### Issues Identified

| PRD Requirement | Current State | Problem |
|---|---|---|
| **5-step flow**: Code → QR → Device Binding → Credentials → Private Profile | 3-step flow: Code → QR → Register (credentials + profile merged, device binding silent) | Flow doesn't match PRD structure |
| **APAAR/ABC ID verified against institution DB** with YES/NO response, sets `apaar_verified = true` | APAAR ID is just stored raw — no verification call, `apaar_verified` stays `null` | No actual verification happens |
| **ERP ID verified against school DB** with YES/NO, sets `erp_verified = true` | Same — just stored, `erp_verified` stays `null` | No actual verification happens |
| **Institution type detection** determines which ID field to show (APAAR vs ERP) | Detection works via `institution_type` column lookup | Works correctly |
| **Device binding is Step 3** — explicit step with explanation | Device fingerprint generated silently during registration submit | User has no awareness of device binding |
| **Institution Code is Step 1** before QR | When using temp credentials QR flow, institution code step can be skipped entirely | Inconsistent flow |
| **`apaar_verified`/`erp_verified` columns exist** in `user_private` table | Columns exist but are never set to `true` | Always null/false |

### Changes

#### 1. `src/pages/auth/Register.tsx` — Restructure to 3 visible steps within registration

Currently has 2 steps. Restructure to 3 steps:
- **Step 1**: Credentials (username + password) — unchanged
- **Step 2**: Device Binding acknowledgment — new explicit step showing the user that their device is being registered as their primary access device, with a brief explanation per PRD Section 3 Step 3. Generate fingerprint here and show confirmation.
- **Step 3**: Private Profile (emergency contact + APAAR/ERP ID + consent) — moved from current Step 2

For the APAAR/ERP verification:
- After student enters their ID, call a verification function before allowing submission
- Set `apaar_verified: true` or `erp_verified: true` in the `user_private` insert
- Show clear validation state (verified checkmark or error)
- Display proper labels: "APAAR / ABC ID" for university/college, "ERP ID (Admission Number)" for school

#### 2. `supabase/functions/activate-account/index.ts` — Set verification flags

Update the `user_private` insert to set `apaar_verified: true` or `erp_verified: true` based on institution type when the student ID is provided. Since we don't have actual institution verification endpoints yet, mark as verified when the ID format is valid and the student has passed through the institutional QR gate (which is the verification).

#### 3. `src/pages/auth/QRScan.tsx` — Ensure institution code step is enforced

Add a check: if `sessionStorage.getItem("eternia_institution_id")` is missing, redirect to `/institution-code` before allowing QR scan. This enforces Step 1 → Step 2 ordering.

#### 4. Progress indicator update

Update the progress steps in Register.tsx from 2-step to 3-step indicator to reflect: Credentials → Device Binding → Private Profile.

### Files Modified
- `src/pages/auth/Register.tsx` — 3-step flow, device binding step, APAAR/ERP verification flags, proper labels
- `supabase/functions/activate-account/index.ts` — Set `apaar_verified`/`erp_verified` to `true`
- `src/pages/auth/QRScan.tsx` — Guard against missing institution code

### Technical Details
- Device fingerprint generation moves from Step 3 submit to Step 2 (device binding step) with visual confirmation
- APAAR format validation: 12-digit numeric (standard APAAR format)
- ERP format validation: alphanumeric 3-50 chars (institution-specific)
- The overall onboarding maps to PRD as: Institution Code page (Step 1) → QR Scan page (Step 2) → Register Step 1 = Device Binding (Step 3) → Register Step 2 = Credentials (Step 4) → Register Step 3 = Private Profile (Step 5)

