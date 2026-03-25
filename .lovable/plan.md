

## Plan: Professional Card-Based Institution Manager

### Current State
The SPOC/Institutions tab shows institutions as compact rows with inline badges and buttons. It's functional but looks like a flat list — not a professional dashboard.

### New Design
Redesign `InstitutionManager.tsx` to display each institution as a rich, detailed card with:
- **Card header**: Institution name + status badge + plan badge + type badge
- **Stats row**: Student count, credit pool, creation date, Eternia code (copyable)
- **Action buttons**: Bulk IDs, Toggle active, View details (click card)
- **Gradient accent** on the left border based on plan type (basic=teal, premium=purple, enterprise=amber)
- **Progress indicator** showing credit pool usage or student count relative to plan limits

### Changes

#### `src/components/admin/InstitutionManager.tsx` — Full card redesign

Replace the current flat list rows (lines 246-284) with a responsive grid of cards (`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3`). Each card includes:

1. **Top section**: Gradient left-border accent by plan. Institution name (large), type badge, active/inactive indicator dot
2. **Middle section**: 4 mini-stat boxes — Students, Credit Pool, Eternia Code, Created date
3. **Bottom section**: Action bar with Bulk IDs button, toggle switch, and a "View Details →" link
4. **Hover effect**: Subtle border glow + slight scale

Keep all existing functionality (create form, bulk dialog, copy code, toggle active) intact — only the card layout changes.

### Files Modified
- `src/components/admin/InstitutionManager.tsx` — Redesign institution list from flat rows to professional detailed cards in a responsive grid

### No database or backend changes needed.

