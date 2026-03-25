

## Plan: Redesign Institution Cards to Full-Width Bar Layout

### Problem
The current 3-column grid of small cards looks cramped — institution names get truncated, stats are squeezed, and the overall layout feels cluttered. The user wants large, full-width "bar-style" cards that are clean and easy to scan.

### Redesign Approach

#### `src/components/admin/InstitutionManager.tsx` — Switch to stacked bar cards

**Layout change:**
- Replace `grid-cols-1 md:grid-cols-2 xl:grid-cols-3` with a single-column stack (`space-y-4`)
- Each card becomes a full-width horizontal bar

**Card structure (single horizontal row per institution):**
```text
┌─────────────────────────────────────────────────────────────────────────┐
│ [gradient left bar]                                                     │
│  ● Institution Name        PREMIUM     53 Students  5,000 Credits      │
│    University                          Code: ELIT2026P70  [Copy]       │
│                                        [Bulk IDs] [Details] [Toggle]   │
└─────────────────────────────────────────────────────────────────────────┘
```

**Specific changes:**
- 4px left gradient bar (colored by plan type) instead of top bar
- Left section: active dot + full institution name (no truncation) + type below
- Center section: plan badge + horizontal stats (Students, Credits, Created) inline with proper spacing
- Right section: Eternia code with copy button + action buttons (Bulk IDs, Details, Toggle)
- All content in one or two rows — no nested stat boxes or separate code strips
- Generous padding (`p-5 px-6`), `rounded-xl`, subtle hover effect
- Full institution name visible — no truncation since cards are full-width
- Responsive: on mobile, stack the sections vertically within each bar card

### Files Modified
- `src/components/admin/InstitutionManager.tsx` — Replace grid layout with full-width bar cards

### No backend changes needed.

