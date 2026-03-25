

## Plan: PowerBI-Style Admin Overview Dashboard

### Current State
The overview tab shows basic stat cards (role counts, sessions, credits), a flagged entries list, and quick action buttons. No charts, no trend data, no visual breakdowns.

### New Design
A comprehensive dashboard with KPI cards featuring trend indicators, multiple chart types (area, bar, donut/ring), role distribution visuals, session breakdown charts, recent activity feed, and system health indicators — all in a dense PowerBI-inspired grid layout.

### Data Enhancements

#### 1. `src/hooks/useAdmin.ts` — Add richer stats queries
- Add **blackbox session count** to stats
- Add **escalation count** (pending escalations)
- Add **credit transaction totals** (actual sum from `credit_transactions`)
- Add **session status breakdown** (pending/completed/cancelled counts for appointments)
- Add **recent signups** (profiles created in last 7 days)
- Add **institution count**
- Compute **session type distribution** from existing data (appointments vs peer vs blackbox counts separately)
- Return new fields: `blackboxCount`, `pendingEscalations`, `totalCreditsSpent`, `totalCreditsEarned`, `recentSignups`, `appointmentsByStatus`, `institutionCount`

#### 2. `src/pages/admin/AdminDashboard.tsx` — Replace overview tab content
Replace the current overview section (lines 337-416) with a new comprehensive dashboard layout:

**Row 1 — Hero KPI Cards (5 columns):**
- Total Members (with role breakdown mini-bar beneath)
- Total Sessions (combined count)
- Credits Economy (earned vs spent)
- Active Today
- Pending Escalations (with alert pulse if > 0)

**Row 2 — Charts Row (2 columns):**
- **Role Distribution** — Horizontal stacked bar or donut ring showing admin/spoc/expert/intern/student proportions with legend
- **Session Type Breakdown** — Ring/donut chart showing appointments vs peer vs blackbox split

**Row 3 — Activity & Health (3 columns):**
- **Session Status** — Stacked bar showing pending/confirmed/completed/cancelled appointment statuses
- **Credit Flow** — Two large numbers (Total Earned vs Total Spent) with a simple visual indicator
- **System Health** — Grid of mini indicators: institutions active, flagged entries, pending escalations, recent signups (7d)

**Row 4 — Flagged Entries + Recent Activity (2 columns):**
- Left: Flagged entries panel (existing, cleaned up)
- Right: Recent sessions feed (last 10 from unified sessions) with type badges and timestamps

**Row 5 — Quick Actions** (existing, kept but restyled)

Uses `recharts` (already installed) for PieChart/Cell, BarChart, and the existing area chart components.

### Files Modified
- `src/hooks/useAdmin.ts` — Add richer stat queries
- `src/pages/admin/AdminDashboard.tsx` — Replace overview tab with PowerBI-style dashboard using recharts charts

### No database changes needed — all data comes from existing tables.

