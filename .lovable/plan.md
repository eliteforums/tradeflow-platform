

## Plan: Admin Sidebar Navigation + PWA Hardening for 60K Scale

### Current Problem
The admin dashboard uses horizontal pill tabs to switch between 9+ sections (Overview, Members, Sessions, SPOC, Roles, Training, Sounds, Escalations, Audit). This becomes cluttered and hard to navigate. All content renders inside a single page with conditional rendering.

### Solution Overview

#### 1. Admin Dashboard — Sidebar Navigation (Desktop)

Replace the horizontal tab strip with a dedicated admin sidebar. Each section becomes a sidebar link instead of a pill button. The admin gets its own sidebar layout that replaces the generic `DashboardLayout` sidebar.

**Approach**: Rewrite `AdminDashboard.tsx` to use a custom admin sidebar with:
- Grouped navigation: **Analytics** (Overview), **People** (Members, Roles), **Sessions**, **Institutions** (SPOC + detail), **Content** (Training, Sounds), **Safety** (Escalations, Audit)
- Active state highlighting
- Collapsible sidebar with icon-only mode
- Content area renders the active section
- Same conditional rendering logic, just driven by sidebar clicks instead of tabs

**Files**: `src/pages/admin/AdminDashboard.tsx` (rewrite layout structure)

#### 2. Mobile Admin — Keep Scrollable Tabs
Mobile stays with horizontal scrollable tabs (the current pattern works well for touch). No structural change needed for mobile.

#### 3. PWA Hardening for 60K Concurrent Users

Current PWA config is basic. Improvements:

**vite.config.ts** changes:
- Add `runtimeCaching` strategies for API calls (NetworkFirst with 5s timeout for Supabase API, CacheFirst for static assets/fonts)
- Add `maximumFileSizeToCacheInBytes` to handle larger bundles
- Add `skipWaiting: true` for faster SW activation
- Add `clientsClaim: true` so new SW takes over immediately
- Increase `navigationPreload` for faster navigation

**index.html** changes:
- Add `<link rel="preload">` for critical JS chunks
- Add `Connection: keep-alive` hint

**src/App.tsx** changes:
- Add SW update notification so users get prompted when a new version is available

#### 4. README Update

Update README to reflect:
- New admin sidebar navigation
- PWA runtime caching strategies
- 60K concurrency design notes

---

### Detailed File Changes

| # | Change | Files |
|---|--------|-------|
| 1 | Replace admin tab navigation with grouped sidebar | `AdminDashboard.tsx` |
| 2 | PWA runtime caching + skipWaiting + clientsClaim | `vite.config.ts` |
| 3 | Add SW update prompt component | New `src/components/PWAUpdatePrompt.tsx`, `App.tsx` |
| 4 | Update README | `README.md` |

### Admin Sidebar Structure

```text
┌─────────────────┐
│ 🏛 Admin Panel   │
│                 │
│ ANALYTICS       │
│  ▸ Overview     │
│                 │
│ PEOPLE          │
│  ▸ Members      │
│  ▸ Roles        │
│                 │
│ ACTIVITY        │
│  ▸ Sessions     │
│                 │
│ INSTITUTIONS    │
│  ▸ SPOC / Inst  │
│                 │
│ CONTENT         │
│  ▸ Training     │
│  ▸ Sounds       │
│                 │
│ SAFETY          │
│  ▸ Escalations  │
│  ▸ Audit Logs   │
│                 │
│ ─────────────── │
│  ← Back to App  │
│  ⎋ Logout       │
└─────────────────┘
```

No database migrations required.

