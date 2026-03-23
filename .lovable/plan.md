

## Fix: Arrow positioning and curve to match reference image

### Problem
The reference image (image-31) shows:
- The tooltip bubble sits above and slightly LEFT of center
- The arrow is a simple **)** parenthesis-shaped curve positioned at the **right edge** of the bubble, curving downward toward the card
- It's NOT centered under the bubble — it hangs off the right side

Current code centers both the tooltip and arrow with `left-1/2 -translate-x-1/2`, which doesn't match the reference.

### Fix

**File: `src/components/landing/TrustLogos.tsx`**

1. **Reposition the arrow SVG**: Move from `left-1/2 -translate-x-1/2` to `right-0` or `right-2` so it hangs off the right edge of the bubble, matching the reference.

2. **Redraw the curve as a simple ")" arc**: The reference shows a clean half-parenthesis curve — starts at the top, arcs right, then curves back down-left. Much simpler than the current S-curve. New path: approximately `M12 2 C 40 8, 40 32, 18 42` — a single cubic bezier that bulges right then sweeps down-left.

3. **Adjust arrowhead**: Point the arrowhead downward-left to match the curve's end direction: `M14 36 L18 42 L24 38`.

4. **Keep tooltip centered**: The bubble itself stays at `left-1/2 -translate-x-1/2` so it's above the hovered card — only the arrow moves to the right edge.

### Changes summary
- Line 82: Change arrow class from `left-1/2 -translate-x-1/2` to `right-0`
- Lines 84-85: Redraw main path as a simple right-bulging arc
- Lines 92-93: Update arrowhead coordinates to match new path end

