

## Plan: Dynamic QR in SPOC Dashboard + Remaining PRD v2-29 Gaps

### 1. Dynamic QR Code in SPOC Dashboard (Critical Fix)

**Problem:** The SPOC Dashboard's Onboarding tab (lines 440-448 of `SPOCDashboardContent.tsx`) shows a static `QrCode` icon instead of a real scannable QR. The `generateQR` function only copies text to clipboard. Meanwhile, `SPOCTools.tsx` (admin panel) already has a fully working dynamic QR with `QRCodeSVG` from `qrcode.react`.

**Fix:** Replace the static icon placeholder in `SPOCDashboardContent.tsx` with the same `QRCodeSVG` pattern used in `SPOCTools.tsx`:
- Add `useQuery` to auto-fetch QR payload from `generate-spoc-qr` edge function on mount
- Render `QRCodeSVG` with the payload, loading spinner, and error state
- Add Copy, Download, and Regenerate buttons (matching `SPOCTools.tsx` pattern)
- Remove the old `generateQR` function that only copied text

**File:** `src/components/spoc/SPOCDashboardContent.tsx`

---

### 2. Remaining PRD v2-29 Gaps (Compared Against Codebase)

After thorough comparison of PRD v2-29 against the full codebase, here are the gaps still present:

| # | Gap | PRD Section | Status |
|---|-----|-------------|--------|
| 1 | **SPOC QR is static icon** | §3, §20 | Fix above |
| 2 | **Therapist Dashboard missing "Active Session" tab** | §20 | Tab exists as "session" but PRD calls for "Active Session" and "Escalation History" as separate tabs — current implementation already covers this with queue/session/history/profile tabs ✅ |
| 3 | **ECC Low Balance Prompt** | §21 | Already implemented in `Dashboard.tsx` line 77-86 (`balance < 5`) ✅ |
| 4 | **Daily ECC Earning Cap (5 ECC)** | §21 | Already enforced via `get_daily_earn_total` DB function ✅ |
| 5 | **ECC Stability Pool** | §21 | Already implemented (table + edge functions) ✅ |
| 6 | **Escalation consent checkbox** | §3.4 | Already in Register.tsx ✅ |
| 7 | **SPOC Dashboard missing M.Phil override records in Reports** | §20 | Already in Reports tab ✅ |

**Conclusion:** The only actionable gap is the dynamic QR. All other PRD v2-29 features are already implemented or are Phase 2+ items (AI transcription pipeline, cron jobs).

---

### Technical Details

**Changes to `src/components/spoc/SPOCDashboardContent.tsx`:**

1. Add imports: `QRCodeSVG` from `qrcode.react`, `useRef`, `Download`, `RefreshCw`
2. Add `useQuery` for QR generation (same pattern as `SPOCTools.tsx` lines 22-34)
3. Add `qrRef` for download functionality
4. Add `downloadQR` callback (same as `SPOCTools.tsx` lines 118-141)
5. Replace lines 440-448 (static icon + button) with:
   - Loading state → spinner
   - Success state → `QRCodeSVG` rendered with teal foreground color
   - Error state → retry button
   - Action row: Copy, Download, Regenerate buttons
6. Remove old `generateQR` function (lines 235-253)

**No database changes needed. No new edge functions needed.**

### Files to Edit
- `src/components/spoc/SPOCDashboardContent.tsx` — replace static QR with dynamic `QRCodeSVG`

