

## Fix: Audit Log Shows Raw UUIDs Instead of Names

### Problem
The audit log displays raw database values — `actor_id` and `target_id` are shown as UUIDs instead of human-readable usernames. The current query tries to join via `profiles!audit_logs_actor_id_fkey`, but there's no foreign key on the `audit_logs` table, so this join likely fails silently.

### Fix

**File: `src/components/admin/AuditLogViewer.tsx`**

1. **Fetch a profiles lookup map**: Run a separate query to fetch all profiles (`id`, `username`) and build a `Map<uuid, username>`. This avoids relying on a non-existent FK join.

2. **Resolve actor_id and target_id to names**: Use the lookup map to display usernames wherever `actor_id` or `target_id` appears — in the collapsed row summary, the expanded detail section, and the search filter.

3. **Handle metadata usernames**: For metadata fields that contain UUIDs (like `student_id`, `user_id` in metadata JSON), also resolve those to names when possible.

### Changes

- Remove the broken FK join (`profiles!audit_logs_actor_id_fkey`) from the query — just select `*` from `audit_logs`
- Add a second query to fetch `profiles` (id, username) for all users, build a `Map`
- Create a helper `resolveName(id)` that returns username or truncated UUID fallback
- Replace all raw UUID displays:
  - Line 215: `log.actor?.username` → `resolveName(log.actor_id)`
  - Line 218: `log.target_id.slice(0, 8)…` → `resolveName(log.target_id)`
  - Line 238 (expanded Target ID): show resolved name next to the UUID
  - Line 251 (expanded Actor ID): show resolved name next to the UUID

### Files to Edit
- `src/components/admin/AuditLogViewer.tsx` — fix data fetching and name resolution

