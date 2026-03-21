

## Plan: Cookie Consent + Analytics for Super Admin Dashboard

### Overview
Add a GDPR/DPDP-compliant cookie consent banner, track anonymous page-view analytics to a new `analytics_events` table, and display the data in a new "Analytics" tab on the super admin dashboard.

---

### 1. Database Migration — `analytics_events` table

```sql
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  session_hash text NOT NULL,
  event_type text NOT NULL DEFAULT 'page_view',
  page_path text NOT NULL,
  referrer text,
  user_agent text,
  screen_size text,
  country text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_events_created ON public.analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_page ON public.analytics_events(page_path, created_at DESC);
```

RLS: Admins can SELECT all; authenticated users can INSERT (own `user_id` or null for anonymous). No UPDATE/DELETE.

Also add a `cookie_consent` column to `profiles` (`text DEFAULT 'pending'` — values: `accepted`, `rejected`, `pending`).

---

### 2. Cookie Consent Banner — `src/components/CookieConsent.tsx`

- Floating bottom banner with Accept/Reject buttons
- Stores preference in `localStorage` key `eternia_cookie_consent`
- If user is logged in, also saves to `profiles.cookie_consent`
- Only tracks analytics if consent = `accepted`
- Styled to match dark theme with teal accent

---

### 3. Analytics Tracker Hook — `src/hooks/useAnalytics.ts`

- Generates a random session hash (stored in `sessionStorage`)
- On every route change, inserts a `page_view` event to `analytics_events` if cookie consent is accepted
- Captures: path, referrer, screen size, user agent
- Debounced to avoid duplicate rapid navigations
- Works for both authenticated and anonymous users

---

### 4. Super Admin Dashboard — New "Analytics" Tab

Add to `AdminDashboard.tsx` and `MobileAdminDashboard.tsx`:

- New sidebar item: **Analytics** (icon: `BarChart3`) under the Analytics group
- New hook: `src/hooks/useAnalyticsData.ts` — queries `analytics_events` for:
  - **Page views today / this week / this month**
  - **Top pages** (grouped by `page_path`, count)
  - **Unique visitors** (distinct `session_hash`)
  - **Peak hours** (grouped by hour)
  - **Device breakdown** (parsed from `screen_size`)
  - **Consent stats** (accepted vs rejected vs pending from `profiles`)

Dashboard cards:
- Total page views, unique visitors, avg session pages
- Top 10 pages bar list
- Hourly traffic heatmap (simple grid)
- Cookie consent breakdown (accepted/rejected/pending counts)

---

### Files

| # | File | Change |
|---|------|--------|
| 1 | SQL migration | Create `analytics_events` table + add `cookie_consent` to profiles |
| 2 | `src/components/CookieConsent.tsx` | New — consent banner component |
| 3 | `src/hooks/useAnalytics.ts` | New — page view tracker hook |
| 4 | `src/hooks/useAnalyticsData.ts` | New — admin analytics data queries |
| 5 | `src/App.tsx` | Add `<CookieConsent />` + `useAnalytics()` |
| 6 | `src/pages/admin/AdminDashboard.tsx` | Add Analytics tab + content |
| 7 | `src/components/mobile/MobileAdminDashboard.tsx` | Add Analytics tab + content |

