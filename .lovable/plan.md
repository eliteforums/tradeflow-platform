

## Plan: Fix Expert Panel Responsive Issues

### Problems Identified

1. **Desktop Schedule tab controls overflow** — The calendar controls bar (line 365-389 in `ExpertDashboardContent.tsx`) crams 6+ elements in a single `flex justify-between` row: month nav arrows, month label, Month/Week toggle, Add Slot, Block Slot, and Recurring buttons. On narrower desktop screens (~1024-1200px) these overflow horizontally.

2. **Desktop tab bar compresses** — The 5-tab bar uses `flex-1` on each tab, making labels unreadable at narrower widths.

3. **Desktop calendar grid too rigid** — The 7-column calendar with `min-h-[80px]` cells doesn't adapt to smaller screens.

4. **Mobile expert dashboard has redundant navigation** — `MobileExpertDashboard` renders its own pill-style tab bar while `DashboardLayout` also renders a fixed bottom nav for experts (Dashboard, Queue, Schedule, Profile). Users see two navigation systems that conflict.

### Changes

**File: `src/components/expert/ExpertDashboardContent.tsx`**
- Schedule controls: Stack into 2 rows on smaller screens — top row for calendar nav + month/week toggle, bottom row for action buttons (Add Slot, Block Slot, Recurring). Use `flex-wrap` and responsive classes.
- Tab bar: Add `overflow-x-auto` with `shrink-0` on tabs so they scroll instead of compress. Hide labels on smaller screens, show only icons below `xl`.
- Calendar cells: Reduce `min-h-[80px]` to `min-h-[60px]` on smaller screens via responsive class.
- Header row: Stack title and AI monitor badge vertically on small screens.

**File: `src/components/mobile/MobileExpertDashboard.tsx`**
- Remove the internal pill tab bar since `DashboardLayout` already provides bottom navigation for experts.
- Convert from a tabbed single-page layout to showing only the "home" content (appointments list) since other tabs (Schedule, Notes, Profile) are navigated to via the bottom nav bar's separate routes.
- Alternatively, keep the internal tabs but remove `DashboardLayout`'s bottom nav duplication by making the tab bar the primary nav (fixed at bottom, replacing the layout's nav).

**Chosen approach**: Keep `MobileExpertDashboard` with its own tabs (since the expert dashboard is a self-contained panel with tabs for Home/Schedule/Sessions/Notes/Profile), but make the tab bar fixed at the bottom as the primary navigation, and hide DashboardLayout's bottom nav when on the expert dashboard route. This avoids double navigation.

### Implementation
| File | Change |
|------|--------|
| `ExpertDashboardContent.tsx` | Wrap schedule controls in responsive grid; add `overflow-x-auto` to tab bar; reduce calendar cell heights responsively |
| `MobileExpertDashboard.tsx` | Move tab bar to fixed bottom position replacing DashboardLayout's bottom nav; add `pb-safe` spacing; ensure all tab content is properly scrollable |
| `DashboardLayout.tsx` | Hide mobile bottom nav when current route is `/dashboard/expert` (expert dashboard manages its own tabs) |

