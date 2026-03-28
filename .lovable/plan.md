
## Platform Audit — Issues Found

After reviewing all modules across the platform, here are the issues discovered:

### Issues Found

**1. Peer Connect: Credit Check Mismatch (Bug)**
- `PeerConnect.tsx` line 140 checks `creditBalance < 20` to enable session start
- But `usePeerConnect.ts` line 350 checks for `18 ECC` and deducts 18 on accept
- This means students with 18-19 credits are blocked from starting sessions when they should be able to
- **Fix**: Change the check in `PeerConnect.tsx` from `< 20` to `< 18`

**2. MobileBlackBox: Non-Lazy Import of VideoSDK (Build Issue)**
- `MobileBlackBox.tsx` line 6-7 imports `MeetingProvider` and `MeetingView` eagerly (not lazy)
- `BlackBox.tsx` (desktop) correctly uses `lazy(() => import(...))` for both
- This means the full VideoSDK bundle is loaded on every mobile page visit even before a call is needed
- **Fix**: Use `lazy()` + `Suspense` for `MeetingProvider` and `MeetingView` in MobileBlackBox, matching the desktop pattern

**3. Dashboard: Conditional Navigate Before Hooks (React Rules Violation)**
- `Dashboard.tsx` lines 33-37: `Navigate` components are returned before the `useIsMobile()` hook on line 39 is guaranteed to run
- React rules require hooks to run in the same order every render — early returns before hooks violate this
- Currently works because `useIsMobile()` is called before the returns, but the structure is fragile
- **Fix**: Move the mobile check above the role redirects, or restructure to ensure consistent hook execution

**4. SPOC Dashboard: Missing `session_id` in Escalation Insert (Functional Gap)**
- `escalate-emergency` edge function line 210-221: when creating the escalation request, it doesn't populate `session_id` field
- The insert uses `trigger_snippet` JSON which contains the session_id, but the dedicated `session_id` column on `escalation_requests` is left null
- This means queries filtering by `session_id` won't find these escalations
- **Fix**: Add `session_id: sessionRef.id` to the escalation insert

**5. Profile: `user_private` Upsert Missing `onConflict` in Emergency Save (Desktop)**
- `Profile.tsx` line 156-163: `upsert` for emergency contact uses `{ onConflict: "user_id" }` — correct
- But the student ID verification upsert on line 114-120 also correctly uses `onConflict: "user_id"`
- Both are fine. No issue here upon closer inspection.

**6. Therapist Dashboard: `MeetingProvider` and `MeetingView` Eagerly Imported (Performance)**
- `TherapistDashboardContent.tsx` lines 9-10 eagerly import `MeetingProvider` and `MeetingView`
- These heavy VideoSDK components should be lazy-loaded since they're only needed during active calls
- **Fix**: Use `lazy()` imports like the desktop BlackBox component

**7. Auth Context: Race Condition in `onAuthStateChange` vs `getSession` (Edge Case)**
- `AuthContext.tsx` lines 85-113: Both `onAuthStateChange` and `getSession` can fire, potentially loading user data twice
- The `fetchingRef` guard partially prevents this, but `setIsLoading(false)` could fire from `getSession` before `onAuthStateChange` finishes loading data
- This could cause a brief flash where `isLoading=false` but `profile=null`
- **Impact**: Low — the `setTimeout(100)` in `onAuthStateChange` usually resolves this, but it's a timing fragility

**8. AI Moderate: In-Memory Rate Limiter Resets on Cold Start (Known Limitation)**
- `ai-moderate/index.ts` lines 9-16: Rate limiter uses an in-memory `Map`
- Edge functions cold-start frequently, resetting the rate limiter each time
- **Impact**: Low — the DB-level `check_rate_limit` function exists but isn't used here

### Summary

| # | Issue | Severity | Module |
|---|-------|----------|--------|
| 1 | Credit check mismatch (20 vs 18) | **Medium** | Peer Connect |
| 2 | Non-lazy VideoSDK import | **Low** | Mobile BlackBox |
| 3 | Conditional Navigate before hooks | **Low** | Dashboard |
| 4 | Missing `session_id` in escalation insert | **Medium** | Escalation |
| 5 | Eager VideoSDK import | **Low** | Therapist Dashboard |
| 6 | Auth race condition | **Low** | Auth Context |
| 7 | In-memory rate limiter | **Low** | AI Moderate |

### Recommended Fix Priority
1. Fix credit check mismatch (20 → 18) — immediate
2. Add `session_id` to escalation insert — immediate  
3. Lazy-load VideoSDK in MobileBlackBox and TherapistDashboard — next iteration
4. Other low-severity items — backlog

All Phase 6 features (ID deletion, escalation flow, SPOC display, transcription storage, call UI, peer connect indication, AI transcribe, APAAR verification) are correctly implemented. The issues above are pre-existing or minor gaps.
