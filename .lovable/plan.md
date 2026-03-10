

# Plan: Mobile-First App Redesign

## Core Problem

The current mobile components exist but look like shrunken web pages, not a native mobile app. Text is too small (text-[9px], text-[10px]), spacing is cramped, and the overall feel doesn't match apps like Instagram, Spotify, or Headspace that users are accustomed to.

**Key insight from user**: Only the Admin Dashboard is used on web. Everything else is primarily used on phones/tablets/laptops, so the entire non-admin UI should feel like a polished mobile app.

## What Needs to Change

### 1. DashboardLayout — redesign for mobile-app feel
- **Top bar**: Reduce height to `h-12`, show only logo + minimal icons. Remove the 3 right-side buttons (Credits, BlackBox, Appointments) — these are already in the bottom nav or main dashboard
- **Bottom nav**: Increase touch targets, add active indicator dot/pill, slightly larger icons
- **Content area**: Remove `px-3 py-4` padding, use `px-4 pt-2 pb-20` — less top padding, content starts closer to top bar like a real app
- **File**: `src/components/layout/DashboardLayout.tsx`

### 2. MobileDashboard — app-like home screen
- Increase font sizes: greeting `text-xl`, body `text-sm` not `text-xs`
- Stats cards: larger with colored backgrounds instead of plain cards
- Portal cards: larger icons (w-12 h-12), bigger text, more visual weight
- Quick tools: bigger touch targets (w-14 h-14), proper labels
- Remove the tip section at bottom (unnecessary noise)
- **File**: `src/components/mobile/MobileDashboard.tsx`

### 3. MobileSelfHelp — full-screen interactive tools
- Tab bar: bigger pills with proper padding, `text-sm` not `text-xs`
- Quest cards: larger, more breathing room, bigger buttons
- Wreck Buddy: make the tap area truly full-width, bigger emoji, satisfying visual feedback
- Tibetan Bowl: breathing circle should be large and centered, `max-w-[280px]` is too small — remove it entirely, make it responsive
- Stats: `text-sm` labels, `text-lg` values
- **File**: `src/components/mobile/MobileSelfHelp.tsx`

### 4. MobileSoundTherapy — Spotify-quality player
- Track items: taller rows (py-3), `text-sm` title, readable artist name
- Mini player: taller (py-3), bigger album art, proper song info sizing
- Expanded player: larger album art (w-56 h-56), bigger controls, more spacing
- Category pills: `text-sm`, proper height
- **File**: `src/components/mobile/MobileSoundTherapy.tsx`

### 5. MobileAppointments — clean booking experience
- Expert cards: larger profile area, clearer slot buttons
- Appointment cards: more padding, readable text (`text-sm`)
- Dialog: properly sized for mobile with larger inputs
- **File**: `src/components/mobile/MobileAppointments.tsx`

### 6. MobileBlackBox — journal-style UI
- Textarea: larger, `text-sm`, proper height
- Entry cards: more padding, readable timestamps
- Action buttons: properly sized (h-9, h-10)
- **File**: `src/components/mobile/MobileBlackBox.tsx`

### 7. MobilePeerConnect — chat-app style
- Intern list: taller rows, bigger avatars, readable status
- Chat view: proper message bubbles, bigger input area
- **File**: `src/components/mobile/MobilePeerConnect.tsx`

### 8. MobileCredits — wallet-style UI
- Balance card: bigger numbers, more visual impact
- Transaction rows: taller, readable amounts
- Top-up packages: bigger cards, clear pricing
- **File**: `src/components/mobile/MobileCredits.tsx`

### 9. MobileProfile — settings-app style
- Profile card: larger avatar area, clear stats
- Settings sections: proper list items with dividers
- Inputs: `h-10` minimum, `text-sm`
- **File**: `src/components/mobile/MobileProfile.tsx`

### 10. MobileRecoverySetup — wizard-style
- Steps: bigger indicators, clearer progress
- Emoji grid: larger emoji buttons for easy tapping
- Inputs: `h-10`, `text-sm`
- **File**: `src/components/mobile/MobileRecoverySetup.tsx`

### 11. MobileExpertDashboard & MobileInternDashboard
- Same principles: larger text, bigger cards, more padding
- **Files**: `src/components/mobile/MobileExpertDashboard.tsx`, `src/components/mobile/MobileInternDashboard.tsx`

### 12. AdminDashboard — keep desktop-focused, improve desktop layout
- No changes to mobile component (already separated)
- Clean up desktop layout: proper data tables, wider content area
- **File**: `src/pages/admin/AdminDashboard.tsx` (desktop view only)

## Design Principles Applied Everywhere

| Current | New |
|---------|-----|
| `text-[9px]`, `text-[10px]` | `text-xs` (12px) minimum for any readable text |
| `text-xs` for body | `text-sm` (14px) for body text |
| `text-lg` for headings | `text-xl` or `text-2xl` for page headings |
| `h-6`, `h-7` buttons | `h-10` minimum for primary, `h-9` for secondary |
| `w-7`, `w-8` icons | `w-10` minimum for tappable icon buttons |
| `p-2`, `p-2.5` cards | `p-4` for cards |
| `gap-1`, `gap-1.5` | `gap-3` minimum between sections |
| `space-y-3` | `space-y-5` between major sections |

## Files to Modify (13 files)

1. `src/components/layout/DashboardLayout.tsx`
2. `src/components/mobile/MobileDashboard.tsx`
3. `src/components/mobile/MobileSelfHelp.tsx`
4. `src/components/mobile/MobileSoundTherapy.tsx`
5. `src/components/mobile/MobileAppointments.tsx`
6. `src/components/mobile/MobileBlackBox.tsx`
7. `src/components/mobile/MobilePeerConnect.tsx`
8. `src/components/mobile/MobileCredits.tsx`
9. `src/components/mobile/MobileProfile.tsx`
10. `src/components/mobile/MobileRecoverySetup.tsx`
11. `src/components/mobile/MobileExpertDashboard.tsx`
12. `src/components/mobile/MobileInternDashboard.tsx`
13. `src/components/mobile/MobileAdminDashboard.tsx`

