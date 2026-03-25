

## Comprehensive Codebase Audit — Issues Found

### Critical Issues

#### 1. `getClaims()` is not a valid Supabase JS method
**Files**: `spend-credits/index.ts`, `purchase-credits/index.ts`, `grant-credits/index.ts`
**Problem**: These edge functions call `supabase.auth.getClaims(token)` which does NOT exist in the Supabase JS SDK v2. This will throw a runtime error on every call.
**Fix**: Replace with `supabase.auth.getUser(token)` pattern (like `refund-blackbox-session` and `escalate-emergency` do correctly). Extract user ID from `user.id` instead of `claims.claims.sub`.

#### 2. `ai-transcribe` uses deprecated `serve()` import
**File**: `supabase/functions/ai-transcribe/index.ts`
**Problem**: Uses `import { serve } from "https://deno.land/std@0.168.0/http/server.ts"` — the rest of the codebase uses `Deno.serve()`. This may cause deployment issues.
**Fix**: Replace `serve(async (req) => {` with `Deno.serve(async (req) => {`

#### 3. `ai-transcribe` CORS headers incomplete
**File**: `supabase/functions/ai-transcribe/index.ts` line 5
**Problem**: CORS headers only include `"authorization, x-client-info, apikey, content-type"` — missing the `x-supabase-client-platform*` and `x-supabase-client-runtime*` headers that other functions include. This can cause CORS preflight failures from the Supabase JS client.
**Fix**: Use the full CORS header set matching other functions.

#### 4. `purchase-credits` also uses deprecated `serve()` import
**File**: `supabase/functions/purchase-credits/index.ts`
**Same fix**: Replace with `Deno.serve()`.

#### 5. `ai-transcribe` has no authentication check
**File**: `supabase/functions/ai-transcribe/index.ts`
**Problem**: No JWT verification or caller identity check. Anyone with the anon key can call this function and update `blackbox_sessions` or `peer_sessions` flag levels.
**Fix**: Add auth header validation like other functions.

### Medium Issues

#### 6. Console ref warning — `EterniaLogo` + `Footer`
**Files**: `src/components/EterniaLogo.tsx`, `src/components/landing/Footer.tsx`
**Problem**: Console error "Function components cannot be given refs." The `Footer` component wraps `EterniaLogo` inside a `<Link>` which passes a ref, but `EterniaLogo` doesn't use `forwardRef`.
**Fix**: Wrap `EterniaLogo` with `React.forwardRef`.

#### 7. `ExpertL3AlertPanel` passes `appointmentId` for non-appointment sessions
**File**: `src/components/expert/ExpertL3AlertPanel.tsx` line 97
**Problem**: Sets `callModal({ appointmentId: session.id })` but this is a blackbox session ID, not an appointment. `VideoCallModal` will query the `appointments` table for a `room_id` and find nothing — then create a NEW room instead of joining the existing one.
**Fix**: The panel already passes `existingRoomId={activeSession?.room_id}` on line 243, which is correct. But on line 165 (Rejoin Call), it passes `appointmentId: session.id` again, which triggers the wrong code path. Remove `appointmentId` from the callModal state entirely for this panel.

#### 8. Therapist L3 escalation: double status update
**File**: `src/components/therapist/TherapistDashboardContent.tsx` lines 282-290 and 358-370
**Problem**: When level >= 3, the code first updates `status: "escalated"` (line 288), then immediately updates again to `status: "active"` (line 367). The first update is redundant and causes a momentary status flicker that could trigger realtime listeners incorrectly.
**Fix**: Move the status logic into a single update by conditionally setting status only once based on whether an M.Phil expert is found.

#### 9. `cleanup-deleted-accounts` edge function is now orphaned
**File**: `supabase/functions/cleanup-deleted-accounts/index.ts`
**Problem**: The `AccountDeletion` component was refactored to only send deletion requests (no longer sets `deletion_requested_at`). The cleanup function still reads `deletion_requested_at` but it will never find any — it's dead code.
**Fix**: Delete the function, or leave it harmless. Not blocking.

#### 10. `delete-account` edge function is also orphaned
**File**: `supabase/functions/delete-account/index.ts`
**Problem**: No UI calls this function anymore after the AccountDeletion refactor. Dead code.

### Low Priority Issues

#### 11. `spend-credits` edge function still has old manual logic alongside RPC
**File**: `supabase/functions/spend-credits/index.ts`
**Problem**: The function was refactored to use `spend_credits_atomic` RPC but the old manual pool logic code was removed. However, it still uses `getClaims` (Issue #1 above) which makes the entire function non-functional.

#### 12. Missing `refund-blackbox-session` config in `config.toml`
**File**: `supabase/config.toml`
**Problem**: `refund-blackbox-session` is not listed in config.toml with `verify_jwt = false`, unlike other functions. Since Lovable deploys with `verify_jwt = false` by default this may not be a problem, but it's inconsistent.

#### 13. `TherapistDashboardContent` leaveCallRef never connected
**File**: `src/components/therapist/TherapistDashboardContent.tsx`
**Problem**: `leaveCallRef` is defined (line 75) and used during L3 escalation (line 481-483), but the `MeetingView`/`MeetingProvider` in the therapist dashboard doesn't wire `onLeaveReady` to populate this ref. The therapist's video call is rendered inline without passing the callback. So `leaveCallRef.current` is always null — the therapist never actually leaves the VideoSDK room during escalation.
**Fix**: Pass `onLeaveReady={(fn) => { leaveCallRef.current = fn; }}` to the MeetingView component.

#### 14. Peer Connect expiry refund — client-side only
**Files**: `src/hooks/usePeerConnect.ts` lines 115-131
**Problem**: Pending session expiry is detected client-side only (comparing timestamps in the query result map). If the student closes the browser, no server-side process triggers the refund. The `auto_expire_stale_peer_sessions` trigger only handles 2-hour expiry, not the 2-minute pending expiry with refund.
**Fix**: Consider a server-side cron/trigger for pending expiry refunds, or accept client-side detection as sufficient for MVP.

### Summary

| Priority | Count | Key Items |
|---|---|---|
| **Critical** | 5 | `getClaims` broken auth in 3 edge functions, `ai-transcribe` no auth + deprecated import |
| **Medium** | 5 | ExpertL3 wrong room join, therapist leave not wired, double status update, console warnings |
| **Low** | 4 | Dead code cleanup, config inconsistency, client-only expiry refund |

### Recommended Fix Order
1. Fix `getClaims` in `spend-credits`, `purchase-credits`, `grant-credits` (Critical — payments broken)
2. Add auth + fix imports in `ai-transcribe` (Critical — security hole)
3. Fix `ExpertL3AlertPanel` appointmentId/room join bug (Medium — handoff broken)
4. Wire `leaveCallRef` in therapist dashboard (Medium — therapist ghost in call)
5. Fix `EterniaLogo` forwardRef warning (Low — cosmetic)
6. Clean up dead code (Low)

