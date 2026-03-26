

## Fix: Duplicate Participant Tiles (4 tiles for 2 participants)

### Root Cause

The bug is a **double join**. In `VideoCallModal.tsx` (line 206) and `MobileBlackBox.tsx` (line 126):

```
<MeetingProvider
  joinWithoutUserInteraction={true}  // ← JOIN #1: SDK auto-joins
>
  <MeetingView
    autoJoin={true}                   // ← JOIN #2: calls join() again
  />
</MeetingProvider>
```

Both `joinWithoutUserInteraction` AND `autoJoin` trigger a join, causing each user to register twice in the VideoSDK room. Result: 2 real participants appear as 4 tiles.

### Fix

**Remove `joinWithoutUserInteraction={true}`** from all `MeetingProvider` instances. Let `MeetingView`'s `autoJoin` handle joining (it already requests mic permission first, which is the correct flow).

### Files to Change

1. **`src/components/videosdk/VideoCallModal.tsx`** (line 206)
   - Change `joinWithoutUserInteraction: true` to `joinWithoutUserInteraction: false`

2. **`src/components/mobile/MobileBlackBox.tsx`** (line 126)
   - Change `joinWithoutUserInteraction: true` to `joinWithoutUserInteraction: false`

3. **`src/components/expert/ExpertL3AlertPanel.tsx`** — check if it also uses `MeetingProvider` with the same pattern and fix accordingly.

### No other changes needed
The `MeetingView` auto-join logic with its single-attempt lock and mic permission request is already correct. This is purely removing the duplicate join trigger.

