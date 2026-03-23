

## Plan: Remove Call Function from Peer Connect + PRD Alignment

### What the PRD says (Section 4.2)
Peer Connect is an **intern-moderated anonymous chat** system where:
- Student sees available interns with training badge, focus areas, availability status
- Student selects intern, initiates session request; intern must **accept** within a time window
- Real-time **chat** communication (text-based)
- Interns can flag/escalate sessions
- 20 ECC per completed session

The PRD mentions "audio call or chat" but per your request, **calls will be removed entirely**.

### Changes

#### 1. Remove call functionality from Desktop `PeerConnect.tsx`
- Remove `Phone` icon import and the call button from the chat header (lines 336-343)
- Remove `callModal` state and the `LazyVideoCallModal` / `Suspense` wrapper
- Remove `ensureSessionRoom` from the hook destructure
- Remove the lazy import of `VideoCallModal`

#### 2. Remove call functionality from Mobile `MobilePeerConnect.tsx`
- Remove `Phone` icon import and the call button from the chat header (lines 210-214)
- Remove `callModal` state and the `VideoCallModal` component at bottom
- Remove `ensureSessionRoom` from the hook destructure

#### 3. Clean up `usePeerConnect.ts`
- Remove `ensureSessionRoom` helper function and its export (it creates VideoSDK rooms)
- Remove `createVideoSDKRoom` and `getVideoSDKToken` imports since they're no longer needed

### Files Modified
- `src/pages/dashboard/PeerConnect.tsx` — Remove call button, modal, lazy import
- `src/components/mobile/MobilePeerConnect.tsx` — Remove call button, modal
- `src/hooks/usePeerConnect.ts` — Remove `ensureSessionRoom`, VideoSDK imports

