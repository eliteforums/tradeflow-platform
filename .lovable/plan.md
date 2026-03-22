

## Plan: Fix QR Generation, BlackBox Student Call, and Peer Session ID Mismatch

### Issue 1: QR Code "non-2xx status code"

The `generate-spoc-qr` edge function returns HTTP 400 when it fails. Most likely cause: no unused temp credentials exist for the SPOC's institution (admin hasn't run `create-bulk-temp-ids`), OR the function wasn't deployed after the recent rewrite.

**Fix:**
- Deploy the edge function to ensure the latest code is live
- Update the SPOC Dashboard QR section to show a clear, actionable error message (e.g., "No temp IDs available — ask your admin to generate more") instead of the generic "Edge Function returned a non-2xx status code"
- File: `src/components/spoc/SPOCDashboardContent.tsx` — improve error display in the QR query's error state

### Issue 2: BlackBox — Student Not Joining the Call

The student's `MeetingProvider` + `MeetingView` is rendered offscreen at `position: fixed; top: -9999; opacity: 0`. This can cause browsers to throttle or block WebRTC audio connections for elements completely outside the viewport.

**Fix:**
- Change the offscreen container approach in both `src/pages/dashboard/BlackBox.tsx` and `src/components/mobile/MobileBlackBox.tsx`
- Instead of pushing off-screen, use `clip: rect(0,0,0,0); position: absolute; width: 1px; height: 1px;` (screen-reader-safe hiding that keeps the element in the render tree and viewport)
- This ensures WebRTC audio streams remain active while keeping the video UI invisible

### Issue 3: Peer Session ID Mismatch Between Intern and Student

When an intern clicks "Join" from InternDashboardContent, it navigates to `/dashboard/peer-connect` without passing the session ID. PeerConnect then independently queries sessions and picks the first `status === "active"` one. If multiple active sessions exist, intern and student may see different sessions.

**Fix:**
- `src/components/intern/InternDashboardContent.tsx` — when intern clicks "Join", navigate with query param: `/dashboard/peer-connect?sessionId=<id>`
- `src/pages/dashboard/PeerConnect.tsx` — read `sessionId` from URL search params and pass it to `usePeerConnect` or set `activeSessionId` directly
- `src/hooks/usePeerConnect.ts` — accept optional `initialSessionId` parameter; if provided, use it instead of auto-detecting from `sessions.find()`
- Same fix for `src/components/mobile/MobilePeerConnect.tsx`

### Files to modify
1. `supabase/functions/generate-spoc-qr/index.ts` — redeploy (no code change needed)
2. `src/components/spoc/SPOCDashboardContent.tsx` — improve QR error display
3. `src/pages/dashboard/BlackBox.tsx` — fix offscreen container CSS
4. `src/components/mobile/MobileBlackBox.tsx` — fix offscreen container CSS
5. `src/components/intern/InternDashboardContent.tsx` — pass session ID in "Join" navigation
6. `src/pages/dashboard/PeerConnect.tsx` — read session ID from URL params
7. `src/components/mobile/MobilePeerConnect.tsx` — read session ID from URL params
8. `src/hooks/usePeerConnect.ts` — accept optional initial session ID

