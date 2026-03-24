

## Plan: Fix SPOC Reports Tab — Make It Real & Institution-Scoped

### Current Issues

The Reports tab **fetches real data** but has critical problems:

1. **Not institution-scoped** — All 4 report queries (`appointments`, `peer_sessions`, `sound_content`, `quest_completions`) fetch global counts, not filtered by the SPOC's institution. A SPOC at University A sees data from University B too.
2. **Sound plays not date-filtered** — The query fetches total `play_count` from `sound_content` regardless of the date filter. Sound content doesn't track per-user plays, so this metric is misleading.
3. **No realtime** — Data only updates on page load or manual refresh.
4. **Export PDF button is non-functional** — Just a static button with no handler.
5. **Flagged entries not institution-scoped** — Risk Factor Summary shows global flagged entries, not just from institution students.

### Changes

#### 1. `src/components/spoc/SPOCDashboardContent.tsx` — Fix report queries

**Appointments query** — Add `.in("student_id", studentIds)` to filter by institution students only (using the already-fetched `students` array).

**Peer sessions query** — Add `.in("student_id", studentIds)` filter.

**Quest completions query** — Add `.in("user_id", studentIds)` filter.

**Sound plays** — Remove or replace with a more meaningful institution metric (e.g., BlackBox session count for institution students, or mood entries count). Sound `play_count` is a global column on the track, not per-user/per-institution.

**Flagged entries** — Filter by institution student IDs.

#### 2. Add realtime refresh

Subscribe to `appointments`, `peer_sessions`, `quest_completions` INSERT events and invalidate the report query when new rows appear. Reuse the pattern already used for escalation realtime.

#### 3. Fix Export PDF button

Generate a simple text/CSV download of the report data (appointments count, peer sessions, quest completions, risk summary) with the selected date range. Full PDF generation would require a library — CSV export is practical and functional.

#### 4. Add auto-refresh indicator

Show a small "Live" dot next to the Reports header + last updated timestamp so SPOCs know data is current.

### Files Modified
- `src/components/spoc/SPOCDashboardContent.tsx` — Fix all report queries to be institution-scoped, add realtime subscription, fix export button

