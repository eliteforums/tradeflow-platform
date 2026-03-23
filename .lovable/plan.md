
Issue restated: therapist can join the BlackBox room, but student stays on “Setting up secure connection…” and then fails.  
Do I know what the issue is? Yes. The student flow relies on hidden `MeetingView` auto-join, but auto-join is gated by `sdkMeetingId` in `MeetingView`. If that value isn’t ready, join never starts. Therapist can still recover by clicking the visible “Join Session” button, while student cannot (hidden view), so student times out.

Implementation plan (targeted, not a full rewrite):

1) Fix auto-join deadlock in `src/components/videosdk/MeetingView.tsx`
- Remove dependency on `sdkMeetingId` for auto-join start.
- Trigger `join()` based on `autoJoin + meetingId prop` (which is already known), with retry control.
- Keep retry timer cancellation and `joinSucceeded` guard.
- Ensure timeout path sends `onJoinError` consistently with a concrete message.

2) Add provider-level auto-join safety net
- In all MeetingProvider call sites used for BlackBox:
  - `src/pages/dashboard/BlackBox.tsx`
  - `src/components/mobile/MobileBlackBox.tsx`
  - `src/components/therapist/TherapistDashboardContent.tsx`
  - `src/components/videosdk/VideoCallModal.tsx`
- Pass `joinWithoutUserInteraction` so room entry does not depend on a visible manual button.

3) Give student a real fallback when hidden join fails
- Keep current orb UI, but when `callState === "failed"` show:
  - room/session reference (`activeSession.room_id`)
  - explicit error reason (from join error / timeout)
  - retry action that remounts provider and retriggers join.
- Avoid “silent failure” where hidden `MeetingView` is the only place with recovery UI.

4) Strengthen state/error tracking in `src/hooks/useBlackBoxSession.ts`
- On 30s joining timeout, also persist `last_join_error` (currently this path can fail without persisted reason).
- Ensure transition from `joining -> failed` is deterministic and debuggable.
- Keep polling+realtime behavior unchanged otherwise.

5) PRD alignment checks (from uploaded tech spec)
- Preserve same room continuity (no room swap for basic connect flow).
- Ensure student auto-enters accepted session without manual action.
- Keep escalation/host-transfer behavior untouched.

Validation plan (must run end-to-end):
- Student requests session → therapist accepts → student auto-joins without seeing manual join UI.
- Verify both `therapist_joined_at` and `student_joined_at` are written.
- Force failure (deny mic / network drop) and confirm student gets actionable retry + visible error.
- Re-test on mobile BlackBox flow with same accept/connect sequence.
