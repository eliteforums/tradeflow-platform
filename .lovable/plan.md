

## Plan: Add NotificationBell Globally + Ensure Realtime Works Everywhere

### Problem
The NotificationBell component is only present in 5 specific pages (SPOC dashboard, Appointments, Expert dashboard, Mobile Expert, Mobile Appointments). It is missing from the Admin dashboard (desktop + mobile), Intern dashboard, Therapist dashboard, Student dashboard, and all other pages.

### Approach
Instead of adding NotificationBell to every individual page, add it once in `DashboardLayout.tsx` which wraps all dashboard pages. For the Admin dashboard (which has its own layout), add it to both `AdminDashboard.tsx` and `MobileAdminDashboard.tsx` headers.

Then remove the duplicate NotificationBell imports from the 5 pages that already have it, to avoid showing two bells.

### Changes

#### 1. `src/components/layout/DashboardLayout.tsx`
- Import `NotificationBell`
- Add it to the desktop sidebar header (next to the logo/collapse button)
- Add it to the mobile top bar area

#### 2. `src/pages/admin/AdminDashboard.tsx`
- Import `NotificationBell`
- Add it next to the page header (line ~281, next to the title)

#### 3. `src/components/mobile/MobileAdminDashboard.tsx`
- Import `NotificationBell`
- Add it to the header area

#### 4. Remove duplicate NotificationBell from pages that already have it
These pages are wrapped by DashboardLayout, so they'd show two bells:
- `src/components/spoc/SPOCDashboardContent.tsx` — remove
- `src/pages/dashboard/Appointments.tsx` — remove
- `src/components/expert/ExpertDashboardContent.tsx` — remove
- `src/components/mobile/MobileExpertDashboard.tsx` — remove
- `src/components/mobile/MobileAppointments.tsx` — remove

#### 5. Realtime already works
The `useNotifications` hook already has a Supabase Realtime subscription that listens for `INSERT` events on the `notifications` table filtered by `user_id`. The notification sound (Web Audio API chime) is already implemented. No changes needed here — once the bell is visible on all pages, realtime notifications with sound will work for all roles.

### Files Modified
- `src/components/layout/DashboardLayout.tsx` — Add NotificationBell to layout
- `src/pages/admin/AdminDashboard.tsx` — Add NotificationBell to admin header
- `src/components/mobile/MobileAdminDashboard.tsx` — Add NotificationBell to mobile admin header
- `src/components/spoc/SPOCDashboardContent.tsx` — Remove duplicate bell
- `src/pages/dashboard/Appointments.tsx` — Remove duplicate bell
- `src/components/expert/ExpertDashboardContent.tsx` — Remove duplicate bell
- `src/components/mobile/MobileExpertDashboard.tsx` — Remove duplicate bell
- `src/components/mobile/MobileAppointments.tsx` — Remove duplicate bell

