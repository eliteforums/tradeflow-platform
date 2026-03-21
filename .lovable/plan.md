

## Plan: Fix SPOC → Admin Redirect + Intern Dashboard Alignment

### Problem 1: SPOC users see Admin Dashboard
**Root cause**: In `src/pages/dashboard/Dashboard.tsx` line 32, SPOC users are redirected to `/admin` instead of `/dashboard/spoc`:
```typescript
if (profile?.role === "admin" || profile?.role === "spoc") return <Navigate to="/admin" replace />;
```

**Fix**: Split the redirect so SPOC goes to `/dashboard/spoc`:
```typescript
if (profile?.role === "admin") return <Navigate to="/admin" replace />;
if (profile?.role === "spoc") return <Navigate to="/dashboard/spoc" replace />;
```

Also fix the same issue in `MobileDashboard` if it has the same redirect pattern.

### Problem 2: Intern Training Status Enum
Per the doc (Section 19), the training status enum should be: `NOT_STARTED`, `IN_PROGRESS`, `ASSESSMENT_PENDING`, `FAILED`, `INTERVIEW_PENDING`, `ACTIVE`. Currently the code uses `not_started`, `in_progress`, `completed`.

**Fix**: Update both `InternDashboardContent.tsx` and `MobileInternDashboard.tsx`:
- Change `"completed"` checks to `"active"` (matching doc's final state)
- When all 7 modules are done, set `training_status` to `"interview_pending"` (not auto-complete — Day 7 is a live interview that needs expert approval)
- Update the training timeline to match the doc: Day 1 (Intro + Assessment), Day 2-3 (Core Training), Day 3 (Assessment), Day 4-5 (Advanced), Day 6 (Final Assessment), Day 7 (Final Interview)

### Problem 3: SPOC sidebar nav items
All SPOC nav items in `DashboardLayout.tsx` point to `/dashboard/spoc` — they should use query params or state to switch tabs within SPOCDashboardContent.

**Fix**: Use URL search params (`?tab=onboarding`, `?tab=flags`, etc.) so sidebar clicks navigate to the correct SPOC tab.

### Files to change (5 files)
1. `src/pages/dashboard/Dashboard.tsx` — Fix SPOC redirect from `/admin` to `/dashboard/spoc`
2. `src/components/mobile/MobileDashboard.tsx` — Same redirect fix if applicable
3. `src/components/layout/DashboardLayout.tsx` — Update SPOC nav items with `?tab=` query params
4. `src/components/intern/InternDashboardContent.tsx` — Align training status enum and timeline with doc
5. `src/components/mobile/MobileInternDashboard.tsx` — Same training status/timeline alignment
6. `src/components/spoc/SPOCDashboardContent.tsx` — Read `?tab=` from URL to set initial active tab

