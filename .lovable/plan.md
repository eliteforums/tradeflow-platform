

# Plan: Dual-View Architecture — Separate Mobile & Desktop Components for Every Page

## The Core Problem

The current approach of using responsive Tailwind classes (`sm:`, `lg:`) on single components has failed repeatedly. The layouts are broken on both mobile and desktop because:
1. Too many conditional classes make code unmaintainable
2. Mobile constraints (bottom nav, top bar, safe areas) need fundamentally different layouts, not just smaller padding
3. Desktop views are being degraded by mobile-first compromises

## Solution: Dual-View Pattern

Create a `useMobileView` pattern where each page renders a completely separate component for mobile vs desktop. This gives full control over each viewport without compromises.

```text
src/pages/dashboard/
├── SelfHelp.tsx          ← router entry, picks view
├── SoundTherapy.tsx      ← router entry, picks view
├── Dashboard.tsx         ← router entry, picks view
├── ...
src/components/mobile/    ← NEW: all mobile views
├── MobileDashboard.tsx
├── MobileSelfHelp.tsx
├── MobileSoundTherapy.tsx
├── MobileAppointments.tsx
├── MobileBlackBox.tsx
├── MobilePeerConnect.tsx
├── MobileCredits.tsx
├── MobileProfile.tsx
├── MobileRecoverySetup.tsx
├── MobileExpertDashboard.tsx
├── MobileInternDashboard.tsx
├── MobileAdminDashboard.tsx
```

## Pattern for Each Page

Each page file becomes a thin wrapper:
```tsx
const SelfHelp = () => {
  const isMobile = useIsMobile();
  return isMobile ? <MobileSelfHelp /> : <DesktopSelfHelp />;
};
```

The current page code becomes the desktop version (cleaned up). A new mobile component is written from scratch, designed specifically for 375px-428px viewports with:
- Full-width layouts, no `max-w-*` constraints
- Touch-optimized tap targets (min 44px)
- Bottom nav awareness (proper `pb-safe`)
- Compact typography and spacing
- No wasted whitespace

## Files to Create/Modify (23 files)

### New Mobile Components (12 files):
1. `src/components/mobile/MobileDashboard.tsx` — card-based home with stories-style tools
2. `src/components/mobile/MobileSelfHelp.tsx` — full-width tabs, inline 2D interactions, no 3D
3. `src/components/mobile/MobileSoundTherapy.tsx` — Spotify-style list + portal full-screen player
4. `src/components/mobile/MobileAppointments.tsx` — stacked cards, bottom-sheet booking
5. `src/components/mobile/MobileBlackBox.tsx` — full-width entry form, compact history
6. `src/components/mobile/MobilePeerConnect.tsx` — list/chat toggle (already partially done)
7. `src/components/mobile/MobileCredits.tsx` — compact balance card, scrollable history
8. `src/components/mobile/MobileProfile.tsx` — stacked settings sections
9. `src/components/mobile/MobileRecoverySetup.tsx` — step wizard optimized for small screens
10. `src/components/mobile/MobileExpertDashboard.tsx` — compact schedule + session cards
11. `src/components/mobile/MobileInternDashboard.tsx` — training modules + session list
12. `src/components/mobile/MobileAdminDashboard.tsx` — bottom-sheet style tab content, compact stats

### Modified Page Files (11 files):
Each page gets the `isMobile ? <MobileX /> : <DesktopX />` wrapper:
1. `src/pages/dashboard/Dashboard.tsx`
2. `src/pages/dashboard/SelfHelp.tsx`
3. `src/pages/dashboard/SoundTherapy.tsx`
4. `src/pages/dashboard/Appointments.tsx`
5. `src/pages/dashboard/BlackBox.tsx`
6. `src/pages/dashboard/PeerConnect.tsx`
7. `src/pages/dashboard/Credits.tsx`
8. `src/pages/dashboard/Profile.tsx`
9. `src/pages/dashboard/RecoverySetup.tsx`
10. `src/pages/dashboard/ExpertDashboard.tsx`
11. `src/pages/dashboard/InternDashboard.tsx`
12. `src/pages/admin/AdminDashboard.tsx`

## Mobile Design Principles (applied to every mobile component)

- **No max-width constraints** — content fills the screen
- **Padding**: `px-4 py-3` consistently
- **Font sizes**: headings `text-lg`, body `text-sm`, meta `text-[11px]`
- **Cards**: `p-3 rounded-xl`, no `p-6` or `rounded-2xl`
- **Buttons**: min height `h-10` for touch, `h-8` for secondary
- **Bottom padding**: `pb-24` on all scrollable content (accounts for bottom nav + mini-player)
- **No horizontal scroll** — everything stacks vertically
- **Active states**: `active:scale-[0.97]` on tappable elements

## Implementation Order

1. Create all 12 mobile components
2. Update all 12 page files to use the dual-view pattern
3. Each mobile component shares hooks/state with desktop but renders completely different JSX

This approach ensures desktop views remain untouched while mobile gets purpose-built UIs.

