

## Fix: Arrow points to wrong card — should point back to the hovered card

### Problem
The tooltip is centered above the hovered card (`left-1/2 -translate-x-1/2`), but the arrow is positioned at `right-2` with a curve going right and down. This makes the arrow visually point toward the **next card** to the right instead of back down to the hovered card.

Looking at the reference image (image-30), the arrow should curve from the bubble downward and land on the **same card** that is hovered — specifically curving from the center/right of the bubble down toward the center of the card below.

### Fix

**File: `src/components/landing/TrustLogos.tsx`**

1. **Reposition the arrow**: Move the SVG from `right-2` to center it horizontally under the bubble, so it points straight down toward the hovered card.

2. **Redraw the curve**: The arrow should start from the bubble's bottom-center area, curve slightly to the right, then sweep back down to point at the card. Match the reference: a smooth S-curve that ends pointing downward at the card center.

3. **Adjust the SVG path**: New path starts from top-center, curves right then back down-left to land centered on the card. Arrow positioned at `left-1/2 -translate-x-1/2 -bottom-11` so it's always centered under the bubble (and thus over the hovered card).

### Changes (single file)

- **`src/components/landing/TrustLogos.tsx`** line 82: Change arrow positioning from `absolute -bottom-11 right-2` to `absolute -bottom-11 left-1/2 -translate-x-1/4` 
- **Lines 84-85**: Redraw SVG path to curve from top-left, sweep right, then curve back down-center — matching the reference where the arrow tip lands on the hovered card, not the neighbor
- **Lines 92-93**: Adjust arrowhead to match new path endpoint

