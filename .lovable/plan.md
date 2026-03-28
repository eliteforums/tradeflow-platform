

## Fix: Call Transcription Capture & Storage on Escalation

### Problem Summary
The transcription snippet system has the plumbing in place (audio monitor buffer, `captureEscalationSnippet` function, backend `trigger_snippet` storage, admin/SPOC display) but it's **never actually captured** at escalation time in most flows. The `transcript_snippet` is hardcoded to `null` in 4 out of 5 escalation paths.

### Issues Identified

1. **Expert appointment escalation** (`ExpertDashboardContent.tsx` line 220): `transcript_snippet: null` — never captures from active call
2. **Mobile expert escalation** (`MobileExpertDashboard.tsx` line 118): `transcript_snippet: null`
3. **Intern escalation** (`InternDashboardContent.tsx` line 140): `transcript_snippet: null`
4. **Mobile intern escalation** (`MobileInternDashboard.tsx` line 116): `transcript_snippet: null`
5. **L3 panel** (`ExpertL3AlertPanel.tsx`): Works correctly — uses `captureSnippetRef` ✅
6. **In-call escalation button** (`MeetingControls.tsx`): Fires `onEscalate` but does NOT capture transcript before triggering the dialog
7. **`captureEscalationSnippet`** only captures 10s **before** — not 10s after. The requirement is ±10s (before + after).
8. **Admin dashboard** already renders `transcript_snippet` from parsed JSON ✅ — but it's always null so nothing shows.

### Plan

#### A. Capture ±10s transcript (before + after)

**`useAudioMonitor.ts`**: Add a new method `captureEscalationSnippetAsync(beforeMs, afterMs)` that:
1. Immediately captures `beforeMs` worth of buffer (existing logic)
2. Continues recording for `afterMs` (default 10s)
3. Returns a Promise that resolves with the combined "before + after" text

This allows callers to await the full ±10s window.

#### B. Wire transcript capture into all escalation flows

**`ExpertDashboardContent.tsx`**:
- Store a `captureSnippetRef` (like L3 panel does)
- Pass `onCaptureSnippetReady` to `VideoCallModal`
- In `submitEscalation`, call `captureSnippetRef.current?.()` and send the result as `transcript_snippet`
- For post-session escalations (no active call), leave as null (no audio to capture)

**`MobileExpertDashboard.tsx`**: Same pattern — wire `captureSnippetRef` through VideoCallModal

**`InternDashboardContent.tsx`** and **`MobileInternDashboard.tsx`**:
- Same pattern — add `captureSnippetRef`, pass through VideoCallModal for peer sessions
- Wire into the escalation mutation

**`VideoCallModal.tsx`**: Already supports `onCaptureSnippetReady` prop ✅ — just needs to be passed from more callers

#### C. In-call escalation button captures before triggering dialog

**`MeetingControls.tsx` / `MeetingView.tsx`**: The `onEscalate` callback should first capture the snippet, then open the escalation dialog with the snippet pre-attached. Update `onEscalate` signature to pass the captured snippet.

#### D. No backend changes needed
The `escalate-emergency` edge function already stores `transcript_snippet` in the `trigger_snippet` JSON. Admin and SPOC dashboards already parse and display it. Once the frontend actually sends non-null values, everything will display correctly.

### Files to Edit
1. `src/hooks/useAudioMonitor.ts` — add async ±10s capture method
2. `src/components/expert/ExpertDashboardContent.tsx` — wire captureSnippetRef, use in escalation
3. `src/components/mobile/MobileExpertDashboard.tsx` — same
4. `src/components/intern/InternDashboardContent.tsx` — wire captureSnippetRef for peer sessions
5. `src/components/mobile/MobileInternDashboard.tsx` — same
6. `src/components/videosdk/MeetingView.tsx` — pass captured snippet via onEscalate callback
7. `src/components/videosdk/MeetingControls.tsx` — no change needed (already wired)

