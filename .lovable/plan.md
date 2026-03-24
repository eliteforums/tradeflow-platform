

## Plan: Fix BlackBox AI Transcription Model — Connect All Pieces

### Problem
The BlackBox AI transcription chain is broken at the expert/therapist level:

1. **`ExpertL3AlertPanel` renders `<VideoCallModal>` without `enableMonitoring={true}`** — so when an expert joins an L3 session via this panel, no audio monitor runs
2. **`captureEscalationSnippet` prop is never passed** to `ExpertL3AlertPanel` in either desktop or mobile expert dashboards — so escalation captures empty string instead of ±10s transcript
3. **The `VideoCallModal` inside `ExpertL3AlertPanel` doesn't pass `isTherapistView`** — so silence detection and therapist controls don't appear
4. **No risk level feedback to expert** — the AI classifies risk but the expert only sees it inside the `MeetingView` component, which for L3 sessions is rendered inside `ExpertL3AlertPanel`'s own modal

### Root Cause
The `ExpertL3AlertPanel` has its own standalone `VideoCallModal` that doesn't wire up monitoring. The `captureEscalationSnippet` can only come from `useAudioMonitor` which lives inside `MeetingView`, but the escalation button is outside `MeetingView` in the panel.

### Fix Strategy
Wire `enableMonitoring`, `isTherapistView`, and `sessionType="blackbox"` through the `ExpertL3AlertPanel`'s `VideoCallModal`, and use a ref-based approach to expose `captureEscalationSnippet` from `MeetingView` back up to the panel.

### Changes

#### 1. `src/components/expert/ExpertL3AlertPanel.tsx`
- Pass `enableMonitoring={true}`, `isTherapistView={true}`, `sessionType="blackbox"`, `sessionId={activeSession?.id}` to its `VideoCallModal`
- Add a `captureSnippetRef` (React ref) that `MeetingView` populates with its `audioMonitor.captureEscalationSnippet`
- Use this ref in `handleEmergencyEscalation` instead of the prop
- Remove the unused `captureEscalationSnippet` prop (no parent passes it)
- Add `onRiskDetected` callback to show a toast when AI flags risk during the session

#### 2. `src/components/videosdk/VideoCallModal.tsx`
- Accept and forward `sessionType`, `enableMonitoring`, `isTherapistView`, `onCaptureSnippetReady` props to `MeetingView`

#### 3. `src/components/videosdk/MeetingView.tsx`
- Accept optional `onCaptureSnippetReady` callback prop
- When joined and audio monitor initializes, call `onCaptureSnippetReady(audioMonitor.captureEscalationSnippet)` so the parent can capture ±10s transcript on demand

#### 4. `src/components/expert/ExpertDashboardContent.tsx` + `src/components/mobile/MobileExpertDashboard.tsx`
- Remove the bare `<ExpertL3AlertPanel />` usage (no props needed anymore since it self-manages its capture ref)

### Result
- AI reads live transcript during BlackBox sessions ✓
- Risk level badge visible to therapist/expert during call ✓
- On escalation click: ±10s transcript captured and logged ✓
- Event logged via `escalate-emergency` edge function ✓

### Files Modified
- `src/components/expert/ExpertL3AlertPanel.tsx` — Wire monitoring + ref-based snippet capture
- `src/components/videosdk/VideoCallModal.tsx` — Forward new props
- `src/components/videosdk/MeetingView.tsx` — Expose capture function via callback

