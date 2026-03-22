

## Plan: Fix Analytics Dashboard Accuracy

### Root Cause

The "1 tab detected with no logged-in user" issue has two causes:

1. **Admin's own browsing is counted** — When you (the admin) browse the site and have accepted cookies, your page views are recorded in `analytics_events`. The dashboard then shows "1 unique visitor" — which is you.

2. **"Unique Visitors" uses `session_hash` (per-tab)** — Each browser tab generates a new UUID via `sessionStorage`. This means unique visitors = unique tabs opened, not unique people. If you open 3 tabs, it shows 3 visitors.

3. **No authenticated vs anonymous distinction** — The dashboard can't tell if a visitor was logged in or anonymous, making the metrics unreliable.

### Changes

| # | File | Change |
|---|------|--------|
| 1 | `src/hooks/useAnalytics.ts` | Exclude admin users from analytics tracking (admins should not pollute metrics) |
| 2 | `src/hooks/useAnalyticsData.ts` | Count unique visitors by `user_id` for authenticated users + `session_hash` for anonymous only; add authenticated vs anonymous breakdown; column-specific select |
| 3 | `src/components/admin/AnalyticsDashboard.tsx` | Add authenticated/anonymous user breakdown card; add "Logged-in Users" metric; show empty state message when no real user data exists |

### Technical Details

**Fix 1: Exclude admin traffic from analytics events**
```typescript
// useAnalytics.ts — skip tracking for admin users
const { user, profile } = useAuth();
if (profile?.role === "admin") return; // admins don't pollute analytics
```

**Fix 2: Accurate unique visitor counting**
```typescript
// Count authenticated unique users by user_id (not session_hash)
const authenticatedUserIds = new Set(
  pageViews.filter(e => e.user_id).map(e => e.user_id)
);
const anonymousSessions = new Set(
  pageViews.filter(e => !e.user_id).map(e => e.session_hash)
);
const uniqueUsers = authenticatedUserIds.size;
const uniqueAnonymous = anonymousSessions.size;
const uniqueVisitors = uniqueUsers + uniqueAnonymous;
```

**Fix 3: Column-specific select (§13.1)**
```typescript
.select("id, user_id, session_hash, page_path, screen_size, created_at")
```

**Fix 4: Dashboard shows authenticated vs anonymous breakdown**
Add a new stat card row showing:
- Logged-in Users (unique `user_id` count)
- Anonymous Visitors (unique `session_hash` where `user_id` is null)
- Total Unique Visitors (sum of both)

