

## Plan: Restore HMAC-Based SPOC QR Generation

### Problem
The `generate-spoc-qr` edge function was rewritten to pick an unused temp credential from the pool. If no temp IDs exist (admin hasn't created any), QR generation fails with "No unused temp IDs available." This breaks the PRD flow where SPOC QR is simply an institution verification mechanism using HMAC signatures — independent of temp IDs.

The existing `validate-spoc-qr` edge function already supports HMAC-signed payloads `{institution_id, spoc_id, timestamp, signature}`, but `generate-spoc-qr` no longer produces them.

### Fix

#### 1. Rewrite `generate-spoc-qr` to use HMAC signing
**File**: `supabase/functions/generate-spoc-qr/index.ts`

Replace the temp-credential picking logic with HMAC signing:
- Build payload: `{institution_id, spoc_id, timestamp}`
- Sign with HMAC-SHA256 using `SUPABASE_SERVICE_ROLE_KEY`
- Return `{qr_payload: JSON.stringify({institution_id, spoc_id, timestamp, signature})}`
- Keep auth check (must be SPOC with institution)
- Keep audit log

#### 2. Update `QRScan.tsx` to handle both QR formats
**File**: `src/pages/auth/QRScan.tsx`

Update `parseQRPayload` and `handleManualSubmit` to detect payload type:
- If payload has `signature` field → call `validate-spoc-qr` (HMAC verification)
- If payload has `temp_id` field → call `verify-temp-credentials` (temp ID flow)
- Both paths store institution info in sessionStorage and navigate to `/register`

#### 3. Update SPOC dashboard QR descriptions
**File**: `src/components/spoc/SPOCDashboardContent.tsx`

Update text from "Each QR code assigns one unused temp ID" to "Students scan this QR to verify your institution during onboarding." Remove the temp ID count from QR section (keep temp pool stats as a separate info section).

#### 4. Update `SPOCTools.tsx` QR error handling
**File**: `src/components/admin/SPOCTools.tsx`

Update description text to match the HMAC-based QR flow.

### Files Modified

| File | Change |
|------|--------|
| `supabase/functions/generate-spoc-qr/index.ts` | HMAC-signed QR instead of temp credential picking |
| `src/pages/auth/QRScan.tsx` | Handle both HMAC and temp-ID QR formats |
| `src/components/spoc/SPOCDashboardContent.tsx` | Fix QR section descriptions |
| `src/components/admin/SPOCTools.tsx` | Fix QR section descriptions |

### Result
SPOC QR generation works independently of temp IDs. Temp IDs remain as a separate admin feature for bulk onboarding. Both QR formats are supported on the scan page.

