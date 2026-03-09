

# Plan: Fix Self-Help (Tools), Sound Therapy (Sounds), and Admin Panel for Mobile

## Problem Analysis

After reviewing all files, I identified these issues:

1. **Self-Help (Tools)**: The 3D components have mobile 2D fallbacks but they render inside fixed-size containers (`max-w-[280px]`, `aspect-square`) that waste screen real estate. The `QuestCard3D` 2D fallback only shows 3 quests in a grid layout that may look sparse. The overall page structure works but the interactive components (WreckBuddy, TibetanBowl) are too small and feel disconnected from the page content.

2. **Sound Therapy (Sounds)**: The mini-player positioning uses `calc(4rem + env(...))` which should be correct, but the track list padding (`pb-24`) may not be enough. The expanded full-screen player wraps inside `DashboardLayout` which adds the top bar and bottom nav on top of the "full screen" view, breaking the experience.

3. **Admin Panel**: All admin sub-components (SPOCTools, InstitutionManager, EscalationManager, ExpertManager, MemberManager, RoleManager, CreditGrantTool, SoundManager) use desktop-first layouts with `grid-cols-2`, `md:grid-cols-4`, large padding, `Card` wrappers with `p-4`/`p-6`, and side-by-side button groups that overflow on mobile. None of these were touched in previous refactors.

## Plan

### 1. Rewrite SelfHelp.tsx — inline 2D components instead of separate files
- Remove the separate 3D component imports for mobile entirely
- Build the quest cards, wreck buddy, and tibetan bowl directly inline in `SelfHelp.tsx` with mobile-optimized layouts
- Quest tab: compact list (already good), keep as-is
- Wreck tab: larger tap target, full-width buddy area instead of constrained `max-w-[280px]`
- Bowl tab: full-width breathing visualization, remove the tiny `max-w-[280px]` constraint
- Keep 3D imports only for desktop (`isMobile` check)

### 2. Rewrite SoundTherapy.tsx mobile player
- Fix the expanded player: render it **outside** `DashboardLayout` (use a portal or conditional render) so it truly covers the full screen without top bar / bottom nav interference
- Adjust mini-player z-index and positioning to reliably sit above bottom nav
- Ensure track list has sufficient bottom padding

### 3. Rewrite all admin sub-components for mobile
Files to update (add compact mobile styles):
- **SPOCTools.tsx**: Change `md:grid-cols-4` → `grid-cols-2`, reduce `space-y-6` → `space-y-4`, compact `Card` padding, stack QR + Credits vertically on mobile (`grid md:grid-cols-2` → single column)
- **InstitutionManager.tsx**: Stack institution card content vertically on mobile, wrap code + buttons
- **EscalationManager.tsx**: Compact card padding, wrap action buttons, reduce text sizes
- **ExpertManager.tsx**: Stack expert rows vertically on mobile, wrap verify/active buttons
- **MemberManager.tsx**: Already uses `sm:grid-cols-2`, mostly OK. Reduce card padding.
- **RoleManager.tsx**: Uses `sm:grid-cols-3`, will stack on mobile. Reduce padding.
- **CreditGrantTool.tsx**: Uses `sm:grid-cols-3`, will stack. Reduce padding.
- **SoundManager.tsx**: Compact form inputs, reduce card padding
- **AuditLogViewer.tsx**: Already compact, minor tweaks
- **AccountDeletion.tsx**: Already compact, minor tweaks

### 4. Update AdminDashboard.tsx
- Ensure the scrollable pill nav has proper `-mx` offset for edge-to-edge scroll
- Reduce spacing throughout

### Files to modify (10 files):
1. `src/pages/dashboard/SelfHelp.tsx` — inline mobile components, remove size constraints
2. `src/pages/dashboard/SoundTherapy.tsx` — fix full-screen player rendering
3. `src/components/admin/SPOCTools.tsx` — mobile-first layout
4. `src/components/admin/InstitutionManager.tsx` — stack layout on mobile
5. `src/components/admin/EscalationManager.tsx` — compact mobile cards
6. `src/components/admin/ExpertManager.tsx` — stack expert rows
7. `src/components/admin/MemberManager.tsx` — tighter padding
8. `src/components/admin/RoleManager.tsx` — tighter padding
9. `src/components/admin/CreditGrantTool.tsx` — tighter padding
10. `src/components/admin/SoundManager.tsx` — compact form

