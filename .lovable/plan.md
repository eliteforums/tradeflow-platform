

## Plan: Fix BlackBox Therapist → Expert Handoff Flow

### Root Cause

The current L3 escalation has a critical bug: when the therapist escalates and reassigns the session to an expert, the `ExpertL3AlertPanel` opens `VideoCallModal` with `appointmentId={session.id}`. The modal then queries the **`appointments` table** for a `room_id` — but this is a **blackbox session ID**, not an appointment. The query returns nothing, so the modal creates a **brand new room**. The expert ends up in a different room than the student.

Additionally, the therapist doesn't gracefully exit the call — they just clear local state without leaving the VideoSDK meeting, so the student sees a phantom participant.

### Current Flow (Broken)
```text
Therapist clicks Escalate L3
  → Sets therapist_id = expert, status = "active", keeps room_id
  → Therapist clears local state (but doesn't leave VideoSDK room)
  → ExpertL3AlertPanel picks up session via realtime
  → Expert clicks "Accept & Join"
  → VideoCallModal queries appointments table for room_id → NOT FOUND
  → Creates NEW room → Expert and student in DIFFERENT rooms ✗
```

### Fixed Flow
```text
Therapist clicks Escalate L3
  → Sets therapist_id = expert, status = "active", keeps room_id
  → Therapist leaves VideoSDK meeting, then clears local state
  → ExpertL3AlertPanel picks up session via realtime
  → Expert clicks "Accept & Join"
  → VideoCallModal receives existingRoomId from blackbox session
  → Expert joins SAME room as student ✓
  → Therapist is already gone from the room ✓
```

### Changes

#### 1. `src/components/expert/ExpertL3AlertPanel.tsx`
- Pass `existingRoomId={activeSession?.room_id}` to `VideoCallModal` instead of `appointmentId={session.id}`
- Remove `appointmentId` prop (it's not an appointment)
- Add a notification sound/toast when a new L3 session appears with the expert assigned as `therapist_id`

#### 2. `src/components/therapist/TherapistDashboardContent.tsx`
- In `submitEscalation` for L3: before clearing `activeSession` and `token`, call the VideoSDK `leave()` method to properly disconnect from the room
- Store a ref to a leave function that `MeetingView` can provide via callback
- Send a notification to the assigned expert: insert into `notifications` table with type `"l3_handoff"` and metadata containing session ID, room ID, and reason

#### 3. `src/components/videosdk/MeetingView.tsx`
- Add optional `onLeaveReady` callback prop that passes the SDK `leave` function to the parent
- This lets the therapist dashboard call `leave()` programmatically during escalation before clearing state

### Files Modified
- `src/components/expert/ExpertL3AlertPanel.tsx` — Use `existingRoomId` instead of `appointmentId`
- `src/components/therapist/TherapistDashboardContent.tsx` — Proper VideoSDK leave on escalation + notification to expert
- `src/components/videosdk/MeetingView.tsx` — Expose leave function via callback

### Technical Details
- The `existingRoomId` prop on `VideoCallModal` already handles joining an existing room correctly (line 73-75 of the modal)
- The therapist's `MeetingView` is rendered inside a `MeetingProvider` which provides the `useMeeting().leave` hook — we expose it via a ref/callback
- Expert notification uses the existing `notifications` table with realtime subscription already active on the expert dashboard

