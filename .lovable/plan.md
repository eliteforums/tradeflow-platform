

## Plan: Fix Duplicate Participant Rendering in Calls

### Root Cause

The auto-join retry logic in `MeetingView.tsx` (lines 118-136) calls `join()` up to 3 times with 5-second intervals. If the first `join()` succeeds but the `onMeetingJoined` callback fires slightly after the 5s retry timer, a second `join()` fires — creating a duplicate local participant entry in the `participants` Map. This results in 3 tiles for 2 people (the local user rendered twice + one remote).

Additionally, for audio-only BlackBox calls, rendering the local participant's tile is unnecessary — the user doesn't need to see their own avatar/audio indicator.

### Fix

#### 1. `src/components/videosdk/MeetingView.tsx`

**Prevent duplicate joins:**
- In the `attemptJoin` retry timer (line 133-135), add a check: if `joined === "JOINED"` or `joinSucceeded.current === true`, don't retry
- Clear the retry timer immediately in `onMeetingJoined`

**Filter local participant for audio-only:**
- When `audioOnly` is true, filter out the local participant from the rendered grid using `isLocal` check from `useParticipant`
- Since we can't call `useParticipant` inside the map without a component, filter by checking `participants` entries: the VideoSDK `participants` Map keys include the local ID — filter it out by comparing against the local participant ID from `useMeeting`

**Implementation:**
- Extract `localParticipant` from `useMeeting()` (it provides `localParticipant` object)
- Filter: `const participantIds = [...participants.keys()].filter(id => !(audioOnly && id === localParticipant?.id))`
- Render `participantIds` instead of `[...participants.keys()]`

### Files Modified
- `src/components/videosdk/MeetingView.tsx` — Filter local participant in audio-only mode, fix retry race condition

