

## Fix: Partner hover tooltip + arrow not visible

### Root cause
The tooltip is positioned `absolute bottom-full` (above the card) inside a container with `overflow-hidden`. The `overflow-hidden` on the scroll wrapper (line 40) clips everything that extends beyond its bounds — the tooltip never renders visibly.

### Fix

**File: `src/components/landing/TrustLogos.tsx`**

1. Remove `overflow-hidden` from the scroll wrapper and move it to an outer wrapper that has enough vertical padding to accommodate the tooltip.
2. Give the outer section enough top padding so the tooltip bubble + arrow have room to render above the cards without being clipped.
3. Alternatively (simpler): change the tooltip to appear **below** the card (`top-full mt-3`) instead of above, since there's natural space below — matching the reference image which shows the arrow pointing downward from bubble to card.

**Chosen approach** (matches reference image): Keep tooltip above, but fix clipping:
- Wrap the scroll div in a container with `overflow-x: hidden; overflow-y: visible` (or use `clip` with `clip-path` that only clips horizontally).
- The simplest reliable fix: set `overflow: visible` on the immediate parent of the cards and use a grandparent with `overflow-x: clip` (CSS `clip` doesn't affect positioned descendants the same way `hidden` does — actually it does). 

**Actual simplest fix**: Move the tooltip to render in a **portal-like** position by pulling it outside the `overflow-hidden` container using a fixed/portal approach — but that's complex.

**Pragmatic fix**:
- Change `overflow-hidden` to `overflow-x-clip overflow-y-visible` on the scroll container. CSS `overflow-x: clip` clips the horizontal scroll without creating a new clipping context for `overflow-y`, unlike `overflow: hidden` which forces both axes to clip when one is set to hidden/scroll.

This single class change should make the tooltip visible above the cards while still masking the horizontal scroll edges.

### Changes
- **Line 40**: Replace `overflow-hidden` with `overflow-x-clip overflow-y-visible`
- Add `py-16` or similar vertical padding to ensure the tooltip has rendering space within the section

