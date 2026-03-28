

## Fix: Call Transcription Capture — Root Cause & Solution

### Root Causes (3 blocking issues)

1. **Audio monitor never starts for Expert/Intern calls** — `VideoCallModal` only passes `enableMonitoring={true}` from the BlackBox therapist flow. Expert appointment calls and intern peer calls don't enable monitoring, so the speech recognition buffer is always empty and `captureSnippetRef.current()` returns `""`.

2. **Only sync capture is wired** — `MeetingView` exposes `captureEscalationSnippet` (sync, 10s before only) via `onCaptureSnippetReady`. The async ±10s method (`captureEscalationSnippetAsync`) exists in the hook but is never exposed to parent components.

3. **Escalation submit is synchronous** — `submitEscalation.mutate()` calls `captureSnippetRef.current()` immediately, sends whatever is there (usually `""` or `null`), and fires the backend call. There's no await for the 10s-after window.

4. **Missing escalator role tag** — The `escalate-emergency` edge function stores the `escalated_by` user ID but doesn't tag the role of who escalated.

### Fix Plan

#### A. Enable audio monitoring for all staff calls

**`VideoCallModal.tsx`**: Always pass `enableMonitoring={true}` when the call is opened by staff (expert/intern/therapist). The component already accepts the prop — it just needs to be set to `true` from all callers.

**`ExpertDashboardContent.tsx`** (line 874): Add `enableMonitoring={true}` to the `VideoCallModal`.

**`InternDashboardContent.tsx`**: Same — add `enableMonitoring={true}` to the `VideoCallModal` for peer sessions.

**`MobileExpertDashboard.tsx`** and **`MobileInternDashboard.tsx`**: Same change.

#### B. Expose async capture and use it

**`MeetingView.tsx`**: Change `onCaptureSnippetReady` to expose the async capture function instead of the sync one:
- Change type from `(captureFn: () => string)` to `(captureFn: () => Promise<string>)`
- Pass `audioMonitor.captureEscalationSnippetAsync` instead of `audioMonitor.captureEscalationSnippet`

**All callers** (`ExpertDashboardContent`, `InternDashboardContent`, mobile variants): Update `captureSnippetRef` type from `(() => string) | null` to `(() => Promise<string>) | null`.

#### C. Make escalation submit async-aware

**`ExpertDashboardContent.tsx`**: In `submitEscalation.mutationFn`, await the capture:
```typescript
const snippet = captureSnippetRef.current 
  ? await captureSnippetRef.current() 
  : null;
```
Show a toast like "Capturing transcript (10s)..." so the user knows to wait.

Same pattern for `InternDashboardContent`, `MobileExpertDashboard`, `MobileInternDashboard`.

#### D. Tag escalator role in backend

**`escalate-emergency/index.ts`**: Look up the caller's role from `user_roles` table and include it in `trigger_snippet` JSON as `escalated_by_role`.

#### E. Admin dashboard — add role display

**`EscalationManager.tsx`**: When rendering `parsed.escalated_by_role`, show the role who escalated. Already displays most fields correctly — just add the role badge.

### Files to Edit
1. `src/components/videosdk/MeetingView.tsx` — expose async capture
2. `src/components/expert/ExpertDashboardContent.tsx` — enable monitoring, async snippet capture
3. `src/components/intern/InternDashboardContent.tsx` — same
4. `src/components/mobile/MobileExpertDashboard.tsx` — same
5. `src/components/mobile/MobileInternDashboard.tsx` — same
6. `supabase/functions/escalate-emergency/index.ts` — add escalator role tag
7. `src/components/admin/EscalationManager.tsx` — display escalator role

