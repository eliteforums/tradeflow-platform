

## Plan: Elevate Institution Cards UI

### Problem
The current cards use small text, cramped stat boxes, and minimal visual hierarchy. The layout feels utilitarian rather than polished.

### Redesign

#### `src/components/admin/InstitutionManager.tsx` — Visual overhaul

**Header section improvements:**
- Add a subtle gradient background header strip per plan type (amber gradient for enterprise, violet for premium, teal for basic)
- Larger institution name (text-lg font-bold), with a colored dot indicator for active/inactive status instead of text badge
- Institution type shown as a subtle icon + label row below the name

**Stats section improvements:**
- Replace the 2x2 grid with a clean horizontal stats bar (3 key metrics: Students, Credits, Created) with dividers between them
- Larger stat values with colored accents
- Eternia Code gets its own prominent row below stats — full-width with a styled copy button and monospace font on a dark/muted strip

**Action bar improvements:**
- Full-width action bar with proper spacing
- "Bulk IDs" as a primary-styled button, "Manage" as outline, toggle as a proper Switch component instead of icon-only button
- Add a "View Details" text button if `onSelectInstitution` is provided

**Overall card polish:**
- Increase card padding and spacing (p-5 instead of p-4)
- Add a subtle top gradient bar (4px height) colored by plan type
- Rounded-2xl corners, stronger shadow on hover (shadow-lg)
- Remove border-l-4 accent in favor of the top gradient bar for a cleaner look

**Empty state:**
- Larger illustration area, more inviting copy, prominent "Add Institution" CTA button

### Files Modified
- `src/components/admin/InstitutionManager.tsx` — Complete card visual redesign with gradient headers, horizontal stats, prominent code display, polished actions

### No backend changes needed.

