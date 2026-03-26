

## Enhance Audit Log Viewer for Super Admin

### Current State
The `AuditLogViewer` component is minimal — it shows action type, timestamp, actor username, and target table. The `metadata` and `target_id` fields from the database are completely ignored. There's no filtering, searching, or expandable detail view.

### What We'll Build

**1. Rich log entries with expandable metadata details**
- Show action type badge (colored), actor name, target table, target ID, timestamp
- Expandable row to reveal full `metadata` JSON in a readable key-value format
- Show IP hash when available

**2. Filter & search bar**
- Text search across action types and actor names
- Dropdown filter by action type category (escalation, credit, account, system, etc.)
- Date range quick-filters: Last 24h, 7 days, 30 days, All

**3. Pagination**
- Load 50 per page with "Load More" button instead of hardcoded 100 limit

**4. Better action type coverage**
- Expand the color map to cover all action types found in the codebase: `role_assigned`, `spoc_qr_generated`, `admin_deleted_member`, `ai_l3_escalation`, `ai_risk_suggestion`, `account_deletion_requested`, `bulk_temp_ids_created`, `session_refund`, `bulk_members_created`, `l3_emergency_escalation`, `escalation_submitted`, `account_activated_via_temp_id`, `emergency_contact_accessed`, `credit_grant_bulk`, `credit_grant_individual`, `peer_session_flagged`, `member_created`, `indexnow_submit`

### Technical Details

**File**: `src/components/admin/AuditLogViewer.tsx` (rewrite)

- Add `useState` for search text, action filter, date filter
- Filter logs client-side (already fetching 100+, will increase to 200)
- Each log row becomes a collapsible card using `Collapsible` from shadcn
- Metadata rendered as formatted key-value pairs inside the expandable section
- Target ID shown with copy button
- Action categories grouped by prefix for the filter dropdown
- Uses existing UI components: `Input`, `Select`, `Badge`, `Collapsible`

### No database changes needed
All data (`metadata`, `target_id`, `ip_hash`) already exists in the `audit_logs` table — just not displayed.

