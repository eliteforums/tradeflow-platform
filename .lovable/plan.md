

## Fix: Video Call Modal Buttons Cut Off

### Problem
The `VideoCallModal` uses `h-[80vh]` with `overflow-hidden` on the container. Inside, `MeetingView` has a `flex flex-col h-full` layout where the participant grid (`flex-1`) takes all available space, but the `MeetingControls` bar at the bottom gets clipped because the parent container's overflow is hidden and there's no room guarantee for the controls.

### Fix

**File: `src/components/videosdk/VideoCallModal.tsx`**
- Change the content area (line 167) from `<div className="flex-1">` to `<div className="flex-1 flex flex-col overflow-hidden">` so MeetingView can properly flex within it without clipping.

**File: `src/components/videosdk/MeetingView.tsx`**
- On the main joined container (line 323), ensure the controls bar is never clipped by adding `min-h-0` to the flex column and making the participant grid area scrollable while controls stay fixed:
  - Line 323: Change `flex flex-col h-full relative` to `flex flex-col h-full min-h-0 relative`
  - Line 342: Ensure `flex-1 min-h-0 overflow-y-auto` on the participant grid area so it shrinks to fit

**File: `src/components/videosdk/MeetingControls.tsx`**
- Add `shrink-0` to the controls bar (line 14) so it never gets compressed: `flex items-center justify-center gap-3 p-4 bg-card border-t border-border shrink-0`

### Files to Edit
- `src/components/videosdk/VideoCallModal.tsx` — flex layout fix on content wrapper
- `src/components/videosdk/MeetingView.tsx` — add `min-h-0` to flex container
- `src/components/videosdk/MeetingControls.tsx` — add `shrink-0` to prevent clipping

