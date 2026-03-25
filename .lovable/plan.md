

## Plan: PowerBI-Style Site Analytics Dashboard

### Current State
The analytics tab has basic KPI cards, a daily traffic area chart, top pages list, hourly bar chart, traffic sources, device breakdown, and cookie consent stats. Functional but flat — no ring/donut charts, no comparative visuals, no segmented views.

### New Design
A dense, professional PowerBI-inspired analytics dashboard with:
- Redesigned KPI strip with delta indicators and sparkline-style context
- Ring/donut charts for device and consent breakdowns
- Dual-axis or stacked area chart for daily traffic with visitor segmentation
- Horizontal bar chart for top pages (PowerBI-style)
- Heatmap-style hourly traffic grid
- Traffic sources with proportional donut
- Views Today vs Week vs Total comparative cards

### Changes

#### 1. `src/components/admin/AnalyticsDashboard.tsx` — Full rewrite

**Row 1 — KPI Hero Strip (6 cards, same data, upgraded style):**
- Each card gets a subtle trend arrow and mini context line (e.g., "Total Views" with "X today" subtitle)
- Gradient accent borders on hover
- "Live Now" card gets a pulsing ring effect

**Row 2 — Daily Traffic (full width):**
- Stacked area chart with two series: authenticated vs anonymous views (computed from existing `user_id` presence in pageViews)
- Keep the gradient fill, add grid lines and better tooltip

**Row 3 — Two-column layout:**
- Left: **Top Pages** — horizontal bar chart using recharts `BarChart` with `layout="vertical"`, showing page path on Y-axis and view count as bars. Much more PowerBI-like than the current list.
- Right: **Hourly Traffic Heatmap** — keep bar chart but add color intensity gradient (darker bars = more traffic)

**Row 4 — Three-column layout:**
- Left: **Device Breakdown** — `PieChart` with `Cell` components, donut style (innerRadius), with legend below
- Center: **Traffic Sources** — `PieChart` donut for top referrers with color-coded legend
- Right: **Cookie Consent** — `PieChart` donut (green/red/amber) with stacked bar below

**Row 5 — Visitor Segmentation (2 cards):**
- Authenticated vs Anonymous side-by-side with proportional bar and percentage

#### 2. `src/hooks/useAnalyticsData.ts` — Minor additions
- Split daily trend into `authenticatedCount` and `anonymousCount` per day (for the stacked area chart)
- Return `viewsToday` ratio vs previous day for delta indicator

### Files Modified
- `src/components/admin/AnalyticsDashboard.tsx` — Full redesign with PieChart donut charts, vertical bar charts, stacked area, heatmap bars
- `src/hooks/useAnalyticsData.ts` — Add authenticated/anonymous daily split data

### Technical Details
- Uses `recharts` PieChart, Cell, BarChart (vertical layout), AreaChart (stacked) — all already available
- No new dependencies needed
- No database changes

