

## Fix: BlackBox Call Controls Visibility & Layout

### Problem

During an active BlackBox call (student side), the call control buttons (Mute, Video, Hangup) can be misaligned, overlapping, or partially hidden because:

1. **Desktop (`BlackBox.tsx`)**: The outer container uses `min-h-[calc(100vh-6rem)]` with `-mt-6`, and the controls section at the bottom (`pb-8 pt-6`) competes with the flex-1 content area. The MeetingProvider wrapper uses `position: absolute` which can cause the controls to sit behind other elements depending on stacking context.

2. **Mobile (`MobileBlackBox.tsx`)**: Controls are inside `pb-24` padding zone meant to avoid the bottom nav, but the flex layout (`justify-between`) can cause the controls to be pushed off-screen or overlap with the NovaOrb when the viewport is short.

3. **Both**: The controls div is not pinned — it flows with content, so on smaller viewports or during state transitions, it can shift unpredictably.

### Fix

**Pin the bottom controls bar** in both desktop and mobile so it stays fixed at the bottom of the viewport, always visible and properly spaced above any bottom navigation.

#### File: `src/pages/dashboard/BlackBox.tsx`
- Change the bottom controls container from a flowing `div` to a **sticky/fixed bottom bar** with proper z-index
- Add a background blur/card treatment so controls don't overlap content
- Ensure the MeetingProvider hidden wrapper doesn't interfere with stacking (add `z-index: -1`)

#### File: `src/components/mobile/MobileBlackBox.tsx`
- Same fix: pin controls to bottom with `fixed` or `sticky` positioning
- Account for mobile bottom nav height (~5rem) with proper `bottom` offset
- Add backdrop blur background for visual clarity

### Specific Changes

**Desktop (`BlackBox.tsx`, lines 178-217)**:
- Replace `<div className="pb-8 pt-6 flex items-center justify-center gap-4">` with a sticky bottom bar: `<div className="sticky bottom-0 z-10 py-6 flex items-center justify-center gap-4 bg-background/80 backdrop-blur-sm">`
- On the hidden MeetingProvider wrapper (line 140-145), add `zIndex: -1` to prevent stacking interference

**Mobile (`MobileBlackBox.tsx`, lines 169-203)**:
- Replace `<div className="pt-4 flex items-center justify-center gap-4">` with a fixed bottom bar: `<div className="fixed bottom-20 left-0 right-0 z-20 py-4 flex items-center justify-center gap-4 bg-background/80 backdrop-blur-sm">`
- This positions controls above the mobile bottom nav (bottom-20 = 5rem)

### Files to Edit

| File | Change |
|------|--------|
| `src/pages/dashboard/BlackBox.tsx` | Sticky bottom controls bar, z-index fix on hidden wrapper |
| `src/components/mobile/MobileBlackBox.tsx` | Fixed bottom controls bar above mobile nav |

