

## Plan: Enhanced Analytics Dashboard + Mobile Admin Warning

### 1. Mobile Admin Warning Dialog

**File:** `src/pages/admin/AdminDashboard.tsx`

Before rendering `MobileAdminDashboard`, show a dismissable dialog/toast warning users that the admin panel is best viewed on a larger screen. Use a one-time dismissable alert dialog that appears when `isMobile` is true.

### 2. Enhanced Analytics Hook (`src/hooks/useAnalyticsData.ts`)

Add the following capabilities:
- **Date range filter** — accept a `dateRange` parameter (today, 7d, 30d, 90d, custom) instead of hardcoded 30 days
- **Realtime subscription** — subscribe to `analytics_events` table via Supabase Realtime `INSERT` events, append new events to the cached data and invalidate the query
- **Daily trend data** — aggregate page views by day for the selected range (for a line/area chart)
- **Bounce rate approximation** — sessions with only 1 page view / total sessions
- **Average session duration** — approximate from timestamps per session_hash
- **Referrer breakdown** — group by referrer domain
- **New vs returning visitors** — track session_hash first appearance
- **Live visitor count** — count unique session_hashes in last 5 minutes

### 3. Enhanced Analytics Dashboard (`src/components/admin/AnalyticsDashboard.tsx`)

Complete rewrite with professional layout:

**Header area:**
- Title "Site Analytics" with a green "LIVE" pulse dot
- Date range selector (Today, 7 Days, 30 Days, 90 Days)
- Page path filter dropdown
- Auto-refresh indicator showing last updated time

**KPI cards row (6 cards):**
- Views (filtered period) | Unique Visitors | Bounce Rate | Avg Session Duration | Live Now | New vs Returning ratio

**Charts section:**
- **Daily traffic trend** — bar chart showing views per day across the selected range
- **Hourly heatmap** — improved version of current hourly chart with better labels and tooltips
- **Top pages table** — sortable table with page path, views, unique visitors, bounce rate per page
- **Referrer sources** — horizontal bar chart of top referrer domains
- **Device breakdown** — donut-style visual with percentages
- **Cookie consent** — keep existing but with percentage labels

**Realtime indicator:**
- Small "Live" badge that pulses when new data arrives
- Auto-append new analytics events without full page reload

### 4. Enable Realtime on analytics_events

**Database migration:** `ALTER PUBLICATION supabase_realtime ADD TABLE public.analytics_events;`

### Files Modified
- `src/pages/admin/AdminDashboard.tsx` — Add mobile warning dialog
- `src/hooks/useAnalyticsData.ts` — Date range filter, realtime subscription, new metrics
- `src/components/admin/AnalyticsDashboard.tsx` — Full rewrite with filters, charts, live indicator

### Technical Details
- Realtime uses `supabase.channel('analytics-realtime').on('postgres_changes', ...)` to listen for new `INSERT` events on `analytics_events`
- Daily trend computed by grouping events by `date-fns` `format(created_at, 'yyyy-MM-dd')`
- Bounce rate = sessions with 1 page view / total unique sessions
- Date range filter passed as state from the dashboard component to the hook
- Mobile warning uses AlertDialog from shadcn with localStorage flag `admin_mobile_warning_dismissed`

