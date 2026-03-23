

## Fix: Partner hover tooltip arrow to match reference images

### What needs to change

Looking at the reference images:
- **Image 28**: Tooltip bubble sits above-left of the card. A smooth curved arrow starts from the bubble's right side and curves downward-right, pointing at the card below.
- **Image 29**: Shows the text style — bold first line with emoji, lighter second line. Arrow is a thick, smooth downward-curving stroke with an arrowhead.

### Current issues
1. The arrow SVG path doesn't match the reference — it's too small and the curve shape is wrong.
2. The tooltip + arrow layout uses `flex items-center gap-1` which places them side-by-side horizontally, but the reference shows the bubble on top-left with the arrow curving down-right from it.
3. The arrow should be positioned to the right of the bubble, curving downward toward the hovered card.

### Plan

**File: `src/components/landing/TrustLogos.tsx`**

1. **Restructure tooltip layout**: Change from horizontal flex to a positioned layout where the bubble is top-left and the arrow SVG is placed at the bottom-right of the bubble, curving downward toward the card.

2. **Redraw the SVG arrow**: Create a new path that matches the reference — a smooth curve starting from top-left, sweeping right and down, ending with a proper arrowhead. Approximately 60×50px, thicker stroke (~2.5-3px), round caps.

3. **Position the arrow**: Place the SVG absolutely so it hangs from the right edge of the bubble and points down toward the card. The arrow tip should visually point at or near the hovered card.

4. **Keep text styling**: Bold first line + emoji, smaller muted second line — already correct.

### Changes (single file)

- **`src/components/landing/TrustLogos.tsx`** lines 64-100:
  - Replace the `flex items-center gap-1` wrapper with a `flex flex-col items-end` layout
  - Bubble on top, arrow SVG below it offset to the right
  - New SVG: curve from top-left → down-right with arrowhead, matching the hand-drawn style in the reference
  - Adjust `mb-4` to `mb-2` since the arrow itself bridges the gap to the card

